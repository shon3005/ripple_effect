import json
import os
import time
import asyncio

from fastapi import FastAPI, Depends, Body, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import Base, engine, SessionLocal
from models import Company

from openai import OpenAI
import yfinance as yf

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
async def generate_data_stream(completion):
    for chunk in completion:
        if hasattr(chunk.choices[0].delta, "content"):
            content = chunk.choices[0].delta.content
            if content and content is not None:
                await asyncio.sleep(0)
                yield json.dumps(content) + "\n"

class Message(BaseModel):
    message: str


# TODO: refactor parameters into a model
@app.post("/")
async def read_root(
    message: Message
):
#    return "message"
#    news = yf.Search("Google", news_count=10).news
#    news_titles = []
#    news_links = []
#    for n in news:
#        news_titles.append(n["title"])
#        news_links.append(n["link"])

    completion = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "system",
                "content": """
                You are given a news event, and the goal is to generate a network graph of potential outcomes. Return only a valid JSON string with the following requirements:\n\n
                Requirements:\n\n
                JSON Structure:\n
                    The JSON object must contain two arrays: "nodes" and "edges".\n\n
                Nodes:\n
                    Each node should have the following properties:\n
                        "id": A unique identifier for the node (e.g., "AA", "AB", ...).\n
                        "label": A descriptive label for the node (e.g., "Event: Klarna IPO", "Investor Sentiment Changes").\n
                        "type": A category assigned to the node. It must be one of these options: InitialEvent, Company, PostEvent, Sector/Industry, or Macro/GeoPolitical.\n
                Edges:\n
                    Each edge should be an object with two properties:\n
                        "source": The id of the starting node.\n
                        "target": The id of the ending node.\n
                """
            },
            {
                "role": "user",
                "content": message.message
            }
        ],
        stream=True,
    )
    
    return StreamingResponse(
        generate_data_stream(completion),
        media_type="text/event-stream",
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

