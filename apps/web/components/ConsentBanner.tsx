"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(!localStorage.getItem("htmlpdf-consent-v1")); }, []);
  if (!visible) return null;
  const choose = (value: "essential" | "all") => { localStorage.setItem("htmlpdf-consent-v1", value); window.dispatchEvent(new CustomEvent("consentchange", { detail: value })); setVisible(false); };
  return <aside className="consent" aria-label="Preferências de privacidade"><div><strong>Sua privacidade importa</strong><p>Usamos armazenamento essencial para o funcionamento. Com sua permissão, também podemos usar medição e publicidade. <Link href="/privacidade">Saiba mais</Link>.</p></div><div className="consent-actions"><button className="button secondary small" onClick={() => choose("essential")}>Somente essenciais</button><button className="button primary small" onClick={() => choose("all")}>Aceitar todos</button></div></aside>;
}
