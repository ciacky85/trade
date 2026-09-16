from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime, JSON, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.core.database import Base
from sqlalchemy.dialects.postgresql import UUID

def generate_uuid():
    return str(uuid.uuid4())

class Portfolio(Base):
    __tablename__ = "portfolio"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    transactions = relationship("Transaction", back_populates="portfolio")
    analysis = relationship("Analysis", back_populates="portfolio")

class Stock(Base):
    __tablename__ = "stock"
    id = Column(String, primary_key=True, default=generate_uuid)
    ticker = Column(String, unique=True, index=True, nullable=False)
    company_name = Column(String, nullable=False)
    sector = Column(String)
    industry = Column(String)
    currency = Column(String, default="USD")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    transactions = relationship("Transaction", back_populates="stock")
    analysis = relationship("Analysis", back_populates="stock")
    chart_sources = relationship("ChartSource", back_populates="stock", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transaction"
    id = Column(String, primary_key=True, default=generate_uuid)
    portfolio_id = Column(String, ForeignKey("portfolio.id"), nullable=False)
    stock_id = Column(String, ForeignKey("stock.id"), nullable=False)
    type = Column(String, nullable=False) # BUY or SELL
    date = Column(DateTime(timezone=True), nullable=False)
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    fees = Column(Float, default=0.0)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    portfolio = relationship("Portfolio", back_populates="transactions")
    stock = relationship("Stock", back_populates="transactions")

class ChartSource(Base):
    __tablename__ = "chart_source"
    id = Column(String, primary_key=True, default=generate_uuid)
    stock_id = Column(String, ForeignKey("stock.id"), nullable=False)
    url = Column(String, nullable=False)
    source_type = Column(String, nullable=False) # e.g., 'tradingview'
    last_scraped_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)

    stock = relationship("Stock", back_populates="chart_sources")

class News(Base):
    __tablename__ = "news"
    id = Column(String, primary_key=True, default=generate_uuid)
    stock_id = Column(String, ForeignKey("stock.id"), nullable=False)
    title = Column(String, nullable=False)
    url = Column(String, unique=True, nullable=False)
    source = Column(String)
    published_at = Column(DateTime(timezone=True), nullable=False)
    sentiment_score = Column(Float)
    sentiment_label = Column(String) # POSITIVE, NEGATIVE, NEUTRAL
    impact_level = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Analysis(Base):
    __tablename__ = "analysis"
    id = Column(String, primary_key=True, default=generate_uuid)
    portfolio_id = Column(String, ForeignKey("portfolio.id"))
    stock_id = Column(String, ForeignKey("stock.id"), nullable=False)
    strategy_used = Column(String, nullable=False)
    timeframe = Column(String, nullable=False)
    recommendation = Column(String) # STRONG_BUY, BUY, HOLD, SELL, STRONG_SELL
    confidence_score = Column(Float)
    indicators_json = Column(JSON)
    signals_json = Column(JSON)
    scenarios_json = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    portfolio = relationship("Portfolio", back_populates="analysis")
    stock = relationship("Stock", back_populates="analysis")
    predictions = relationship("Prediction", back_populates="analysis")

class Prediction(Base):
    __tablename__ = "prediction"
    id = Column(String, primary_key=True, default=generate_uuid)
    analysis_id = Column(String, ForeignKey("analysis.id"), nullable=False)
    target_date = Column(DateTime(timezone=True), nullable=False)
    scenario_type = Column(String, nullable=False) # BULLISH, BEARISH, NEUTRAL
    predicted_open = Column(Float)
    predicted_high = Column(Float)
    predicted_low = Column(Float)
    predicted_close = Column(Float)
    confidence = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    analysis = relationship("Analysis", back_populates="predictions")
