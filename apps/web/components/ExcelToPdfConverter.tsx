"use client";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, FileSpreadsheet, LockKeyhole, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export function ExcelToPdfConverter() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [orientation, setOrientation] = useState("landscape");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";

  const chooseFile = useCallback((selected?: File) => {
    if (!selected) return;
    const extension = selected.name.split(".").pop()?.toLowerCase();
    if (!extension || !["xls", "xlsx"].includes(extension)) {
      setError("Escolha um arquivo XLS ou XLSX.");
      return;
    }
    if (selected.size > 25 * 1024 * 1024) {
      setError("A planilha deve ter no maximo 25 MB.");
      return;
    }
    setFile(selected);
    setError("");
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Escolha a planilha Excel que deseja converter.");
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("orientation", orientation);
      const response = await fetch(`${apiBase}/conversions/excel`, { method: "POST", body: data });
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
      <input ref={inputRef} type="file" accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => chooseFile(event.target.files?.[0])} aria-label="Escolher arquivo XLS ou XLSX" />
      <button type="button" className="image-dropzone-action" onClick={() => inputRef.current?.click()}>
        <span className="image-illustration"><FileSpreadsheet aria-hidden="true" /></span>
        <strong>{file ? file.name : "Arraste seu Excel aqui"}</strong>
        <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB - clique para trocar` : <>ou <u>escolha um arquivo</u></>}</span>
        <small>XLS ou XLSX</small>
      </button>
    </div>
    <div className="office-options" aria-label="Opcoes da conversao">
      <label><input type="radio" name="orientation" value="portrait" checked={orientation === "portrait"} onChange={(event) => setOrientation(event.target.value)} /> Vertical</label>
      <label><input type="radio" name="orientation" value="landscape" checked={orientation === "landscape"} onChange={(event) => setOrientation(event.target.value)} /> Horizontal</label>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button className="button primary convert-button" disabled={busy}>{busy ? <><span className="spinner" /> Convertendo...</> : <><Upload size={18} /> Converter para PDF <ArrowRight size={19} /></>}</button>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true" /> Planilha apagada automaticamente apos o download.</p>
  </form>;
}
