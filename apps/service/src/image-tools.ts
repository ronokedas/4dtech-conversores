import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { config } from "./config.js";
import type { ImageUtilityJob } from "./types.js";

function extensionFor(format: NonNullable<ImageUtilityJob["format"]>) {
  return format === "jpeg" ? "jpg" : format;
}

function mimeFor(format: NonNullable<ImageUtilityJob["format"]>) {
  return format === "jpeg" ? "image/jpeg" : `image/${format}`;
}

function normalizeFormat(job: ImageUtilityJob) {
  if (job.type === "convert-image") return job.format || "webp";
  const ext = path.extname(job.originalName).toLowerCase();
  if (ext === ".png") return "png";
  if (ext === ".webp") return "webp";
  return "jpeg";
}

async function writeImage(job: ImageUtilityJob, pipeline: sharp.Sharp, format: "jpeg" | "png" | "webp") {
  const outputPath = path.join(config.jobDir, job.token, `output.${extensionFor(format)}`);
  const quality = Math.max(35, Math.min(95, job.quality || 80));
  if (format === "jpeg") pipeline = pipeline.jpeg({ quality, mozjpeg: true });
  if (format === "webp") pipeline = pipeline.webp({ quality });
  if (format === "png") pipeline = pipeline.png({ compressionLevel: 9, palette: job.type === "compress-image" });
  await pipeline.toFile(outputPath);
  const stat = await fs.stat(outputPath);
  await fs.chmod(outputPath, 0o664).catch(() => undefined);
  return { path: outputPath, size: stat.size, outputFile: path.basename(outputPath), mimeType: mimeFor(format), extension: extensionFor(format) };
}

export async function processImage(job: ImageUtilityJob) {
  const metadata = await sharp(job.inputPath, { limitInputPixels: 80_000_000 }).metadata();
  if (!metadata.width || !metadata.height) throw new Error("Nao foi possivel ler esta imagem.");
  const format = normalizeFormat(job);
  let pipeline = sharp(job.inputPath, { limitInputPixels: 80_000_000 }).rotate();
  if (job.type === "resize-image") {
    const width = job.width ? Math.max(16, Math.min(8000, job.width)) : undefined;
    const height = job.height ? Math.max(16, Math.min(8000, job.height)) : undefined;
    if (!width && !height) throw new Error("Informe largura ou altura para redimensionar.");
    pipeline = pipeline.resize({ width, height, fit: "inside", withoutEnlargement: true });
  }
  return writeImage(job, pipeline, format);
}
