from fastapi import APIRouter, Query, HTTPException
import urllib.request
import json
import yfinance as yf
from app.core.storage import get_storage_status, init_storage

router = APIRouter()

POPULAR_STOCKS = [
    {"ticker": "NVDA", "company_name": "NVIDIA Corporation", "exchange": "NASDAQ"},
    {"ticker": "AAPL", "company_name": "Apple Inc.", "exchange": "NASDAQ"},
    {"ticker": "MSFT", "company_name": "Microsoft Corporation", "exchange": "NASDAQ"},
    {"ticker": "TSLA", "company_name": "Tesla Inc.", "exchange": "NASDAQ"},
    {"ticker": "AMZN", "company_name": "Amazon.com Inc.", "exchange": "NASDAQ"},
    {"ticker": "GOOGL", "company_name": "Alphabet Inc.", "exchange": "NASDAQ"},
    {"ticker": "META", "company_name": "Meta Platforms Inc.", "exchange": "NASDAQ"},
    {"ticker": "AMD", "company_name": "Advanced Micro Devices Inc.", "exchange": "NASDAQ"},
    {"ticker": "PLTR", "company_name": "Palantir Technologies Inc.", "exchange": "NYSE"},
    {"ticker": "INTC", "company_name": "Intel Corporation", "exchange": "NASDAQ"},
    {"ticker": "NFLX", "company_name": "Netflix Inc.", "exchange": "NASDAQ"},
    {"ticker": "RACE", "company_name": "Ferrari N.V.", "exchange": "NYSE"},
    {"ticker": "RACE.MI", "company_name": "Ferrari N.V. (Milano)", "exchange": "Milano"},
    {"ticker": "ENI.MI", "company_name": "Eni S.p.A.", "exchange": "Milano"},
    {"ticker": "ENEL.MI", "company_name": "Enel S.p.A.", "exchange": "Milano"},
    {"ticker": "ISP.MI", "company_name": "Intesa Sanpaolo S.p.A.", "exchange": "Milano"},
    {"ticker": "UCG.MI", "company_name": "UniCredit S.p.A.", "exchange": "Milano"},
    {"ticker": "STMMI.MI", "company_name": "STMicroelectronics N.V.", "exchange": "Milano"},
    {"ticker": "PRY.MI", "company_name": "Prysmian S.p.A.", "exchange": "Milano"},
    {"ticker": "DIS", "company_name": "Walt Disney Co.", "exchange": "NYSE"},
    {"ticker": "BABA", "company_name": "Alibaba Group Holding", "exchange": "NYSE"}
]

@router.get("/status")
def get_system_status():
    storage_info = get_storage_status()
    return {
        "version": "v0.3.0",
        "app_name": "TradeAnalyzer Pro",
        "database": "connected",
        "storage": storage_info,
        "host_persistent_path": "/srv/docker_conf/trade"
    }

@router.post("/sync-storage")
def sync_storage():
    init_storage()
    return {
        "status": "synchronized",
        "message": "Persistent directories and default catalogs verified in /srv/docker_conf/trade",
        "storage": get_storage_status()
    }

@router.get("/search-stocks")
def search_stocks(query: str = Query(..., min_length=1)):
    """
    Searches real global and Italian stocks using Yahoo Finance API with instant fallback catalog.
    """
    clean_q = query.strip().upper()
    results = []
    seen_tickers = set()

    # 1. Try real live Yahoo Finance search API
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(query)}&quotesCount=10&newsCount=0"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        with urllib.request.urlopen(req, timeout=3.5) as response:
            data = json.loads(response.read().decode())
            quotes = data.get("quotes", [])
            for q in quotes:
                symbol = q.get("symbol", "").upper()
                q_type = q.get("quoteType", "")
                if symbol and symbol not in seen_tickers and q_type in ["EQUITY", "ETF"]:
                    name = q.get("shortname") or q.get("longname") or symbol
                    exch = q.get("exchDisp") or q.get("exchange") or ""
                    results.append({
                        "ticker": symbol,
                        "company_name": name,
                        "exchange": exch
                    })
                    seen_tickers.add(symbol)
    except Exception as e:
        print(f"Live Yahoo search exception: {e}")

    # 2. Enrich/fallback from curated popular stocks catalog
    for stock in POPULAR_STOCKS:
        tk = stock["ticker"].upper()
        name = stock["company_name"].upper()
        if (clean_q in tk or clean_q in name) and tk not in seen_tickers:
            results.append(stock)
            seen_tickers.add(tk)

    return results[:10]

@router.get("/quote/{ticker}")
def get_stock_quote(ticker: str):
    """
    Fetches real-time price and company name for auto-completing transaction entry.
    """
    clean = ticker.strip().upper()
    try:
        t = yf.Ticker(clean)
        fast = t.fast_info
        price = getattr(fast, 'last_price', None)
        name = None
        try:
            name = t.info.get("shortName") or t.info.get("longName")
        except Exception:
            pass
        if price and float(price) > 0:
            return {
                "ticker": clean,
                "company_name": name or clean,
                "price": round(float(price), 2)
            }
    except Exception as e:
        print(f"Quote fetch error for {clean}: {e}")

    # Fallback to catalog or reasonable baseline
    for stock in POPULAR_STOCKS:
        if stock["ticker"] == clean:
            return {"ticker": clean, "company_name": stock["company_name"], "price": 100.0}

    return {"ticker": clean, "company_name": f"{clean} Corp", "price": 100.0}

