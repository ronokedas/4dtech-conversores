"use client";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, FileText, LockKeyhole, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function PdfEditor() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("Revisado");
  const [position, setPosition] = useState("top-left");
  const [page, setPage] = useState("1");
  const [fontSize, setFontSize] = useState("18");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";

  const chooseFile = useCallback((selected?: File) => {
    if (!selected) return;
    const extension = selected.name.split(".").pop()?.toLowerCase();
    if (extension !== "pdf") {
      setError("Escolha um arquivo PDF.");
      return;
    }
    if (selected.size > 25 * 1024 * 1024) {
      setError("O PDF deve ter no maximo 25 MB.");
      return;
    }
    setFile(selected);
    setError("");
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Escolha o PDF que deseja editar.");
      return;
    }
    if (!text.trim()) {
      setError("Digite o texto que deseja adicionar ao PDF.");
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("text", text);
      data.append("position", position);
      data.append("page", page);
      data.append("fontSize", fontSize);
      const response = await fetch(`${apiBase}/conversions/edit-pdf`, { method: "POST", body: data });
      const result = await response.json() as { token?: string; message?: string };
      if (!response.ok || !result.token) throw new Error(result.message || "Nao foi possivel iniciar a edicao.");
      router.push(`/baixar/${result.token}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel iniciar a edicao.");
      setBusy(false);
    }
  }

  return <form className="image-tool" onSubmit={submit} aria-busy={busy}>
    <div className={`image-dropzone ${dragging ? "dragging" : ""} ${file ? "selected" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}>
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" onChange={(event) => chooseFile(event.target.files?.[0])} aria-label="Escolher arquivo PDF" />
      <button type="button" className="image-dropzone-action" onClick={() => inputRef.current?.click()}>
        <span className="image-illustration"><FileText aria-hidden="true" /></span>
        <strong>{file ? file.name : "Arraste seu PDF aqui"}</strong>
        <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB - clique para trocar` : <>ou <u>escolha um arquivo</u></>}</span>
        <small>PDF</small>
      </button>
    </div>
    <div className="edit-options">
      <label>Texto <input value={text} maxLength={160} onChange={(event) => setText(event.target.value)} /></label>
      <label>Pagina <input type="number" min="1" max="999" value={page} onChange={(event) => setPage(event.target.value)} /></label>
      <label>Tamanho <input type="number" min="8" max="72" value={fontSize} onChange={(event) => setFontSize(event.target.value)} /></label>
      <label>Posicao <select value={position} onChange={(event) => setPosition(event.target.value)}><option value="top-left">Topo esquerdo</option><option value="top-center">Topo centro</option><option value="center">Centro</option><option value="bottom-left">Rodape esquerdo</option><option value="bottom-center">Rodape centro</option></select></label>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button primary convert-button" disabled={busy}>{busy ? <><span className="spinner" /> Editando...</> : <><Upload size={18} /> Editar PDF <ArrowRight size={19} /></>}</button>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true" /> PDF original e editado sao apagados automaticamente apos o download.</p>
  </form>;
}
