import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from faster_whisper import WhisperModel

MODEL_NAME = os.getenv("WHISPER_MODEL", "tiny")
DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")
MODEL_DIR = os.getenv("WHISPER_MODEL_DIR", "/models")

app = FastAPI(title="Documentos Online Transcriber")
model: Optional[WhisperModel] = None


def get_model() -> WhisperModel:
    global model
    if model is None:
        model = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE, download_root=MODEL_DIR)
    return model


@app.get("/health")
def health():
    return {"ok": True, "model": MODEL_NAME}


@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), language: str = Form("pt")):
    suffix = Path(file.filename or "audio.mp3").suffix or ".mp3"
    try:
      with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, dir="/tmp/transcriber") as tmp:
          while True:
              chunk = await file.read(1024 * 1024)
              if not chunk:
                  break
              tmp.write(chunk)
          input_path = tmp.name
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Nao foi possivel receber o audio.") from exc

    try:
        selected_language = language if language in {"pt", "en", "es", "auto"} else "pt"
        kwargs = {
            "beam_size": 1,
            "vad_filter": True,
            "condition_on_previous_text": False,
        }
        if selected_language != "auto":
            kwargs["language"] = selected_language
        segments, info = get_model().transcribe(input_path, **kwargs)
        lines = []
        segment_payload = []
        for segment in segments:
            text = segment.text.strip()
            if not text:
                continue
            lines.append(text)
            segment_payload.append({"start": segment.start, "end": segment.end, "text": text})
        transcription = "\n".join(lines).strip()
        if not transcription:
            raise HTTPException(status_code=422, detail="Nao encontramos fala clara neste arquivo.")
        return {
            "text": transcription,
            "language": info.language,
            "duration": info.duration,
            "segments": segment_payload,
        }
    finally:
        Path(input_path).unlink(missing_ok=True)
