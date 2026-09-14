from celery import Celery
from celery.schedules import crontab
from app.core.config import settings

celery_app = Celery(
    "trade_analyzer",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.workers.market_tasks", "app.workers.news_tasks", "app.workers.analysis_tasks"]
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

celery_app.conf.beat_schedule = {
    'update-prices-every-15-mins': {
        'task': 'app.workers.market_tasks.update_stock_prices',
        'schedule': crontab(minute='*/15'),
    },
    'scrape-news-hourly': {
        'task': 'app.workers.news_tasks.scrape_all_portfolio_news',
        'schedule': crontab(minute=0),
    },
    'aggregate-sentiment-hourly': {
        'task': 'app.workers.news_tasks.aggregate_sentiment',
        'schedule': crontab(minute=30),
    },
    'run-analysis-daily': {
        'task': 'app.workers.analysis_tasks.run_portfolio_analysis',
        'schedule': crontab(hour=0, minute=0),
    },
}
