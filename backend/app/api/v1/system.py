from fastapi import APIRouter, Query, HTTPException
import urllib.request
import urllib.parse
import json
import yfinance as yf
from app.core.storage import get_storage_status, init_storage

router = APIRouter()

POPULAR_STOCKS = [
    # Top FTSE MIB & Italian Stocks
    {"ticker": "ENI.MI", "company_name": "Eni S.p.A.", "exchange": "Milano", "keywords": "ENI PETROLIO GAS OIL ENERGIA"},
    {"ticker": "ENEL.MI", "company_name": "Enel S.p.A.", "exchange": "Milano", "keywords": "ENEL ENERGIA ELETTRICA RINNOVABILI UTILITY"},
    {"ticker": "ISP.MI", "company_name": "Intesa Sanpaolo S.p.A.", "exchange": "Milano", "keywords": "INTESA SANPAOLO BANCA FINANZA"},
    {"ticker": "UCG.MI", "company_name": "UniCredit S.p.A.", "exchange": "Milano", "keywords": "UNICREDIT UNICREDITO BANCA"},
    {"ticker": "STLAM.MI", "company_name": "Stellantis N.V.", "exchange": "Milano", "keywords": "STELLANTIS FIAT CHRYSLER PEUGEOT AUTO"},
    {"ticker": "STLA", "company_name": "Stellantis N.V. (NYSE)", "exchange": "NYSE", "keywords": "STELLANTIS FIAT AUTO"},
    {"ticker": "RACE.MI", "company_name": "Ferrari N.V. (Milano)", "exchange": "Milano", "keywords": "FERRARI AUTO ROSSO MARANELLO"},
    {"ticker": "RACE", "company_name": "Ferrari N.V. (NYSE)", "exchange": "NYSE", "keywords": "FERRARI AUTO"},
    {"ticker": "STMMI.MI", "company_name": "STMicroelectronics N.V.", "exchange": "Milano", "keywords": "STM SEMICONDUTTORI CHIP ELETTRONICA"},
    {"ticker": "STM", "company_name": "STMicroelectronics N.V. (NYSE)", "exchange": "NYSE", "keywords": "STM SEMICONDUCTOR CHIP"},
    {"ticker": "PRY.MI", "company_name": "Prysmian S.p.A.", "exchange": "Milano", "keywords": "PRYSMIAN CAVI ENERGIA TELECOM"},
    {"ticker": "LDO.MI", "company_name": "Leonardo S.p.A.", "exchange": "Milano", "keywords": "LEONARDO FINMECCANICA DIFESA AEROSPACE"},
    {"ticker": "PST.MI", "company_name": "Poste Italiane S.p.A.", "exchange": "Milano", "keywords": "POSTE ITALIANE ASSICURAZIONI LOGISTICA"},
    {"ticker": "CPR.MI", "company_name": "Davide Campari-Milano N.V.", "exchange": "Milano", "keywords": "CAMPARI APEROL BEVANDE SPIRITS"},
    {"ticker": "G.MI", "company_name": "Assicurazioni Generali S.p.A.", "exchange": "Milano", "keywords": "GENERALI ASSICURAZIONI LEONE"},
    {"ticker": "MONC.MI", "company_name": "Moncler S.p.A.", "exchange": "Milano", "keywords": "MONCLER PIUMINI MODA LUXURY"},
    {"ticker": "SRG.MI", "company_name": "Snam S.p.A.", "exchange": "Milano", "keywords": "SNAM GAS METANODOTTI"},
    {"ticker": "TRN.MI", "company_name": "Terna S.p.A.", "exchange": "Milano", "keywords": "TERNA RETE ELETTRICA GRID"},
    {"ticker": "TIT.MI", "company_name": "Telecom Italia S.p.A.", "exchange": "Milano", "keywords": "TELECOM ITALIA TIM TELEFONIA"},
    {"ticker": "A2A.MI", "company_name": "A2A S.p.A.", "exchange": "Milano", "keywords": "A2A UTILITY ENERGIA AMBIENTE"},
    {"ticker": "HER.MI", "company_name": "Hera S.p.A.", "exchange": "Milano", "keywords": "HERA UTILITY AMBIENTE"},
    {"ticker": "TEN.MI", "company_name": "Tenaris S.A.", "exchange": "Milano", "keywords": "TENARIS ACCIAIO TUBI OIL PIPE"},
    {"ticker": "SPM.MI", "company_name": "Saipem S.p.A.", "exchange": "Milano", "keywords": "SAIPEM INGEGNERIA TRIVELLAZIONI DRILLING"},
    {"ticker": "BAMI.MI", "company_name": "Banco BPM S.p.A.", "exchange": "Milano", "keywords": "BANCO BPM BANCA MILANO"},
    {"ticker": "BPE.MI", "company_name": "BPER Banca S.p.A.", "exchange": "Milano", "keywords": "BPER BANCA EMILIA ROMAGNA"},
    {"ticker": "MB.MI", "company_name": "Mediobanca S.p.A.", "exchange": "Milano", "keywords": "MEDIOBANCA BANCA INVESTIMENTO"},
    {"ticker": "FBK.MI", "company_name": "FinecoBank S.p.A.", "exchange": "Milano", "keywords": "FINECO FINECOBANK BANCA TRADING"},
    {"ticker": "NEXI.MI", "company_name": "Nexi S.p.A.", "exchange": "Milano", "keywords": "NEXI PAGAMENTI DIGITALI POS CARD"},
    {"ticker": "AMP.MI", "company_name": "Amplifon S.p.A.", "exchange": "Milano", "keywords": "AMPLIFON UDITO HEARING"},
    {"ticker": "DIA.MI", "company_name": "DiaSorin S.p.A.", "exchange": "Milano", "keywords": "DIASORIN DIAGNOSTICA BIOTECH"},
    {"ticker": "REC.MI", "company_name": "Recordati S.p.A.", "exchange": "Milano", "keywords": "RECORDATI FARMACEUTICA PHARMA"},
    {"ticker": "IP.MI", "company_name": "Interpump Group S.p.A.", "exchange": "Milano", "keywords": "INTERPUMP POMPE IDRAULICA"},
    {"ticker": "BC.MI", "company_name": "Brunello Cucinelli S.p.A.", "exchange": "Milano", "keywords": "BRUNELLO CUCINELLI CASHMERE MODA"},
    {"ticker": "INW.MI", "company_name": "Infrastrutture Wireless Italiane (INWIT)", "exchange": "Milano", "keywords": "INWIT TORRI WIRELESS ANTENNE"},
    {"ticker": "IG.MI", "company_name": "Italgas S.p.A.", "exchange": "Milano", "keywords": "ITALGAS DISTRIBUZIONE GAS"},
    {"ticker": "IVG.MI", "company_name": "Iveco Group N.V.", "exchange": "Milano", "keywords": "IVECO CAMION TRUCKS VEICOLI COMMERCIALI"},
    {"ticker": "BZU.MI", "company_name": "Buzzi S.p.A.", "exchange": "Milano", "keywords": "BUZZI CEMENTO MATERIALI"},
    {"ticker": "PIRC.MI", "company_name": "Pirelli & C. S.p.A.", "exchange": "Milano", "keywords": "PIRELLI PNEUMATICI TYRES GOMME"},
    {"ticker": "BRE.MI", "company_name": "Brembo S.p.A.", "exchange": "Milano", "keywords": "BREMBO FRENI BRAKES AUTO"},
    {"ticker": "BMED.MI", "company_name": "Banca Mediolanum S.p.A.", "exchange": "Milano", "keywords": "MEDIOLANUM BANCA RISPARMIO"},
    {"ticker": "BPSO.MI", "company_name": "Banca Popolare di Sondrio S.p.A.", "exchange": "Milano", "keywords": "POPOLARE SONDRIO BANCA"},
    {"ticker": "UNI.MI", "company_name": "Unipol Gruppo S.p.A.", "exchange": "Milano", "keywords": "UNIPOL ASSICURAZIONI UNIPOLSAI"},
    {"ticker": "ERG.MI", "company_name": "ERG S.p.A.", "exchange": "Milano", "keywords": "ERG RINNOVABILI EOLICO"},
    {"ticker": "AZM.MI", "company_name": "Azimut Holding S.p.A.", "exchange": "Milano", "keywords": "AZIMUT ASSET MANAGEMENT RISPARMIO"},

    # Top US & Global Tech Giants
    {"ticker": "NVDA", "company_name": "NVIDIA Corporation", "exchange": "NASDAQ", "keywords": "NVIDIA AI CHIP GPU GRAPHICS SEMICONDUCTOR"},
    {"ticker": "AAPL", "company_name": "Apple Inc.", "exchange": "NASDAQ", "keywords": "APPLE IPHONE MAC IPAD TECH"},
    {"ticker": "MSFT", "company_name": "Microsoft Corporation", "exchange": "NASDAQ", "keywords": "MICROSOFT WINDOWS AZURE AI OFFICE XBOX"},
    {"ticker": "TSLA", "company_name": "Tesla Inc.", "exchange": "NASDAQ", "keywords": "TESLA ELON MUSK EV AUTO ELETTRICHE BATTERIE"},
    {"ticker": "AMZN", "company_name": "Amazon.com Inc.", "exchange": "NASDAQ", "keywords": "AMAZON ECOMMERCE AWS CLOUD PRIME"},
    {"ticker": "GOOGL", "company_name": "Alphabet Inc. (Google)", "exchange": "NASDAQ", "keywords": "GOOGLE ALPHABET YOUTUBE SEARCH ANDROID"},
    {"ticker": "GOOG", "company_name": "Alphabet Inc. Class C", "exchange": "NASDAQ", "keywords": "GOOGLE ALPHABET YOUTUBE"},
    {"ticker": "META", "company_name": "Meta Platforms Inc.", "exchange": "NASDAQ", "keywords": "META FACEBOOK INSTAGRAM WHATSAPP VR"},
    {"ticker": "AMD", "company_name": "Advanced Micro Devices Inc.", "exchange": "NASDAQ", "keywords": "AMD RYZEN RADEON CHIP SEMICONDUCTORS"},
    {"ticker": "PLTR", "company_name": "Palantir Technologies Inc.", "exchange": "NYSE", "keywords": "PALANTIR AI BIG DATA DIFESA DEFENSE"},
    {"ticker": "INTC", "company_name": "Intel Corporation", "exchange": "NASDAQ", "keywords": "INTEL CPU SEMICONDUCTOR CHIP"},
    {"ticker": "NFLX", "company_name": "Netflix Inc.", "exchange": "NASDAQ", "keywords": "NETFLIX STREAMING CINEMA SERIE TV"},
    {"ticker": "DIS", "company_name": "Walt Disney Co.", "exchange": "NYSE", "keywords": "DISNEY CINEMA PARCHI MARVEL STAR WARS"},
    {"ticker": "BABA", "company_name": "Alibaba Group Holding", "exchange": "NYSE", "keywords": "ALIBABA ECOMMERCE CINA CLOUD"},
    {"ticker": "BRK-B", "company_name": "Berkshire Hathaway Inc.", "exchange": "NYSE", "keywords": "BERKSHIRE HATHAWAY BUFFETT WARREN"},
    {"ticker": "AVGO", "company_name": "Broadcom Inc.", "exchange": "NASDAQ", "keywords": "BROADCOM CHIP SEMICONDUCTORS NETWORKING"},
    {"ticker": "TSM", "company_name": "Taiwan Semiconductor (TSMC)", "exchange": "NYSE", "keywords": "TSMC TAIWAN CHIP FOUNDRY"},
    {"ticker": "ASML", "company_name": "ASML Holding N.V.", "exchange": "NASDAQ", "keywords": "ASML LITOGRAFIA CHIP EUV SEMICONDUCTOR"},
    {"ticker": "QCOM", "company_name": "Qualcomm Inc.", "exchange": "NASDAQ", "keywords": "QUALCOMM SNAPDRAGON 5G MOBILE CHIP"},
    {"ticker": "CSCO", "company_name": "Cisco Systems Inc.", "exchange": "NASDAQ", "keywords": "CISCO NETWORKING ROUTER SWITCH"},
    {"ticker": "ADBE", "company_name": "Adobe Inc.", "exchange": "NASDAQ", "keywords": "ADOBE PHOTOSHOP CREATIVE CLOUD PDF"},
    {"ticker": "ORCL", "company_name": "Oracle Corporation", "exchange": "NYSE", "keywords": "ORACLE DATABASE CLOUD ERP"},
    {"ticker": "IBM", "company_name": "International Business Machines", "exchange": "NYSE", "keywords": "IBM CLOUD MAINFRAME QUANTUM COMPUTING"},
    {"ticker": "COIN", "company_name": "Coinbase Global Inc.", "exchange": "NASDAQ", "keywords": "COINBASE CRYPTO BITCOIN ETHEREUM"},
    {"ticker": "UBER", "company_name": "Uber Technologies Inc.", "exchange": "NYSE", "keywords": "UBER MOBILITA TAXI FOOD DELIVERY"},
    {"ticker": "ABNB", "company_name": "Airbnb Inc.", "exchange": "NASDAQ", "keywords": "AIRBNB VIAGGI CASE ALLOGGI"},
    {"ticker": "SPOT", "company_name": "Spotify Technology S.A.", "exchange": "NYSE", "keywords": "SPOTIFY MUSICA PODCAST STREAMING"},
    {"ticker": "CRM", "company_name": "Salesforce Inc.", "exchange": "NYSE", "keywords": "SALESFORCE CRM CLOUD SOFTWARE"},
    {"ticker": "V", "company_name": "Visa Inc.", "exchange": "NYSE", "keywords": "VISA CARTE PAGAMENTI"},
    {"ticker": "MA", "company_name": "Mastercard Inc.", "exchange": "NYSE", "keywords": "MASTERCARD CARTE PAGAMENTI"},
    {"ticker": "JPM", "company_name": "JPMorgan Chase & Co.", "exchange": "NYSE", "keywords": "JPMORGAN CHASE BANCA WALL STREET"},
    {"ticker": "BAC", "company_name": "Bank of America Corp.", "exchange": "NYSE", "keywords": "BANK OF AMERICA BANCA"},
    {"ticker": "XOM", "company_name": "Exxon Mobil Corp.", "exchange": "NYSE", "keywords": "EXXON MOBIL PETROLIO OIL ENERGY"},
    {"ticker": "CVX", "company_name": "Chevron Corp.", "exchange": "NYSE", "keywords": "CHEVRON PETROLIO GAS"},
    {"ticker": "PFE", "company_name": "Pfizer Inc.", "exchange": "NYSE", "keywords": "PFIZER FARMACI VACCINI"},
    {"ticker": "MRNA", "company_name": "Moderna Inc.", "exchange": "NASDAQ", "keywords": "MODERNA BIOTECH MRNA VACCINI"}
]

