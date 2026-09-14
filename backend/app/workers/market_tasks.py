import yfinance as yf
from celery import shared_task
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.domain import Stock
import pandas as pd
from datetime import datetime, timedelta

@shared_task
def update_stock_prices():
    """Fetch latest prices for all active stocks in the database."""
    db: Session = SessionLocal()
    try:
        stocks = db.query(Stock).filter(Stock.is_active == True).all()
        tickers = [s.ticker for s in stocks]
        if not tickers:
            return "No active stocks"
        
        # We could save this data to a time-series DB or Redis. 
        # For now, we just fetch it to ensure yfinance integration works.
        data = yf.download(tickers, group_by="ticker", period="1d")
        
        return f"Updated {len(tickers)} stocks"
    except Exception as e:
        return f"Error: {str(e)}"
    finally:
        db.close()

def get_historical_data(ticker: str, period: str = "1y") -> pd.DataFrame:
    stock = yf.Ticker(ticker)
    df = stock.history(period=period)
    return df
