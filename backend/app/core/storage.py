import os
import json
from datetime import datetime

STORAGE_PATH = os.getenv("STORAGE_PATH", "/app/storage")

SUBDIRECTORIES = [
    "strategies",
    "knowledge",
    "outputs",
    "results",
    "backtests",
    "news_cache",
]

DEFAULT_STRATEGIES = [
    {
        "id": "strat_trend_following",
        "name": "Trend Following (Triple EMA & ADX)",
        "category": "Trend",
        "description": "Identifica trend sostenuti utilizzando le medie mobili esponenziali (20, 50, 200 EMA) con conferma di forza trend data da ADX > 25.",
        "indicators": ["EMA 20", "EMA 50", "EMA 200", "ADX"],
        "buy_condition": "Prezzo > EMA 20 > EMA 50 > EMA 200 e ADX > 25",
        "sell_condition": "Prezzo incrocia al ribasso EMA 50 o ADX < 20",
        "risk_reward_ratio": "1:2.5",
        "confidence": 0.85
    },
    {
        "id": "strat_double_bottom_reversal",
        "name": "Double Bottom Pattern Reversal",
        "category": "Pattern Grafici",
        "description": "Pattern di inversione rialzista caratterizzato da due minimi distinti allo stesso livello di supporto, che segnala rally imminente al breakout della neckline.",
        "indicators": ["Livelli di Supporto", "Picco di Volume", "Divergenza RSI"],
        "buy_condition": "Breakout sopra la neckline con volume > 1.5x la media",
        "sell_condition": "Prezzo raggiunge il target (neckline + altezza pattern) o scende sotto il minimo destro",
        "risk_reward_ratio": "1:3.0",
        "confidence": 0.82
    },
    {
        "id": "strat_rsi_macd_momentum",
        "name": "RSI & MACD Momentum Divergence",
        "category": "Momentum",
        "description": "Cattura i punti di svolta in ipervenduto/ipercomprato con convergenza dell'istogramma MACD rialzista e uscita di RSI dalla zona di ipervenduto (< 30).",
        "indicators": ["RSI (14)", "MACD (12, 26, 9)"],
        "buy_condition": "RSI incrocia al rialzo quota 30 e la linea MACD incrocia al rialzo la Signal line",
        "sell_condition": "RSI supera 70 o incrocio ribassista MACD",
        "risk_reward_ratio": "1:2.0",
        "confidence": 0.78
    },
    {
        "id": "strat_candlestick_confluence",
        "name": "Candlestick Pattern Confluence",
        "category": "Candlestick",
        "description": "Sfrutta oltre 60 segnali candlestick giapponesi (Bullish Engulfing, Hammer, Morning Star) posizionati su zone chiave di supporto Fibonacci o Bande di Bollinger.",
        "indicators": ["Candlestick Reversals", "Bollinger Bands", "Fibonacci Retracement"],
        "buy_condition": "Bullish Engulfing o Hammer sulla Banda di Bollinger inferiore",
        "sell_condition": "Bearish Engulfing o Shooting Star sulla Banda di Bollinger superiore",
        "risk_reward_ratio": "1:2.2",
        "confidence": 0.80
    },
    {
        "id": "strat_ai_finbert_sentiment",
        "name": "FinBERT Sentiment & News Momentum",
        "category": "AI & Sentiment",
        "description": "Monitora le notizie online e i documenti finanziari con il modello FinBERT per quantificare il sentiment di mercato e identificare catalizzatori operativi.",
        "indicators": ["Punteggio FinBERT", "Volume Notizie", "Momentum Sentiment"],
        "buy_condition": "Punteggio sentiment > +0.65 con accelerazione del volume notizie",
        "sell_condition": "Punteggio sentiment < -0.40 o rilevamento rischi regolatori",
        "risk_reward_ratio": "1:2.5",
        "confidence": 0.88
    }
]

