import dns from "node:dns/promises";
import net from "node:net";
import type { FastifyRequest } from "fastify";

const blockedHostnames = new Set(["localhost", "localhost.localdomain", "metadata.google.internal"]);

function isPrivateV4(ip: string) {
  const p = ip.split(".").map(Number);
  if (p.length !== 4) return true;
  const [a, b] = p as [number, number, number, number];
  return a === 0 || a === 10 || a === 127 || a >= 224 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19));
}

function isPrivateV6(ip: string) {
  const value = ip.toLowerCase().split("%")[0] ?? "";
  return value === "::" || value === "::1" || value.startsWith("fc") || value.startsWith("fd") ||
    value.startsWith("fe8") || value.startsWith("fe9") || value.startsWith("fea") || value.startsWith("feb") ||
    value.startsWith("::ffff:127.") || value.startsWith("::ffff:10.") || value.startsWith("::ffff:192.168.") ||
    value.startsWith("::ffff:169.254.");
}

export function isPrivateAddress(ip: string) {
  const family = net.isIP(ip);
  return family === 4 ? isPrivateV4(ip) : family === 6 ? isPrivateV6(ip) : true;
}

export async function assertPublicUrl(raw: string) {
  let url: URL;
  try { url = new URL(raw); } catch { throw new Error("Informe uma URL válida."); }
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Use apenas URLs HTTP ou HTTPS.");
  if (url.username || url.password) throw new Error("URLs com autenticação não são permitidas.");
  const port = url.port || (url.protocol === "https:" ? "443" : "80");
  if (!["80", "443"].includes(port)) throw new Error("A URL deve usar a porta 80 ou 443.");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (blockedHostnames.has(hostname) || hostname.endsWith(".localhost") || hostname.endsWith(".local")) {
    throw new Error("Endereços de rede privada não são permitidos.");
  }
  const addresses = net.isIP(hostname) ? [{ address: hostname }] : await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("A URL aponta para uma rede privada ou reservada.");
  }
  return url.toString();
}

const youtubeId = /^[A-Za-z0-9_-]{11}$/;

/** Accept only a single public YouTube video or Short, never a playlist/channel URL. */
export function assertYoutubeVideoUrl(raw: string) {
  let url: URL;
  try { url = new URL(raw); } catch { throw Object.assign(new Error("Informe um link válido do YouTube."), { statusCode: 400 }); }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw Object.assign(new Error("Informe um link público do YouTube."), { statusCode: 400 });
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
  if (url.searchParams.has('list')) throw Object.assign(new Error("Playlists não são aceitas. Informe somente um vídeo."), { statusCode: 400 });

  let id = '';
  if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
  if (host === 'youtube.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v') || '';
    else {
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length === 2 && parts[0] === 'shorts') id = parts[1] || '';
    }
  }
  if (!youtubeId.test(id)) throw Object.assign(new Error("Use um link de vídeo ou Short do YouTube."), { statusCode: 400 });
  return `https://www.youtube.com/watch?v=${id}`;
}

export function clientIp(request: FastifyRequest) {
  const forwarded = request.headers["x-forwarded-for"];
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(",")[0])?.trim() || request.ip;
}

export async function verifyTurnstile(token: string | undefined, ip: string, secret: string) {
  if (!secret) return true;
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token, remoteip: ip });
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(8_000) });
  const result = await response.json() as { success?: boolean };
  return result.success === true;
}
