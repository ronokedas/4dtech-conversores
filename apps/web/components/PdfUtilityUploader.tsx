"use client";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, FileImage, FileText, LockKeyhole, Mic, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

export type UtilityField = {
  name: string;
  label: string;
  type?: "text" | "password" | "number" | "select";
  defaultValue?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  options?: { value: string; label: string }[];
};

type Props = {
  endpoint: string;
  accept: string;
  allowedExtensions: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxMb?: number;
  title: string;
  idleHint: string;
  selectedHint?: string;
  smallHint: string;
  buttonText: string;
  busyText: string;
  privacyText: string;
  icon?: "pdf" | "image" | "audio";
  fields?: UtilityField[];
};

const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;

export function PdfUtilityUploader({ endpoint, accept, allowedExtensions, multiple = false, maxFiles = 20, maxMb = 25, title, idleHint, selectedHint, smallHint, buttonText, busyText, privacyText, icon = "pdf", fields = [] }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(fields.map((field) => [field.name, field.defaultValue || ""])));
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";

  const chooseFiles = useCallback((selected?: FileList | File[]) => {
    const next = Array.from(selected || []);
    if (!next.length) return;
    const limited = multiple ? next.slice(0, maxFiles) : next.slice(0, 1);
    for (const file of limited) {
      const extension = file.name.split(".").pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        setError(`Escolha arquivo(s) no formato: ${allowedExtensions.map((item) => item.toUpperCase()).join(", ")}.`);
        return;
      }
      if (file.size > maxMb * 1024 * 1024) {
        setError(`Cada arquivo deve ter no maximo ${maxMb} MB.`);
        return;
      }
    }
    setFiles(limited);
    setError("");
  }, [allowedExtensions, maxFiles, maxMb, multiple]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!files.length) {
      setError("Escolha o arquivo antes de continuar.");
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      files.forEach((file) => data.append("file", file));
      Object.entries(values).forEach(([name, value]) => data.append(name, value));
      const response = await fetch(`${apiBase}/conversions/${endpoint}`, { method: "POST", body: data });
      const result = await response.json() as { token?: string; message?: string };
      if (!response.ok || !result.token) throw new Error(result.message || "Nao foi possivel iniciar o processamento.");
      router.push(`/baixar/${result.token}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel iniciar o processamento.");
      setBusy(false);
    }
  }

  const selectedLabel = files.length > 1 ? `${files.length} arquivos selecionados` : files[0]?.name;
  const selectedSize = files.reduce((sum, file) => sum + file.size, 0);
  const Icon = icon === "image" ? FileImage : (icon === "audio" ? Mic : FileText);

  return <form className="image-tool" onSubmit={submit} aria-busy={busy}>
    <div className={`image-dropzone ${dragging ? "dragging" : ""} ${files.length ? "selected" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFiles(event.dataTransfer.files); }}>
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={(event) => chooseFiles(event.target.files || undefined)} aria-label={title} />
      <button type="button" className="image-dropzone-action" onClick={() => inputRef.current?.click()}>
        <span className="image-illustration"><Icon aria-hidden="true" /></span>
        <strong>{selectedLabel || title}</strong>
        <span>{files.length ? `${formatSize(selectedSize)} - ${selectedHint || "clique para trocar"}` : <>ou <u>{idleHint}</u></>}</span>
        <small>{smallHint}</small>
      </button>
    </div>
    {fields.length ? <div className="edit-options utility-options">
      {fields.map((field) => <label key={field.name}>{field.label}
        {field.type === "select" ? <select value={values[field.name] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}>{field.options?.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}</select> : <input type={field.type || "text"} min={field.min} max={field.max} placeholder={field.placeholder} value={values[field.name] || ""} onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))} />}
      </label>)}
    </div> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button type="submit" className="button primary convert-button" disabled={busy}>{busy ? <><span className="spinner" /> {busyText}</> : <><Upload size={18} /> {buttonText} <ArrowRight size={19} /></>}</button>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true" /> {privacyText}</p>
  </form>;
}
