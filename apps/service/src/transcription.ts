import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import type { AudioTextJob } from "./types.js";

type TranscriptionResponse = {
  text?: string;
  language?: string;
  duration?: number;
};

export async function transcribeAudio(job: AudioTextJob) {
  const bytes = await fs.readFile(job.inputPath);
  const form = new FormData();
  form.append("file", new Blob([bytes]), job.originalName);
  form.append("language", job.language);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.audioTimeoutMs);
  try {
    const response = await fetch(`${config.transcriptionServiceUrl}/transcribe`, { method: "POST", body: form, signal: controller.signal });
    const result = await response.json().catch(() => ({})) as TranscriptionResponse & { detail?: string };
    if (!response.ok || !result.text) throw new Error(result.detail || "Nao foi possivel transcrever este audio.");
    const outputPath = path.join(config.jobDir, job.token, "output.txt");
    const metadata = [
      "Transcricao gerada por Documentos Online - 4D Tech",
      `Arquivo original: ${job.originalName}`,
      result.language ? `Idioma detectado: ${result.language}` : undefined,
      result.duration ? `Duracao aproximada: ${Math.round(result.duration)} segundos` : undefined,
    ].filter(Boolean);
    const header = `${metadata.join("\n")}\n\n----- TEXTO -----\n\n`;
    await fs.writeFile(outputPath, `${header}${result.text.trim()}\n`, "utf8");
    await fs.chmod(outputPath, 0o664).catch(() => undefined);
    const stat = await fs.stat(outputPath);
    return { path: outputPath, size: stat.size };
  } finally {
    clearTimeout(timeout);
  }
}
