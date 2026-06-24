"""Compteurs dynamiques publics (homepage). Port de la section stats.json de server.js."""
import os
import json
import asyncio
from datetime import datetime, timezone

DATA_DIR = os.environ.get("DATA_DIR", os.path.dirname(os.path.abspath(__file__)))
STATS_FILE = os.path.join(DATA_DIR, "stats.json")

_lock = asyncio.Lock()


def load_stats() -> dict:
    try:
        with open(STATS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as err:
        if isinstance(err, json.JSONDecodeError):
            print(f"Erreur lecture stats.json: {err}")
        return {"totalAnalyses": 0, "totalClausesDetected": 0, "lastUpdated": None}


def _save_stats(data: dict) -> None:
    data["lastUpdated"] = datetime.now(timezone.utc).isoformat()
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(STATS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


async def increment_stats(clauses_count: int) -> dict:
    async with _lock:
        stats = load_stats()
        stats["totalAnalyses"] = stats.get("totalAnalyses", 0) + 1
        stats["totalClausesDetected"] = stats.get("totalClausesDetected", 0) + (clauses_count or 0)
        _save_stats(stats)
        return stats
