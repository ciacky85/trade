from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import domain

from app.api.v1.api import api_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TradeAnalyzer Pro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
