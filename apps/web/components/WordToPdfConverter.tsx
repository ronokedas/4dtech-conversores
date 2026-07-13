"use client";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, FileText, LockKeyhole, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function WordToPdfConverter() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";

  const chooseFile = useCallback((selected?: File) => {
    if (!selected) return;
    const extension = selected.name.split(".").pop()?.toLowerCase();
    if (!extension || !["doc", "docx"].includes(extension)) {
      setError("Escolha um arquivo DOC ou DOCX.");
      return;
    }
    if (selected.size > 25 * 1024 * 1024) {
      setError("O documento deve ter no maximo 25 MB.");
      return;
    }
    setFile(selected);
    setError("");
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Escolha o documento Word que deseja converter.");
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch(`${apiBase}/conversions/word`, { method: "POST", body: data });
      const result = await response.json() as { token?: string; message?: string };
      if (!response.ok || !result.token) throw new Error(result.message || "Nao foi possivel iniciar a conversao.");
      router.push(`/baixar/${result.token}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel iniciar a conversao.");
      setBusy(false);
    }
  }

  return <form className="image-tool" onSubmit={submit} aria-busy={busy}>
    <div className={`image-dropzone ${dragging ? "dragging" : ""} ${file ? "selected" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}>
      <input ref={inputRef} type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(event) => chooseFile(event.target.files?.[0])} aria-label="Escolher arquivo DOC ou DOCX" />
      <button type="button" className="image-dropzone-action" onClick={() => inputRef.current?.click()}>
        <span className="image-illustration"><FileText aria-hidden="true" /></span>
        <strong>{file ? file.name : "Arraste seu Word aqui"}</strong>
        <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB - clique para trocar` : <>ou <u>escolha um arquivo</u></>}</span>
        <small>DOC ou DOCX</small>
      </button>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button primary convert-button" disabled={busy}>{busy ? <><span className="spinner" /> Convertendo...</> : <><Upload size={18} /> Converter para PDF <ArrowRight size={19} /></>}</button>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true" /> Documento apagado automaticamente apos o download.</p>
  </form>;
}
