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
        "description": "Identifies sustained trends using exponential moving averages (20, 50, 200 EMA) confirmed by ADX > 25.",
        "indicators": ["EMA 20", "EMA 50", "EMA 200", "ADX"],
        "buy_condition": "Price > EMA 20 > EMA 50 > EMA 200 and ADX > 25",
        "sell_condition": "Price crosses below EMA 50 or ADX < 20",
        "risk_reward_ratio": "1:2.5",
        "confidence": 0.85
    },
    {
        "id": "strat_double_bottom_reversal",
        "name": "Double Bottom Pattern Reversal",
        "category": "Chart Patterns",
        "description": "Bullish reversal pattern characterized by two distinct troughs at approximately the same level, signaling an impending upward rally upon neckline breakout.",
        "indicators": ["Support Levels", "Volume Spike", "RSI Divergence"],
        "buy_condition": "Breakout above neckline with volume > 1.5x average",
        "sell_condition": "Price reaches target (neckline + pattern height) or falls below right trough",
        "risk_reward_ratio": "1:3.0",
        "confidence": 0.82
    },
    {
        "id": "strat_rsi_macd_momentum",
        "name": "RSI & MACD Momentum Divergence",
        "category": "Momentum",
        "description": "Captures oversold/overbought turning points with bullish MACD histogram convergence and RSI exiting oversold zone (< 30).",
        "indicators": ["RSI (14)", "MACD (12, 26, 9)"],
        "buy_condition": "RSI crosses above 30 from below and MACD line crosses above Signal line",
        "sell_condition": "RSI crosses above 70 or bearish MACD crossover",
        "risk_reward_ratio": "1:2.0",
        "confidence": 0.78
    },
    {
        "id": "strat_candlestick_confluence",
        "name": "Candlestick Pattern Confluence",
        "category": "Candlestick",
        "description": "Leverages 60+ Japanese candlestick signals (Bullish Engulfing, Hammer, Morning Star) located on key Fibonacci or Bollinger support zones.",
        "indicators": ["Candlestick Reversals", "Bollinger Bands", "Fibonacci Retracement"],
        "buy_condition": "Bullish Engulfing or Hammer at lower Bollinger Band",
        "sell_condition": "Bearish Engulfing or Shooting Star at upper Bollinger Band",
        "risk_reward_ratio": "1:2.2",
        "confidence": 0.80
    },
    {
        "id": "strat_ai_finbert_sentiment",
        "name": "FinBERT Sentiment & News Momentum",
        "category": "AI & Sentiment",
        "description": "Monitors online headlines and SEC filings using FinBERT transformer model to quantify real-time market sentiment and detect news catalysts.",
        "indicators": ["FinBERT Score", "News Volume", "Sentiment Momentum"],
        "buy_condition": "Sentiment score > +0.65 with increasing news velocity",
        "sell_condition": "Sentiment score < -0.40 or regulatory risk detected",
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
        "version": "v0.1.0",
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
