from celery import shared_task
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.domain import Stock, News
import datetime

@shared_task
def scrape_all_portfolio_news():
    """Scrape news for all portfolio stocks."""
    db: Session = SessionLocal()
    try:
        # Placeholder for actual scraping logic (e.g. NewsAPI, RSS)
        return "Scraped news"
    finally:
        db.close()

@shared_task
def aggregate_sentiment():
    """Run FinBERT on recent news and aggregate sentiment."""
    db: Session = SessionLocal()
    try:
        # Placeholder for FinBERT NLP pipeline
        return "Aggregated sentiment"
    finally:
        db.close()
