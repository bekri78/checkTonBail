"""CheckTonBail — backend FastAPI (migration depuis Express/Node).

Contrat d'API identique à server.js pour rester transparent côté frontend :
  GET  /api/health
  GET  /api/stats                (admin, header x-admin-key)
  GET  /api/public-stats
  POST /api/prepare-analysis     (multipart: file)
  POST /api/analyse-bail-text    (json: bailText, fileName, userId, checkoutSessionId)
  POST /api/create-checkout-session (json: userId, email)
  GET  /api/checkout-session-status?session_id=
  POST /api/stripe-webhook
"""
import os
import sys
import time

# Forcer stdout/stderr en UTF-8 : les logs contiennent des emojis qui font
# planter la console Windows (cp1252). Sans effet néfaste sous Linux/Railway.
for _stream in (sys.stdout, sys.stderr):
    try:
        _stream.reconfigure(encoding="utf-8", errors="replace")
    except (AttributeError, ValueError):
        pass

import stripe
from dotenv import load_dotenv
from fastapi import FastAPI, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from pdf_extract import extract_text_from_pdf, cache_size, OCR_CONCURRENCY
from analysis import analyse_bail_with_gpt
from country_prompts import get_country_info
from usage_tracker import can_analyze, check_and_mark_session, track_analysis, get_monthly_stats
from stats import load_stats, increment_stats

load_dotenv()

PORT = int(os.environ.get("PORT", "4000"))
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")

START_TIME = time.time()

# ==========================================
# 🚦 RATE LIMITING (slowapi, par IP)
# ==========================================
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="CheckTonBail backend")
app.state.limiter = limiter

RATE_MSG = {"success": False, "error": "Trop de requêtes, réessayez dans une minute."}


@app.exception_handler(RateLimitExceeded)
async def _rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content=RATE_MSG)


# ==========================================
# CORS — frontend autorisé
# ==========================================
cors_origins = (
    os.environ.get("CORS_ORIGIN").split(",")
    if os.environ.get("CORS_ORIGIN")
    else ["http://localhost:3000"]
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 🔒 SECURITY HEADERS
# ==========================================
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    return response


# ==========================================
# Routes
# ==========================================
@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "message": "CheckTonBail backend up",
        "cacheSize": cache_size(),
        "visionPoolSize": OCR_CONCURRENCY,
        "uptime": f"{int(time.time() - START_TIME)}s",
    }


@app.get("/api/stats")
async def admin_stats(request: Request):
    admin_key = os.environ.get("ADMIN_API_KEY")
    if not admin_key or request.headers.get("x-admin-key") != admin_key:
        return JSONResponse(status_code=401, content={"success": False, "error": "Non autorisé"})
    try:
        return {"success": True, "stats": await get_monthly_stats()}
    except Exception as e:  # noqa: BLE001
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.get("/api/public-stats")
async def public_stats():
    s = load_stats()
    return {
        "success": True,
        "totalAnalyses": s.get("totalAnalyses", 0),
        "totalClausesDetected": s.get("totalClausesDetected", 0),
    }


@app.post("/api/prepare-analysis")
@limiter.limit("5/minute")
async def prepare_analysis(request: Request, file: UploadFile = File(None)):
    try:
        if file is None:
            return JSONResponse(status_code=400, content={"error": "Fichier manquant."})

        buffer = await file.read()
        if len(buffer) > 10 * 1024 * 1024:
            return JSONResponse(status_code=400, content={
                "success": False, "error": "Fichier trop volumineux (max 10 Mo)."})

        print(f"📄 PREPARE: {file.filename} ({len(buffer)} bytes)")
        bail_text = await extract_text_from_pdf(buffer)
        print(f"   Caractères extraits: {len(bail_text)}")

        return {"success": True, "fileName": file.filename, "extractedText": bail_text}
    except Exception as e:  # noqa: BLE001
        print(f"❌ Erreur /api/prepare-analysis: {e}")
        return JSONResponse(status_code=500, content={
            "success": False, "error": str(e) or "Erreur interne serveur"})


