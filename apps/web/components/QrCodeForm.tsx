"use client";
import { useState } from "react";
import { ArrowRight, LockKeyhole, QrCode, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const sizeOptions = [
  { value: "512", label: "Médio" },
  { value: "768", label: "Grande" },
  { value: "1024", label: "Alta resolução" },
];

export function QrCodeForm() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";
  const [content, setContent] = useState("");
  const [size, setSize] = useState("768");
  const [darkColor, setDarkColor] = useState("#111827");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const value = content.trim();
    setError("");
    if (!value) {
      setError("Digite um link, texto, telefone ou informacao para criar o QR Code.");
      return;
    }
    if (value.length > 2000) {
      setError("Use no maximo 2000 caracteres para manter o QR Code facil de ler.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${apiBase}/conversions/qr-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: value, size: Number(size), margin: 3, darkColor }),
      });
      const result = await response.json() as { token?: string; message?: string };
      if (!response.ok || !result.token) throw new Error(result.message || "Nao foi possivel gerar o QR Code.");
      router.push(`/baixar/${result.token}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Nao foi possivel gerar o QR Code.");
      setBusy(false);
    }
  }

  return <form className="qr-tool" onSubmit={submit} aria-busy={busy}>
    <div className="qr-preview" aria-hidden="true">
      <div><QrCode /></div>
      <span>PNG</span>
    </div>
    <label className="qr-field">Texto ou link do QR Code
      <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={2000} placeholder="Exemplo: https://www.4dtech.com.br, WhatsApp, texto, cupom ou endereco" />
      <small>{content.length}/2000 caracteres</small>
    </label>
    <div className="qr-options">
      <label>Tamanho
        <select value={size} onChange={(event) => setSize(event.target.value)}>
          {sizeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
        </select>
      </label>
      <label>Cor
        <input type="color" value={darkColor} onChange={(event) => setDarkColor(event.target.value)} aria-label="Cor do QR Code" />
      </label>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button type="submit" className="button primary convert-button" disabled={busy}>{busy ? <><span className="spinner" /> Gerando QR Code...</> : <><Sparkles size={18} /> Gerar QR Code <ArrowRight size={19} /></>}</button>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true" /> O arquivo fica temporario e e removido depois do download.</p>
  </form>;
}
