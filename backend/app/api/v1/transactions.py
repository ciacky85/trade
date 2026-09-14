from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from app.core.database import get_db
from app.models import domain as models

router = APIRouter()

class TransactionCreate(BaseModel):
    ticker: str
    company_name: Optional[str] = None
    type: str  # BUY or SELL
    date: Optional[datetime] = None
    quantity: float
    price: float
    fees: Optional[float] = 0.0
    notes: Optional[str] = ""

@router.get("/")
def get_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    txs = db.query(models.Transaction).order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()
    results = []
    for tx in txs:
        results.append({
            "id": tx.id,
            "ticker": tx.stock.ticker if tx.stock else "",
            "company_name": tx.stock.company_name if tx.stock else "",
            "type": tx.type,
            "date": tx.date.isoformat() if tx.date else "",
            "quantity": tx.quantity,
            "price": tx.price,
            "total": round(tx.quantity * tx.price, 2),
            "fees": tx.fees,
            "notes": tx.notes,
            "created_at": tx.created_at.isoformat() if tx.created_at else ""
        })
    return results

@router.post("/")
def create_transaction(tx_in: TransactionCreate, db: Session = Depends(get_db)):
    ticker_clean = tx_in.ticker.strip().upper()
    if not ticker_clean:
        raise HTTPException(status_code=400, detail="Ticker is required")
        
    # Find or create default portfolio
    portfolio = db.query(models.Portfolio).first()
    if not portfolio:
        portfolio = models.Portfolio(name="Main Portfolio", description="Primary Trading Portfolio")
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)
        
    # Find or create stock
    stock = db.query(models.Stock).filter(models.Stock.ticker == ticker_clean).first()
    if not stock:
        company = tx_in.company_name or f"{ticker_clean} Corporation"
        stock = models.Stock(ticker=ticker_clean, company_name=company)
        db.add(stock)
        db.commit()
        db.refresh(stock)
        
    tx_date = tx_in.date or datetime.utcnow()
    new_tx = models.Transaction(
        portfolio_id=portfolio.id,
        stock_id=stock.id,
        type=tx_in.type.upper(),
        date=tx_date,
        quantity=tx_in.quantity,
        price=tx_in.price,
        fees=tx_in.fees or 0.0,
        notes=tx_in.notes or ""
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)
    
    return {
        "id": new_tx.id,
        "ticker": stock.ticker,
        "company_name": stock.company_name,
        "type": new_tx.type,
        "date": new_tx.date.isoformat(),
        "quantity": new_tx.quantity,
        "price": new_tx.price,
        "total": round(new_tx.quantity * new_tx.price, 2),
        "fees": new_tx.fees,
        "notes": new_tx.notes
    }

@router.delete("/{transaction_id}")
def delete_transaction(transaction_id: str, db: Session = Depends(get_db)):
    tx = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted successfully"}
