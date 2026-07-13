"use client";
import { useEffect } from "react";

declare global { interface Window { adsbygoogle?: unknown[] } }
export function AdSlot({ slot, className = "" }: { slot?: string; className?: string }) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  useEffect(() => { if (client && slot) { try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {} } }, [client, slot]);
  if (!client || !slot) return null;
  return <aside className={`ad-shell ${className}`} aria-label="Publicidade"><span>Publicidade</span><ins className="adsbygoogle" style={{ display: "block" }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" /></aside>;
}
