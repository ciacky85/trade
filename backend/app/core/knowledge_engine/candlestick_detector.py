import pandas as pd
import pandas_ta as ta

class CandlestickPatternDetector:
    def __init__(self):
        # List of critical patterns from specifications
        self.bullish_reversal = ['hammer', 'piercing', 'engulfing', 'morningstar', '3whitesoldiers']
        self.bearish_reversal = ['shootingstar', 'darkcloudcover', 'engulfing', 'eveningstar', '3blackcrows']
        self.indecision = ['doji', 'spinningtop']

    def detect_all_patterns(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Uses pandas-ta to detect all available candlestick patterns (up to 60+ patterns).
        Returns a DataFrame containing the signals (1 for bullish, -1 for bearish, 0 for none).
        """
        if df.empty or len(df) < 5:
            return pd.DataFrame()
            
        try:
            # pandas-ta cdl_pattern with name="all" computes all known CDL patterns
            cdl_df = df.ta.cdl_pattern(name="all")
            return cdl_df
        except Exception as e:
            print(f"Error detecting patterns: {e}")
            return pd.DataFrame()

    def aggregate_signals(self, cdl_df: pd.DataFrame) -> dict:
        """
        Aggregates the detected patterns on the most recent candle into a clear signal.
        """
        if cdl_df is None or cdl_df.empty:
            return {"bullish_count": 0, "bearish_count": 0, "patterns": []}
            
        latest = cdl_df.iloc[-1]
        active_patterns = latest[latest != 0]
        
        bullish = 0
        bearish = 0
        patterns_found = []
        
        for pattern_col, val in active_patterns.items():
            pattern_name = pattern_col.replace('CDL_', '')
            patterns_found.append({"name": pattern_name, "signal": int(val)})
            if val > 0:
                bullish += 1
            elif val < 0:
                bearish += 1
                
        return {
            "bullish_count": bullish,
            "bearish_count": bearish,
            "patterns": patterns_found,
            "consensus": "BULLISH" if bullish > bearish else "BEARISH" if bearish > bullish else "NEUTRAL"
        }
