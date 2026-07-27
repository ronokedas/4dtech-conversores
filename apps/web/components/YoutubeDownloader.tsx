"use client";

import { useState } from "react";
import { ArrowRight, Link as LinkIcon, LockKeyhole, Video } from "lucide-react";
import { useRouter } from "next/navigation";

export function YoutubeDownloader() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("720");
  const [authorized, setAuthorized] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "/api";

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!url.trim()) return setError("Cole o link do vídeo antes de continuar.");
    if (!authorized) return setError("Confirme que você possui autorização para baixar este conteúdo.");
    setBusy(true);
    try {
      const response = await fetch(`${apiBase}/conversions/youtube-mp4`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, quality: Number(quality), authorized }),
      });
      const result = await response.json() as { token?: string; message?: string };
      if (!response.ok || !result.token) throw new Error(result.message || "Não foi possível iniciar o download.");
      router.push(`/baixar/${result.token}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível iniciar o download.");
      setBusy(false);
    }
  }

  return <form className="youtube-tool" onSubmit={submit} aria-busy={busy}>
    <div className="youtube-intro"><Video aria-hidden="true" /><div><strong>Cole o link do YouTube</strong><span>Vídeos públicos e Shorts, um por vez.</span></div></div>
    <label className="url-field"><span>Link do vídeo</span><div><LinkIcon aria-hidden="true" /><input type="url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://www.youtube.com/watch?v=..." required /></div><small>Não aceitamos playlists, canais ou transmissões ao vivo.</small></label>
    <div className="edit-options utility-options"><label>Qualidade máxima<select value={quality} onChange={(event) => setQuality(event.target.value)}><option value="360">360p (leve)</option><option value="720">720p (recomendado)</option><option value="1080">1080p (alta)</option></select></label></div>
    <label className="youtube-consent"><input type="checkbox" checked={authorized} onChange={(event) => setAuthorized(event.target.checked)} /> <span>Confirmo que possuo os direitos ou a autorização necessária para baixar este conteúdo.</span></label>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <button type="submit" className="button primary convert-button" disabled={busy}>{busy ? <><span className="spinner" /> Preparando vídeo...</> : <>Baixar vídeo em MP4 <ArrowRight size={19} /></>}</button>
    <p className="privacy-note"><LockKeyhole size={15} aria-hidden="true" /> Arquivos temporários, removidos após o download ou expiração.</p>
  </form>;
}
