from fastapi import APIRouter
from app.core.storage import get_storage_status, init_storage

router = APIRouter()

@router.get("/status")
def get_system_status():
    storage_info = get_storage_status()
    return {
        "version": "v0.1.0",
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
