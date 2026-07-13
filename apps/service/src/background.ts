import fs from "node:fs/promises";
import path from "node:path";
import { config } from "./config.js";
import type { BackgroundJob } from "./types.js";

export async function removeBackground(job: BackgroundJob) {
  const outputPath = path.join(config.jobDir, job.token, "output.png");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.imageTimeoutMs);
  try {
    const response = await fetch(`${config.backgroundServiceUrl}/remove-background`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ inputPath: job.inputPath, outputPath }),
      signal: controller.signal,
    });
    const body = await response.json().catch(() => ({})) as { message?: string };
    if (!response.ok) throw new Error(body.message || "Nao foi possivel remover o fundo da imagem.");
    const stat = await fs.stat(outputPath);
    if (stat.size === 0) throw new Error("A imagem processada ficou vazia.");
    return { outputPath, size: stat.size };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new Error("A remocao do fundo demorou demais. Tente uma imagem menor.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
