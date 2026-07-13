import type { FastifyRequest } from "fastify";
import { config } from "./config.js";
import { connection } from "./redis.js";
import { clientIp } from "./security.js";

export async function enforceRateLimit(request: FastifyRequest) {
  const ip = clientIp(request);
  const now = Date.now();
  const keys = [
    { key: `rate:burst:${ip}:${Math.floor(now / 600_000)}`, limit: config.rateLimitTenMinutes, ttl: 600 },
    { key: `rate:hour:${ip}:${Math.floor(now / 3_600_000)}`, limit: config.rateLimitHour, ttl: 3600 },
  ];
  for (const item of keys) {
    const count = await connection.incr(item.key);
    if (count === 1) await connection.expire(item.key, item.ttl);
    if (count > item.limit) throw Object.assign(new Error("Muitas conversões. Aguarde alguns minutos e tente novamente."), { statusCode: 429 });
  }
  return ip;
}
