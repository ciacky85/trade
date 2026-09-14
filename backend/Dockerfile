FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download FinBERT model at build time to save time during startup
# We run a short python script that downloads the model and tokenizer
RUN python -c "from transformers import pipeline; pipeline('sentiment-analysis', model='ProsusAI/finbert')"

# Install playwright browsers
RUN playwright install chromium
RUN playwright install-deps chromium

COPY . .

# Set pythonpath
ENV PYTHONPATH=/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
