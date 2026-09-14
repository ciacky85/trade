from fastapi import APIRouter
import json
import os
from app.core.storage import STORAGE_PATH, DEFAULT_STRATEGIES, DEFAULT_PATTERNS

router = APIRouter()

@router.get("/strategies")
def get_strategies():
    filepath = os.path.join(STORAGE_PATH, "strategies", "default_strategies.json")
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_STRATEGIES

@router.get("/patterns")
def get_patterns():
    filepath = os.path.join(STORAGE_PATH, "knowledge", "patterns_knowledge.json")
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return DEFAULT_PATTERNS