@app.post("/api/analyse-bail-text")
async def analyse_bail_text(request: Request):
    try:
        body = await request.json()
    except Exception:  # noqa: BLE001
        body = {}

    bail_text = body.get("bailText")
    file_name = body.get("fileName")
    user_id = body.get("userId")
    checkout_session_id = body.get("checkoutSessionId")

    country = "FR"  # Seule la France est supportée pour l'instant

    try:
        if not bail_text or len(bail_text) < 100:
            return JSONResponse(status_code=400, content={
                "error": "Texte du bail manquant ou trop court."})

        # 🛡️ Vérifier le paiement Stripe (Checkout Session)
        if not checkout_session_id:
            return JSONResponse(status_code=402, content={
                "success": False, "error": "Paiement requis", "needsPayment": True})

        try:
            session = stripe.checkout.Session.retrieve(checkout_session_id)
            if session.payment_status != "paid":
                print(f"❌ Checkout Session {checkout_session_id} non payée: {session.payment_status}")
                return JSONResponse(status_code=402, content={
                    "success": False, "error": "Paiement non validé", "needsPayment": True})
            print(f"✅ Paiement vérifié via Checkout Session: {checkout_session_id}")
        except Exception as stripe_err:  # noqa: BLE001
            print(f"❌ Erreur vérification Stripe: {stripe_err}")
            return JSONResponse(status_code=402, content={
                "success": False, "error": "Impossible de vérifier le paiement", "needsPayment": True})

        # 🛡️ Vérifier limite mensuelle
        usage_check = await can_analyze()
        if not usage_check["allowed"]:
            print(f"🚨 LIMITE MENSUELLE ATTEINTE : {usage_check.get('currentCost')}€")
            return JSONResponse(status_code=503, content={
                "success": False,
                "error": "Service temporairement indisponible. Réessayez demain.",
                "maintenance": True})

        # 🔒 Vérifier + marquer la session (anti-replay, atomique)
        session_check = await check_and_mark_session(checkout_session_id)
        if not session_check["allowed"]:
            print(f"❌ Session déjà utilisée: {checkout_session_id}")
            return JSONResponse(status_code=402, content={
                "success": False,
                "error": "Cette session de paiement a déjà été utilisée",
                "needsPayment": True})

        print(f"📄 Analyse PAYANTE (texte pré-extrait): {file_name}")
        print(f"   Caractères: {len(bail_text)}")
        print(f"   Utilisateur: {user_id}")

        result = await analyse_bail_with_gpt(bail_text, country)

        await track_analysis(result["cost"], user_id)

        analysis = result["analysis"]
        total_clauses = len(analysis.get("clauses_abusives") or []) + \
            len(analysis.get("clauses_desequilibrees") or [])
        await increment_stats(total_clauses)

        print("✅ Analyse payante terminée avec succès")
        return {"success": True, "fileName": file_name, "analysis": analysis, "country": country}
    except Exception as e:  # noqa: BLE001
        print(f"❌ Erreur /api/analyse-bail-text: {e}")
        return JSONResponse(status_code=500, content={
            "success": False, "error": str(e) or "Erreur interne serveur"})


@app.post("/api/create-checkout-session")
@limiter.limit("10/minute")
async def create_checkout_session(request: Request):
    try:
        body = await request.json()
        user_id = body.get("userId")
        email = body.get("email")

        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        session_config = {
            "ui_mode": "embedded",
            "mode": "payment",
            "payment_method_types": ["card"],
            "allow_promotion_codes": True,
            "line_items": [{
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": "Analyse complète de bail - CheckTonBail",
                        "description": "Analyse juridique détaillée de votre bail locatif",
                    },
                    "unit_amount": 990,  # 9.90€ en centimes
                },
                "quantity": 1,
            }],
            "metadata": {"userId": user_id, "product": "bail_analysis"},
            "return_url": f"{frontend_url}?session_id={{CHECKOUT_SESSION_ID}}",
        }
        if email:
            session_config["customer_email"] = email

        session = stripe.checkout.Session.create(**session_config)
        return {"success": True, "clientSecret": session.client_secret, "sessionId": session.id}
    except Exception as e:  # noqa: BLE001
        print(f"Erreur création Checkout Session: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.get("/api/checkout-session-status")
@limiter.limit("30/minute")
async def checkout_session_status(request: Request, session_id: str = None):
    try:
        if not session_id:
            return JSONResponse(status_code=400, content={
                "success": False, "error": "session_id manquant"})

        session = stripe.checkout.Session.retrieve(session_id)
        details = session.get("customer_details") or {}
        return {
            "success": True,
            "payment_status": session.payment_status,
            "customerEmail": details.get("email"),
            "metadata": session.metadata,
        }
    except Exception as e:  # noqa: BLE001
        print(f"Erreur vérification session: {e}")
        return JSONResponse(status_code=500, content={"success": False, "error": str(e)})


@app.post("/api/stripe-webhook")
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig = request.headers.get("stripe-signature")
    try:
        event = stripe.Webhook.construct_event(
            payload, sig, os.environ.get("STRIPE_WEBHOOK_SECRET")
        )
    except Exception as e:  # noqa: BLE001
        print(f"Webhook signature verification failed: {e}")
        return JSONResponse(status_code=400, content={"error": f"Webhook Error: {e}"})

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        print(f"✅ Paiement Checkout Session réussi: {session['id']}")
        print(f"   Email: {(session.get('customer_details') or {}).get('email', 'N/A')}")
        print(f"   Metadata: {session.get('metadata')}")

    return {"received": True}


@app.on_event("startup")
async def _startup():
    print(f"✅ Backend CheckTonBail (FastAPI) prêt — OCR concurrency: {OCR_CONCURRENCY}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=PORT)
