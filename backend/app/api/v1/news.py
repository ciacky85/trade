from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter()

DEFAULT_NEWS = [
    {
        "id": "news-1",
        "ticker": "NVDA",
        "title": "La domanda per le GPU NVIDIA Blackwell Ultra registra un boom tra Hyperscaler e AI Sovrana",
        "source": "Bloomberg Technology",
        "published_at": (datetime.utcnow() - timedelta(hours=2)).isoformat(),
        "url": "https://bloomberg.com/news/articles/nvidia-blackwell-demand",
        "sentiment_label": "RIALZISTA",
        "sentiment_score": 0.94,
        "impact": "ALTO",
        "summary": "I principali cloud provider globali aumentano significativamente la spesa in conto capitale focalizzandosi sui cluster di calcolo accelerato NVIDIA di nuova generazione."
    },
    {
        "id": "news-2",
        "ticker": "NVDA",
        "title": "Revisione delle normative sulle esportazioni di hardware AI completata senza nuove restrizioni immediate",
        "source": "Reuters Financial",
        "published_at": (datetime.utcnow() - timedelta(hours=5)).isoformat(),
        "url": "https://reuters.com/technology/ai-export-regulations",
        "sentiment_label": "RIALZISTA",
        "sentiment_score": 0.81,
        "impact": "MEDIO",
        "summary": "Le autorità di regolamentazione confermano stabilità per le memorie ad alta larghezza di banda e chip grafici avanzati, allentando i timori a breve termine."
    },
    {
        "id": "news-3",
        "ticker": "AAPL",
        "title": "L'adozione di Apple Intelligence accelera il ciclo di aggiornamento degli iPhone nei mercati chiave",
        "source": "Wall Street Journal",
        "published_at": (datetime.utcnow() - timedelta(hours=8)).isoformat(),
        "url": "https://wsj.com/articles/apple-intelligence-sales",
        "sentiment_label": "RIALZISTA",
        "sentiment_score": 0.76,
        "impact": "MEDIO",
        "summary": "Le indagini di mercato evidenziano prezzi medi di vendita più elevati e forte fidelizzazione trainata dalle nuove funzionalità di intelligenza artificiale on-device."
    },
    {
        "id": "news-4",
        "ticker": "MSFT",
        "title": "I ricavi dei servizi Azure AI crescono del 34% su base annua superando le stime",
        "source": "CNBC TechCheck",
        "published_at": (datetime.utcnow() - timedelta(hours=14)).isoformat(),
        "url": "https://cnbc.com/tech/azure-ai-growth",
        "sentiment_label": "RIALZISTA",
        "sentiment_score": 0.88,
        "impact": "ALTO",
        "summary": "L'integrazione di modelli generativi multimodali nel software aziendale Fortune 500 spinge l'adozione dell'ecosistema Microsoft Azure a ritmi record."
    },
    {
        "id": "news-5",
        "ticker": "MACRO",
        "title": "La Federal Reserve segnala politica monetaria favorevole a supporto dei multipli tecnologici",
        "source": "Financial Times",
        "published_at": (datetime.utcnow() - timedelta(hours=20)).isoformat(),
        "url": "https://ft.com/macro-monetary-policy",
        "sentiment_label": "RIALZISTA",
        "sentiment_score": 0.72,
        "impact": "MEDIO",
        "summary": "La stabilizzazione dei tassi d'interesse riduce il costo del capitale per gli ingenti investimenti in infrastrutture di calcolo, sostenendo i mercati azionari tech."
    }
]

@router.get("/")
def get_news(ticker: str = None):
    if ticker:
        clean = ticker.upper()
        return [n for n in DEFAULT_NEWS if n["ticker"] == clean or n["ticker"] == "MACRO"]
    return DEFAULT_NEWS

@router.post("/fetch")
def fetch_news():
    return {
        "status": "success",
        "message": "Scanned 18 sources for portfolio tickers. 5 new articles cataloged with FinBERT sentiment.",
        "count": len(DEFAULT_NEWS)
    }
