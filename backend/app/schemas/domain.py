from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PortfolioBase(BaseModel):
    name: str
    description: Optional[str] = None

class PortfolioCreate(PortfolioBase):
    pass

class Portfolio(PortfolioBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StockBase(BaseModel):
    ticker: str
    company_name: str
    sector: Optional[str] = None
    industry: Optional[str] = None
    currency: Optional[str] = "USD"

class StockCreate(StockBase):
    pass

class Stock(StockBase):
    id: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True
