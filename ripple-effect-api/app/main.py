import json
import os

from enum import Enum
from typing import List
from fastapi import FastAPI, Depends
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from pydantic import BaseModel, model_validator

from database import Base, engine, SessionLocal
from models import Company

from openai import OpenAI

origins = [
    "http://host.docker.internal:3000",
    "http://localhost:3000",
    "http://0.0.0.0:3000",
]

# Initialize the database
Base.metadata.create_all(bind=engine)

app = FastAPI()

openai_api_key = os.environ["OPENAI_API_KEY"]
client = OpenAI(api_key=openai_api_key)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# TODO: put into utils folder
async def generate_json_stream(stream):
    for event in stream:
        if event.type == "content.delta":
            if event.parsed is not None:
                # Print the parsed data as JSON
                print("content.delta parsed:", event.parsed)
                yield json.dumps(event.parsed)
        elif event.type == "content.done":
            print("content.done")
        elif event.type == "error":
            print("Error in stream:", event.error)

class Message(BaseModel):
    message: str

class EventEnum(str, Enum):
    InitialEvent = "InitialEvent"
    Company = "Company"
    PostEvent = "PostEvent"
    SectorIndustry = "Sector/Industry"
    MacroGeoPolitical = "Macro/GeoPolitical"

class Node(BaseModel):
    id: str
    type: EventEnum
    label: str

class Edge(BaseModel):
    source: str
    target: str

class GraphModel(BaseModel):
    nodes: List[Node]
    edges: List[Edge]

    @model_validator(mode="after")
    def check_edges(cls, instance: "GraphModel") -> "GraphModel":
        node_ids = {node.id for node in instance.nodes}
        for edge in instance.edges:
            if edge.source not in node_ids:
                raise ValueError(f"Edge source {edge.source} does not exist among the nodes")
            if edge.target not in node_ids:
                raise ValueError(f"Edge target {edge.target} does not exist among the nodes")
        return instance

# TODO: refactor parameters into a model
@app.post("/")
async def read_root(
    message: Message
):
    # Prepare the messages and function description
    messages = [
        {
            "role": "system",
            "content": (
                "You are an investment analyst that returns graphs in JSON format following a specific schema. "
                "Generate a causal network graph with the initial event passed by the user role. "
                "Include nodes for Investor Sentiment Changes, Market Valuation Fluctuations, Increased Product Awareness, "
                "Regulatory Scrutiny & Compliance Pressure, Increased Investment in Sector, Consumer Adoption of Product, "
                "Market Expansion, as well as companies / competitors affected, "
                "and consider sector/industry factors (Sector Innovation, Sector Growth, "
                "Traditional Systems Under Pressure, Changing Consumer Preferences) and macroeconomic/geo-political "
                "factors (Economic Climate Uncertainty, Global Competition in Sector). "
                "Return the output strictly in valid JSON according to the provided schema. "
            )
        },
        {
            "role": "user",
            "content": message.message 
        }
    ]

    # Call the OpenAI API with a function call to output the structured JSON
    async def stream_generator():
        with client.beta.chat.completions.stream(
            model="gpt-4o",  # or your desired GPT-4 model version
            messages=messages,
            response_format=GraphModel,
        ) as stream:
            async for data in generate_json_stream(stream):
                yield data

    return StreamingResponse(
        stream_generator(),
        media_type="application/json",
    )

@app.post("/companies/")
def create_company(name: str, industry: str, description: str, db: Session = Depends(get_db)):
    '''
    This is a dummy endpoint just to remind me what a post request looks like
    '''
    new_company = Company(name=name, industry=industry, description=description)
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

