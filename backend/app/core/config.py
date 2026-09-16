from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://tradeuser:tradepass@db:5432/tradedb")
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://redis:6379/0")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "supersecretkey_change_in_production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    FINBERT_MODEL: str = "ProsusAI/finbert"
    STORAGE_PATH: str = os.getenv("STORAGE_PATH", "/app/storage")
    STORAGE_DIR: str = os.getenv("STORAGE_DIR", os.getenv("STORAGE_PATH", "/app/storage"))

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "allow"

settings = Settings()

