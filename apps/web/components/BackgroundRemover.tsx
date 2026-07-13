"use client";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, FileImage, LockKeyhole, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function BackgroundRemover() {
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
    if (!extension || !["png", "jpg", "jpeg"].includes(extension)) { setError("Escolha uma imagem PNG ou JPG."); return; }
    if (selected.size > 15 * 1024 * 1024) { setError("A imagem deve ter no maximo 15 MB."); return; }
    setFile(selected); setError("");
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (!file) { setError("Escolha a imagem que deseja processar."); return; }
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch(`${apiBase}/conversions/background`, { method: "POST", body: data });
      const result = await response.json() as { token?: string; message?: string };
      if (!response.ok || !result.token) throw new Error(result.message || "Nao foi possivel iniciar a remocao do fundo.");
      router.push(`/baixar/${result.token}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel iniciar a remocao do fundo.");
      setBusy(false);
    }
  }

  return <form className="image-tool" onSubmit={submit} aria-busy={busy}>
    <div className={`image-dropzone ${dragging ? "dragging" : ""} ${file ? "selected" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}>
      <input ref={inputRef} type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={(event) => chooseFile(event.target.files?.[0])} aria-label="Escolher imagem PNG ou JPG" />
      <button type="button" className="image-dropzone-action" onClick={() => inputRef.current?.click()}>
        <span className="image-illustration"><FileImage aria-hidden="true" /></span>
        <strong>{file ? file.name : "Arraste sua imagem aqui"}</strong>
        <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB - clique para trocar` : <>ou <u>escolha um arquivo</u></>}</span>
        <small>PNG ou JPG</small>
      </button>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button primary convert-button" disabled={busy}>{busy ? <><span className="spinner" /> Processando...</> : <><Upload size={18} /> Remover fundo <ArrowRight size={19} /></>}</button>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true" /> Arquivo apagado automaticamente apos o processamento.</p>
  </form>;
}
