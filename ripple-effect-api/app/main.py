import json
import os
import time

from fastapi import FastAPI, Depends, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import Base, engine, SessionLocal
from models import Company

from openai import OpenAI
import yfinance as yf

origins = [
    "http://host.docker.internal:3000",
    "http://localhost:3000",
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
                yield json.dumps(content) + "\n"

# TODO: refactor parameters into a model
@app.post("/")
async def read_root(
    message: str = Form(None),
    file: UploadFile = File(None)
):
    print("MESSAGE", message)
    print("FILE", file)
    return "message"
#    news = yf.Search("Google", news_count=10).news
#    news_titles = []
#    news_links = []
#    for n in news:
#        news_titles.append(n["title"])
#        news_links.append(n["link"])
#
#    completion = client.chat.completions.create(
#        model="gpt-4o",
#        messages=[
#            {"role": "system", "content": """You are given a piece of news information, and the goal is to evaluate which companies and sectors are likely to be impacted. You are required to provide a list of publicly traded companies at the end of the output. The analysis should consider both immediate and long-term effects on companies, sectors, and market sentiment. You need to follow the steps below to generate your output: \n\n
#                1. Summarize the core of the news event \n
#                2. Identify the broader context \n
#                3. Determine affected sectors and industries \n
#                4. Pinpoint relevant sub-sectors or themes \n
#                5. Analyze key financial metrics impacted by the news \n
#                6. Evaluate competitive impacts \n
#                7. Assess the timeline of impacts \n
#                8. Anticipate market sentiment shifts \n
#                9. Evaluate stock valuations based on financial models \n
#                10. Monitor analyst and expert reactions \n
#             """},
#            {
#                "role": "user",
#                "content": news_titles[0]
#            }
#        ],
#        stream=True,
#    )
#    
#    return StreamingResponse(
#        generate_data_stream(completion),
#        media_type="text/event-stream",
#    )

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

