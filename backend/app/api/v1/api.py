from fastapi import APIRouter
from app.api.v1 import portfolio, transactions, chart_sources, analysis, knowledge, news, system

api_router = APIRouter()

api_router.include_router(portfolio.router, prefix="/portfolios", tags=["portfolios"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(chart_sources.router, prefix="/chart-sources", tags=["chart-sources"])
api_router.include_router(analysis.router, prefix="/analysis", tags=["analysis"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
api_router.include_router(news.router, prefix="/news", tags=["news"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
