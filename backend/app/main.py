import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.database import engine, Base
from app.models import domain
from app.api.v1.api import api_router
from app.core.storage import init_storage

# Retry creating tables in case Postgres takes a few seconds to start
for attempt in range(5):
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables initialized successfully.")
        break
    except Exception as e:
        print(f"Waiting for database connection (attempt {attempt+1}/5): {e}")
        time.sleep(2)

# Initialize persistent storage directories
try:
    init_storage()
    print("Persistent storage directories and default catalogs initialized.")
except Exception as e:
    print(f"Error initializing persistent storage: {e}")

app = FastAPI(
    title="TradeAnalyzer Pro API",
    version="v0.5.0",
    description="Professional algorithmic trading analysis, candlestick detection, and portfolio engine."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/api/health")
def health_check():
    return {"status": "ok", "version": "v0.5.0"}
