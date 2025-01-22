from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import Base, engine, SessionLocal
from models import Company
from fastapi.middleware.cors import CORSMiddleware

origins = [
    "http://host.docker.internal:3000",
]

# Initialize the database
Base.metadata.create_all(bind=engine)

app = FastAPI()

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

@app.get("/")
def read_root():
    print("hello world")
    return {"message": "Welcome to the company tracker API!"}

@app.post("/companies/")
def create_company(name: str, industry: str, description: str, db: Session = Depends(get_db)):
    new_company = Company(name=name, industry=industry, description=description)
    db.add(new_company)
    db.commit()
    db.refresh(new_company)
    return new_company

