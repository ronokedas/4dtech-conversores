import path from "node:path";

const number = (name: string, fallback: number) => {
  const parsed = Number(process.env[name]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  port: number("PORT", 4000),
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  jobDir: path.resolve(process.env.JOB_DIR ?? "./jobs"),
  ttlSeconds: number("JOB_TTL_SECONDS", 3600),
  maxUploadBytes: number("MAX_UPLOAD_MB", 25) * 1024 * 1024,
  maxExtractedBytes: number("MAX_EXTRACTED_MB", 100) * 1024 * 1024,
  maxZipFiles: number("MAX_ZIP_FILES", 500),
  maxPdfBytes: number("MAX_PDF_MB", 50) * 1024 * 1024,
  maxImageUploadBytes: number("MAX_IMAGE_UPLOAD_MB", 15) * 1024 * 1024,
  maxAudioUploadBytes: number("MAX_AUDIO_UPLOAD_MB", 50) * 1024 * 1024,
  maxVideoUploadBytes: number("MAX_VIDEO_UPLOAD_MB", 100) * 1024 * 1024,
  conversionTimeoutMs: number("CONVERSION_TIMEOUT_MS", 45_000),
  imageTimeoutMs: number("IMAGE_TIMEOUT_MS", 60_000),
  audioTimeoutMs: number("AUDIO_TIMEOUT_MS", 900_000),
  mediaTimeoutMs: number("MEDIA_TIMEOUT_MS", 180_000),
  workerConcurrency: number("WORKER_CONCURRENCY", 2),
  rateLimitTenMinutes: number("RATE_LIMIT_10_MINUTES", 300),
  rateLimitHour: number("RATE_LIMIT_HOUR", 2000),
  backgroundServiceUrl: process.env.BACKGROUND_SERVICE_URL ?? "http://background:5000",
  transcriptionServiceUrl: process.env.TRANSCRIPTION_SERVICE_URL ?? "http://transcriber:5100",
  turnstileSecret: process.env.TURNSTILE_SECRET_KEY ?? "",
};
