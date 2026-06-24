"""Suivi d'usage : limite de coût mensuelle + anti-replay des sessions Stripe.

Port de usage-tracker.js. Le verrou fichier (Promise chain) devient un
asyncio.Lock pour garantir l'atomicité des opérations lecture-modif-écriture.
"""
import os
import json
import asyncio
from datetime import datetime, timezone

# Dossier de données — surchargeable pour monter un volume Railway persistant.
DATA_DIR = os.environ.get("DATA_DIR", os.path.dirname(os.path.abspath(__file__)))
USAGE_FILE = os.path.join(DATA_DIR, "usage.json")

# Limite de sécurité : coût max par mois (en euros)
MAX_MONTHLY_COST = float(os.environ.get("MAX_MONTHLY_COST", "45"))

_lock = asyncio.Lock()


def _current_month() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def _load_usage() -> dict:
    try:
        with open(USAGE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {
            "currentMonth": _current_month(),
            "totalCost": 0,
            "analyses": [],
            "usedSessions": {},
        }


def _save_usage(data: dict) -> None:
    os.makedirs(DATA_DIR, exist_ok=True)
    with open(USAGE_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def _maybe_rollover(usage: dict) -> dict:
    """Réinitialise au changement de mois + migre l'ancienne structure liste."""
    month = _current_month()
    if usage.get("currentMonth") != month:
        usage["currentMonth"] = month
        usage["totalCost"] = 0
        usage["analyses"] = []
        usage["usedSessions"] = {}
    # Migration : liste → dict si ancienne structure
    if isinstance(usage.get("usedSessions"), list):
        usage["usedSessions"] = {sid: True for sid in usage["usedSessions"]}
    return usage


async def can_analyze() -> dict:
    """Vérifie si on peut encore lancer une analyse (sous la limite mensuelle)."""
    async with _lock:
        usage = _maybe_rollover(_load_usage())
        if usage["totalCost"] >= MAX_MONTHLY_COST:
            return {
                "allowed": False,
                "reason": f"Limite mensuelle atteinte ({MAX_MONTHLY_COST}€).",
                "currentCost": usage["totalCost"],
            }
        return {"allowed": True}


async def check_and_mark_session(session_id: str) -> dict:
    """Vérifie + marque la session de façon atomique (anti double-usage / TOCTOU)."""
    async with _lock:
        usage = _maybe_rollover(_load_usage())
        if usage["usedSessions"].get(session_id):
            return {"allowed": False}
        usage["usedSessions"][session_id] = True
        _save_usage(usage)
        return {"allowed": True}


async def track_analysis(cost: float, user_id) -> dict:
    """Enregistre le coût d'une analyse."""
    async with _lock:
        usage = _maybe_rollover(_load_usage())
        usage["totalCost"] += cost
        usage["analyses"].append({
            "date": datetime.now(timezone.utc).isoformat(),
            "cost": cost,
            "userId": user_id,
        })
        _save_usage(usage)
        print(f"📊 Usage du mois : {usage['totalCost']:.2f}€ / {MAX_MONTHLY_COST}€")
        if usage["totalCost"] > MAX_MONTHLY_COST * 0.8:
            print("⚠️ ALERTE : 80% de la limite mensuelle atteinte !")
        return usage


async def get_monthly_stats() -> dict:
    """Stats d'usage du mois (route admin)."""
    async with _lock:
        usage = _maybe_rollover(_load_usage())
        analyses = usage.get("analyses", [])
        session_count = len(usage.get("usedSessions", {}) or {})
        return {
            "month": usage["currentMonth"],
            "totalCost": usage["totalCost"],
            "analysesCount": len(analyses),
            "sessionsUsed": session_count,
            "remainingBudget": MAX_MONTHLY_COST - usage["totalCost"],
            "averageCostPerAnalysis": (
                usage["totalCost"] / len(analyses) if analyses else 0
            ),
        }