DEFAULT_PATTERNS = [
    {"name": "Hammer", "type": "Candlestick", "bias": "BULLISH", "reliability": "82%", "description": "Small upper body with long lower shadow at least 2x body length."},
    {"name": "Bullish Engulfing", "type": "Candlestick", "bias": "BULLISH", "reliability": "84%", "description": "Large green candle completely engulfs the previous red candle body."},
    {"name": "Morning Star", "type": "Candlestick", "bias": "BULLISH", "reliability": "86%", "description": "Three-candle bottom reversal: long red, small star, long green."},
    {"name": "Shooting Star", "type": "Candlestick", "bias": "BEARISH", "reliability": "81%", "description": "Long upper shadow at a resistance level indicating buyer rejection."},
    {"name": "Bearish Engulfing", "type": "Candlestick", "bias": "BEARISH", "reliability": "83%", "description": "Large red candle engulfs the preceding green candle."},
    {"name": "Double Bottom (W)", "type": "Geometric", "bias": "BULLISH", "reliability": "85%", "description": "Two troughs forming support level; breakout above peak signals strong rally."},
    {"name": "Head and Shoulders", "type": "Geometric", "bias": "BEARISH", "reliability": "87%", "description": "Three peaks with the center highest; breakdown below neckline signals reversal."},
    {"name": "Cup and Handle", "type": "Geometric", "bias": "BULLISH", "reliability": "80%", "description": "Rounded consolidation followed by a slight downward drift before breakout."},
    {"name": "Ascending Triangle", "type": "Geometric", "bias": "BULLISH", "reliability": "79%", "description": "Horizontal resistance with rising swing lows indicating accumulating buyers."}
]

def init_storage():
    """Ensures persistent storage folders and initial knowledge base files exist."""
    os.makedirs(STORAGE_PATH, exist_ok=True)
    
    for sub in SUBDIRECTORIES:
        os.makedirs(os.path.join(STORAGE_PATH, sub), exist_ok=True)
        
    strategies_file = os.path.join(STORAGE_PATH, "strategies", "default_strategies.json")
    if not os.path.exists(strategies_file):
        with open(strategies_file, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_STRATEGIES, f, indent=2)
            
    knowledge_file = os.path.join(STORAGE_PATH, "knowledge", "patterns_knowledge.json")
    if not os.path.exists(knowledge_file):
        with open(knowledge_file, "w", encoding="utf-8") as f:
            json.dump(DEFAULT_PATTERNS, f, indent=2)
            
    system_file = os.path.join(STORAGE_PATH, "system_info.json")
    status_data = {
        "app_name": "TradeAnalyzer Pro",
        "version": "v0.5.0",
        "storage_path": STORAGE_PATH,
        "last_initialized": datetime.utcnow().isoformat(),
        "status": "ready"
    }
    with open(system_file, "w", encoding="utf-8") as f:
        json.dump(status_data, f, indent=2)

def get_storage_status():
    """Returns the current state of persistent storage files and sizes."""
    status = {
        "storage_path": STORAGE_PATH,
        "exists": os.path.exists(STORAGE_PATH),
        "folders": {},
        "total_files": 0
    }
    if os.path.exists(STORAGE_PATH):
        for sub in SUBDIRECTORIES:
            sub_path = os.path.join(STORAGE_PATH, sub)
            if os.path.exists(sub_path):
                files = os.listdir(sub_path)
                status["folders"][sub] = {"file_count": len(files), "files": files[:10]}
                status["total_files"] += len(files)
            else:
                status["folders"][sub] = {"file_count": 0, "files": []}
    return status

def save_analysis_output(ticker: str, data: dict):
    """Saves analysis output JSON into the persistent outputs folder."""
    out_dir = os.path.join(STORAGE_PATH, "outputs")
    os.makedirs(out_dir, exist_ok=True)
    filename = f"{ticker.upper()}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = os.path.join(out_dir, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    return filepath
