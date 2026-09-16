from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.core.database import get_db
from app.models import domain as models

router = APIRouter()

class ChartSourceCreate(BaseModel):
    ticker: str
    url: str
    source_type: Optional[str] = "tradingview"

@router.get("/")
def get_chart_sources(db: Session = Depends(get_db)):
    try:
        sources = (
            db.query(models.ChartSource, models.Stock)
            .outerjoin(models.Stock, models.ChartSource.stock_id == models.Stock.id)
            .order_by(models.ChartSource.created_at.desc())
            .all()
        )
        results = []
        for s, stock in sources:
            results.append({
                "id": s.id,
                "ticker": stock.ticker if stock else "",
                "company_name": stock.company_name if stock else "",
                "url": s.url,
                "source_type": s.source_type,
                "last_scraped_at": s.last_scraped_at.isoformat() if s.last_scraped_at else None,
                "created_at": s.created_at.isoformat() if s.created_at else "",
                "is_active": s.is_active
            })
        return results
    except Exception as e:
        print(f"Error fetching chart sources: {e}")
        raise HTTPException(status_code=500, detail=f"Errore caricamento fonti grafici: {str(e)}")

@router.post("/")
def create_chart_source(source_in: ChartSourceCreate, db: Session = Depends(get_db)):
    ticker_clean = source_in.ticker.strip().upper()
    if not ticker_clean:
        raise HTTPException(status_code=400, detail="Ticker is required")
    if not source_in.url.strip():
        raise HTTPException(status_code=400, detail="URL is required")
        
    stock = db.query(models.Stock).filter(models.Stock.ticker == ticker_clean).first()
    if not stock:
        stock = models.Stock(ticker=ticker_clean, company_name=f"{ticker_clean}")
        db.add(stock)
        db.commit()
        db.refresh(stock)
        
    new_source = models.ChartSource(
        stock_id=stock.id,
        url=source_in.url.strip(),
        source_type=source_in.source_type or "tradingview",
        last_scraped_at=datetime.utcnow()
    )
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    
    return {
        "id": new_source.id,
        "ticker": stock.ticker,
        "company_name": stock.company_name,
        "url": new_source.url,
        "source_type": new_source.source_type,
        "created_at": new_source.created_at.isoformat() if new_source.created_at else "",
        "status": "active"
    }

@router.delete("/{source_id}")
def delete_chart_source(source_id: str, db: Session = Depends(get_db)):
    src = db.query(models.ChartSource).filter(models.ChartSource.id == source_id).first()
    if not src:
        raise HTTPException(status_code=404, detail="Chart source not found")
    db.delete(src)
    db.commit()
    return {"message": "Chart source deleted successfully"}