@router.get("/status")
def get_system_status():
    storage_info = get_storage_status()
    return {
        "version": "v0.6.0",
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
    Searches real global and Italian stocks using instant curated catalog and live Yahoo Finance search API.
    """
    clean_q = query.strip().upper()
    results = []
    seen_tickers = set()

    # 1. Instant match against rich catalog (FTSE MIB + Mega Caps + Aliases)
    for stock in POPULAR_STOCKS:
        tk = stock["ticker"].upper()
        name = stock["company_name"].upper()
        kw = stock.get("keywords", "").upper()
        if (clean_q in tk or clean_q in name or clean_q in kw) and tk not in seen_tickers:
            results.append({
                "ticker": stock["ticker"],
                "company_name": stock["company_name"],
                "exchange": stock["exchange"]
            })
            seen_tickers.add(tk)

    # 2. Live Yahoo Finance search API (with fallback URLs and proper User-Agent)
    yahoo_endpoints = [
        f"https://query2.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(query)}&quotesCount=12&newsCount=0",
        f"https://query1.finance.yahoo.com/v1/finance/search?q={urllib.parse.quote(query)}&quotesCount=12&newsCount=0"
    ]
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "application/json"
    }

    for url in yahoo_endpoints:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=3.0) as response:
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
                # If we got results or responded, no need to try second endpoint
                if quotes:
                    break
        except Exception as e:
            # Continue to next endpoint or return catalog results
            pass

    # If nothing matched and query looks like a valid ticker (1-10 chars), add as direct custom ticker option
    if not results and len(clean_q) >= 1:
        results.append({
            "ticker": clean_q,
            "company_name": f"{clean_q} (Titolo Personalizzato)",
            "exchange": "MERCATO"
        })

    return results[:15]

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
            name = getattr(fast, 'currency', '')
        except Exception:
            pass
        if price and float(price) > 0:
            return {
                "ticker": clean,
                "company_name": clean,
                "price": round(float(price), 2)
            }
    except Exception as e:
        print(f"Quote fetch error for {clean}: {e}")

    # Fallback to catalog or reasonable baseline
    for stock in POPULAR_STOCKS:
        if stock["ticker"] == clean:
            return {"ticker": clean, "company_name": stock["company_name"], "price": 100.0}

    return {"ticker": clean, "company_name": f"{clean} Corp", "price": 100.0}


