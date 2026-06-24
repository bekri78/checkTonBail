"""Extraction de texte PDF — cœur de la performance.

Stratégie (identique à server.js mais sur un moteur natif) :
  1. Cache MD5 (instantané si même PDF déjà traité).
  2. Extraction texte native via PyMuPDF (instantané pour PDF texte).
  3. Si PDF scanné (peu de texte) : rendu des pages en PNG via PyMuPDF
     puis OCR Google Vision en parallèle (async).

PyMuPDF (fitz) remplace pdf-parse + pdf-to-png-converter : le rendu est
10-50x plus rapide qu'un renderer JS, ce qui élimine le vrai goulot.
"""
import os
import time
import base64
import hashlib
import asyncio
from typing import Optional

import fitz  # PyMuPDF
import httpx

# ==========================================
# ⚡ Cache OCR persistant (évite re-traitement)
# ==========================================
_ocr_cache: dict = {}
CACHE_TTL_MS = 1000 * 60 * 60 * 24  # 24h

# Zoom de rendu pour l'OCR. PyMuPDF étant rapide, on peut se permettre 2.0
# (meilleure précision Vision) sans pénalité notable. Surchargeable.
PDF_ZOOM = float(os.environ.get("PDF_ZOOM", "2.0"))

# Concurrence OCR (équivalent du BATCH_SIZE=8 de server.js).
OCR_CONCURRENCY = int(os.environ.get("OCR_CONCURRENCY", "8"))

VISION_API_KEY = os.environ.get("GOOGLE_VISION_API_KEY", "")
VISION_URL = "https://vision.googleapis.com/v1/images:annotate"
VISION_TIMEOUT_S = 30.0


def _now_ms() -> int:
    return int(time.time() * 1000)


def _cache_key(buffer: bytes) -> str:
    return hashlib.md5(buffer).hexdigest()


def cache_size() -> int:
    return len(_ocr_cache)


def _get_cached(buffer: bytes) -> Optional[str]:
    cached = _ocr_cache.get(_cache_key(buffer))
    if cached and _now_ms() - cached["timestamp"] < CACHE_TTL_MS:
        print(f"📦 CACHE HIT! {len(cached['text'])} caractères récupérés instantanément")
        return cached["text"]
    return None


def _set_cached(buffer: bytes, text: str) -> None:
    _ocr_cache[_cache_key(buffer)] = {"text": text, "timestamp": _now_ms()}
    # Évincer les 50 plus anciennes entrées si > 500
    if len(_ocr_cache) > 500:
        oldest = sorted(_ocr_cache.items(), key=lambda kv: kv[1]["timestamp"])[:50]
        for k, _ in oldest:
            _ocr_cache.pop(k, None)


async def _ocr_page(client: httpx.AsyncClient, sem: asyncio.Semaphore,
                    index: int, png_b64: str) -> dict:
    """OCR d'une page via Vision REST. Renvoie {index, text} (texte vide si échec)."""
    async with sem:
        payload = {
            "requests": [{
                "image": {"content": png_b64},
                "features": [{"type": "TEXT_DETECTION"}],
            }]
        }
        try:
            resp = await client.post(
                VISION_URL,
                params={"key": VISION_API_KEY},
                json=payload,
                timeout=VISION_TIMEOUT_S,
            )
            resp.raise_for_status()
            data = resp.json()
            text = (
                data.get("responses", [{}])[0]
                .get("fullTextAnnotation", {})
                .get("text", "")
            )
            return {"index": index, "text": text or ""}
        except Exception as err:  # noqa: BLE001 — on isole l'échec d'une page
            print(f"   ❌ Erreur OCR page {index + 1}: {err}")
            return {"index": index, "text": ""}


async def extract_text_from_pdf(buffer: bytes) -> str:
    # 1. Cache
    cached = _get_cached(buffer)
    if cached is not None:
        return cached

    start = _now_ms()
    doc = fitz.open(stream=buffer, filetype="pdf")

    try:
        # 2. Extraction native (instantané pour PDF texte)
        native = "\n".join(page.get_text() for page in doc).strip()
        if len(native) > 200:
            print(f"✅ PDF natif: {len(native)} chars en {_now_ms() - start}ms")
            _set_cached(buffer, native)
            return native

        # 3. PDF scanné → rendu PNG + OCR parallèle
        print("⚠️ PDF scanné détecté, OCR parallèle optimisé...")
        png_start = _now_ms()
        matrix = fitz.Matrix(PDF_ZOOM, PDF_ZOOM)
        pages_b64 = []
        for page in doc:
            pix = page.get_pixmap(matrix=matrix)
            pages_b64.append(base64.b64encode(pix.tobytes("png")).decode("ascii"))
        print(f"   📄 {len(pages_b64)} pages converties en {_now_ms() - png_start}ms")

        ocr_start = _now_ms()
        sem = asyncio.Semaphore(OCR_CONCURRENCY)
        async with httpx.AsyncClient() as client:
            results = await asyncio.gather(*[
                _ocr_page(client, sem, i, b64) for i, b64 in enumerate(pages_b64)
            ])

        results.sort(key=lambda r: r["index"])
        full_text = "\n\n".join(r["text"] for r in results).strip()

        print(f"✅ OCR complet: {len(full_text)} chars, {len(pages_b64)} pages")
        print(f"   ⏱️ Conversion: {ocr_start - png_start}ms | "
              f"OCR: {_now_ms() - ocr_start}ms | Total: {_now_ms() - start}ms")

        if len(full_text) < 100:
            raise ValueError("Impossible d'extraire suffisamment de texte du PDF")

        _set_cached(buffer, full_text)
        return full_text
    finally:
        doc.close()
