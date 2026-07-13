from pathlib import Path

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from rembg import remove


ROOT = Path("/data/jobs").resolve()
app = FastAPI(title="Background removal service")


class RemoveRequest(BaseModel):
    inputPath: str
    outputPath: str


def safe_path(value: str) -> Path:
    path = Path(value).resolve()
    if ROOT not in path.parents and path != ROOT:
        raise HTTPException(status_code=400, detail="Caminho de arquivo invalido.")
    return path


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/remove-background")
def remove_background(payload: RemoveRequest):
    input_path = safe_path(payload.inputPath)
    output_path = safe_path(payload.outputPath)
    if not input_path.exists():
        raise HTTPException(status_code=404, detail="Imagem de entrada nao encontrada.")
    try:
        source = input_path.read_bytes()
        result = remove(source)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Nao foi possivel remover o fundo da imagem.") from exc
    return {"ok": True, "size": output_path.stat().st_size}
