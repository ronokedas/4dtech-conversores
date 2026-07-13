"use client";
import { useCallback, useRef, useState } from "react";
import { ArrowRight, FileUp, Link2, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

type Mode = "file" | "url";
type Options = { format: "A4" | "Letter" | "Legal"; landscape: boolean; margin: "none" | "small" | "normal" };

export function Converter() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [options, setOptions] = useState<Options>({ format: "A4", landscape: false, margin: "normal" });
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";

  const chooseFile = useCallback((selected?: File) => {
    if (!selected) return;
    const extension = selected.name.split(".").pop()?.toLowerCase();
    if (!extension || !["html", "htm", "zip"].includes(extension)) { setError("Escolha um arquivo HTML, HTM ou ZIP."); return; }
    if (selected.size > 25 * 1024 * 1024) { setError("O arquivo deve ter no máximo 25 MB."); return; }
    setFile(selected); setError("");
  }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError("");
    if (mode === "file" && !file) { setError("Escolha o arquivo que deseja converter."); return; }
    if (mode === "url") { try { const parsed = new URL(url); if (!["http:", "https:"].includes(parsed.protocol)) throw new Error(); } catch { setError("Cole uma URL completa, começando com http:// ou https://."); return; } }
    setBusy(true);
    try {
      let response: Response;
      if (mode === "file") {
        const data = new FormData(); data.append("file", file!); data.append("format", options.format); data.append("landscape", String(options.landscape)); data.append("margin", options.margin);
        response = await fetch(`${apiBase}/conversions/file`, { method: "POST", body: data });
      } else response = await fetch(`${apiBase}/conversions/url`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ url, options }) });
      const result = await response.json() as { token?: string; message?: string };
      if (!response.ok || !result.token) throw new Error(result.message || "Não foi possível iniciar a conversão.");
      router.push(`/baixar/${result.token}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível iniciar a conversão."); setBusy(false); }
  }

  return <form className="converter" onSubmit={submit} aria-busy={busy}>
    <div className="tabs" role="tablist" aria-label="Tipo de conversão">
      <button type="button" role="tab" aria-selected={mode === "file"} className={mode === "file" ? "active" : ""} onClick={() => { setMode("file"); setError(""); }}><FileUp size={18} /> Enviar arquivo</button>
      <button type="button" role="tab" aria-selected={mode === "url"} className={mode === "url" ? "active" : ""} onClick={() => { setMode("url"); setError(""); }}><Link2 size={18} /> Usar URL</button>
    </div>
    <div className="converter-body">
      {mode === "file" ? <div className={`dropzone ${dragging ? "dragging" : ""} ${file ? "selected" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); chooseFile(event.dataTransfer.files[0]); }}>
        <input ref={inputRef} type="file" accept=".html,.htm,.zip" onChange={(event) => chooseFile(event.target.files?.[0])} aria-label="Escolher arquivo HTML ou ZIP" />
        <button type="button" className="dropzone-action" onClick={() => inputRef.current?.click()}>
          <span className="file-illustration"><FileUp aria-hidden="true" /></span>
          <strong>{file ? file.name : "Arraste seu arquivo aqui"}</strong>
          <span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB — clique para trocar` : <>ou <u>escolha um arquivo</u> HTML ou ZIP</>}</span>
        </button>
      </div> : <label className="url-field"><span>Endereço da página</span><div><Link2 aria-hidden="true" /><input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://exemplo.com/pagina" autoComplete="url" required /></div><small>Somente páginas públicas nas portas 80 e 443.</small></label>}
      <details className="advanced"><summary>Opções avançadas</summary><div className="option-grid">
        <label>Formato<select value={options.format} onChange={(event) => setOptions((current) => ({ ...current, format: event.target.value as Options["format"] }))}><option>A4</option><option value="Letter">Carta</option><option value="Legal">Ofício</option></select></label>
        <label>Margens<select value={options.margin} onChange={(event) => setOptions((current) => ({ ...current, margin: event.target.value as Options["margin"] }))}><option value="normal">Normais</option><option value="small">Pequenas</option><option value="none">Sem margens</option></select></label>
        <label className="check"><input type="checkbox" checked={options.landscape} onChange={(event) => setOptions((current) => ({ ...current, landscape: event.target.checked }))} /> Paisagem</label>
      </div></details>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button primary convert-button" disabled={busy}>{busy ? <><span className="spinner" /> Preparando...</> : <>Converter para PDF <ArrowRight size={19} /></>}</button>
    </div>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true" /> Seus arquivos são apagados após o download.</p>
  </form>;
}
