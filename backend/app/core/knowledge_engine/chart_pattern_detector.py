import pandas as pd
import numpy as np
from scipy.signal import argrelextrema

class ChartPatternDetector:
    def __init__(self, order=5):
        self.order = order # Lookback/lookforward period for local extrema

    def find_extrema(self, df: pd.DataFrame):
        """Finds local peaks (maxima) and troughs (minima)."""
        prices = df['Close'].values
        
        # argrelextrema returns a tuple of arrays, we take [0]
        local_max = argrelextrema(prices, np.greater, order=self.order)[0]
        local_min = argrelextrema(prices, np.less, order=self.order)[0]
        
        return local_max, local_min

    def detect_head_and_shoulders(self, df: pd.DataFrame, local_max, local_min):
        """
        Basic logic to detect Head and Shoulders Top.
        Requires 3 peaks where the middle (Head) is higher than the two outside (Shoulders).
        """
        patterns = []
        if len(local_max) >= 3:
            for i in range(len(local_max) - 2):
                p1, p2, p3 = local_max[i], local_max[i+1], local_max[i+2]
                v1, v2, v3 = df['Close'].iloc[p1], df['Close'].iloc[p2], df['Close'].iloc[p3]
                
                # Head must be higher than shoulders
                if v2 > v1 and v2 > v3:
                    # Shoulders should be roughly at the same level (within 5%)
                    if abs(v1 - v3) / v1 < 0.05:
                        patterns.append({
                            "pattern": "Head and Shoulders",
                            "type": "BEARISH_REVERSAL",
                            "indices": [p1, p2, p3]
                        })
        return patterns

    def detect_double_top_bottom(self, df: pd.DataFrame, local_max, local_min):
        """Detects Double Tops (bearish) and Double Bottoms (bullish)."""
        patterns = []
        
        # Double Tops
        if len(local_max) >= 2:
            for i in range(len(local_max) - 1):
                p1, p2 = local_max[i], local_max[i+1]
                v1, v2 = df['Close'].iloc[p1], df['Close'].iloc[p2]
                if abs(v1 - v2) / v1 < 0.03: # Within 3%
                    patterns.append({
                        "pattern": "Double Top",
                        "type": "BEARISH_REVERSAL",
                        "indices": [p1, p2]
                    })
                    
        # Double Bottoms
        if len(local_min) >= 2:
            for i in range(len(local_min) - 1):
                p1, p2 = local_min[i], local_min[i+1]
                v1, v2 = df['Close'].iloc[p1], df['Close'].iloc[p2]
                if abs(v1 - v2) / v1 < 0.03: # Within 3%
                    patterns.append({
                        "pattern": "Double Bottom",
                        "type": "BULLISH_REVERSAL",
                        "indices": [p1, p2]
                    })
        return patterns

    def scan_all(self, df: pd.DataFrame) -> dict:
        """Runs all pattern detections."""
        if len(df) < self.order * 3:
            return {"patterns": []}
            
        local_max, local_min = self.find_extrema(df)
        
        all_patterns = []
        all_patterns.extend(self.detect_head_and_shoulders(df, local_max, local_min))
        all_patterns.extend(self.detect_double_top_bottom(df, local_max, local_min))
        
        return {"patterns": all_patterns}
