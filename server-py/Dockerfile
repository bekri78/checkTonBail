FROM python:3.12-slim

# PyMuPDF embarque sa lib native via le wheel manylinux : pas de dépendances
# système PDF à installer. On garde l'image minimale.
ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=4000

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 4000

# Railway injecte $PORT ; on l'utilise pour binder uvicorn.
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-4000}"]
