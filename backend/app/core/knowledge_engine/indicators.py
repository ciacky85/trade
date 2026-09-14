import pandas as pd
try:
    import pandas_ta_classic as ta
except ImportError:
    import pandas_ta as ta

def calculate_all_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calculate all technical indicators using pandas-ta.
    """
    if df.empty:
        return df

    # Trend
    df.ta.sma(length=20, append=True)
    df.ta.sma(length=50, append=True)
    df.ta.sma(length=200, append=True)
    df.ta.macd(append=True)
    df.ta.adx(append=True)

    # Momentum
    df.ta.rsi(length=14, append=True)
    df.ta.stoch(append=True)

    # Volatility
    df.ta.bbands(length=20, std=2, append=True)
    df.ta.atr(length=14, append=True)

    return df
