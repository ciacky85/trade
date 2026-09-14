from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models import domain as models
from app.schemas import domain as schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.Portfolio])
def get_portfolios(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Portfolio).offset(skip).limit(limit).all()

@router.post("/", response_model=schemas.Portfolio)
def create_portfolio(portfolio: schemas.PortfolioCreate, db: Session = Depends(get_db)):
    db_portfolio = models.Portfolio(**portfolio.model_dump())
    db.add(db_portfolio)
    db.commit()
    db.refresh(db_portfolio)
    return db_portfolio

@router.get("/{portfolio_id}", response_model=schemas.Portfolio)
def get_portfolio(portfolio_id: str, db: Session = Depends(get_db)):
    db_portfolio = db.query(models.Portfolio).filter(models.Portfolio.id == portfolio_id).first()
    if db_portfolio is None:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return db_portfolio
