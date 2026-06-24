# CheckTonBail — Backend FastAPI

Migration du backend Node/Express (`../server`) vers **Python / FastAPI + PyMuPDF**.

## Pourquoi cette migration

Le goulot d'étranglement de l'analyse était `pdf-to-png-converter` (rendu PDF
en JS pur, basé sur pdf.js). Il est remplacé par **PyMuPDF (fitz)**, un moteur
natif **10-50x plus rapide** sur le rendu de pages. Le reste du pipeline
(OCR Google Vision en parallèle, GPT-4o-mini) est porté à l'identique, mais
l'OCR utilise désormais `asyncio` + `httpx` (concurrence native) au lieu des
batches manuels.

Le contrat d'API est **strictement identique** : aucun changement requis côté
frontend, sauf pointer `REACT_APP_API_BASE` sur le nouveau service.

## Endpoints (inchangés)

| Méthode | Route | |
|---|---|---|
| GET  | `/api/health` | warm-up + état du cache |
| GET  | `/api/public-stats` | compteurs homepage |
| GET  | `/api/stats` | admin (header `x-admin-key`) |
| POST | `/api/prepare-analysis` | multipart `file` → extraction texte |
| POST | `/api/analyse-bail-text` | JSON → analyse GPT (paiement vérifié) |
| POST | `/api/create-checkout-session` | JSON → Stripe Checkout embedded |
| GET  | `/api/checkout-session-status` | statut paiement |
| POST | `/api/stripe-webhook` | webhook Stripe |

## Développement local

```bash
cd server-py
python -m venv .venv
. .venv/Scripts/activate    # Windows (Git Bash) ; ou .venv\Scripts\Activate.ps1 en PowerShell
pip install -r requirements.txt
cp .env.example .env        # puis remplir les clés
uvicorn main:app --reload --port 4000
```

## Déploiement Railway

Le service est conteneurisé via `Dockerfile` (PyMuPDF embarque sa lib native,
aucune dépendance système à installer).

1. Dans Railway, pointer le service backend sur le dossier `server-py/`
   (Root Directory = `server-py`), builder = **Dockerfile**.
2. Définir les variables d'environnement (voir `.env.example`) :
   `OPENAI_API_KEY`, `GOOGLE_VISION_API_KEY`, `STRIPE_SECRET_KEY`,
   `STRIPE_WEBHOOK_SECRET`, `CORS_ORIGIN`, `FRONTEND_URL`, `ADMIN_API_KEY`.
3. **Persistance** : `usage.json`, `users.json`, `stats.json` sont des fichiers.
   Monter un **volume Railway** et définir `DATA_DIR` sur son point de montage
   (ex. `/data`) pour ne pas perdre la limite mensuelle / les compteurs à
   chaque redéploiement.

> ⚠️ Google Vision utilise ici la **clé API REST** (`GOOGLE_VISION_API_KEY`),
> comme le faisait le backend Node — pas un compte de service.

## Différences notables vs Node

- OCR : `asyncio.gather` + sémaphore (`OCR_CONCURRENCY`, défaut 8) au lieu des
  batches séquentiels.
- Rendu PDF : zoom configurable via `PDF_ZOOM` (défaut 2.0, qualité OCR
  supérieure — PyMuPDF est assez rapide pour se le permettre).
- Données persistées dans `DATA_DIR` (défaut : dossier courant) pour supporter
  un volume monté.
