FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1 \
    HF_HOME=/models \
    TRANSFORMERS_CACHE=/models \
    WHISPER_MODEL=tiny \
    WHISPER_DEVICE=cpu \
    WHISPER_COMPUTE_TYPE=int8
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends libgomp1 ffmpeg \
  && rm -rf /var/lib/apt/lists/*
COPY apps/transcriber/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY apps/transcriber/app.py .
RUN mkdir -p /models /tmp/transcriber
EXPOSE 5100
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5100"]
