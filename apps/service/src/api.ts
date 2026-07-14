import crypto from "node:crypto";
import fs from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import Fastify, { type FastifyReply, type FastifyRequest } from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { config } from "./config.js";
import { enforceRateLimit } from "./rate-limit.js";
import { connection, jobKey, queue, setRecord } from "./redis.js";
import { assertPublicUrl, verifyTurnstile } from "./security.js";
import { pdfOptionsSchema, type ConversionJob, type PdfUtilityJob } from "./types.js";

process.umask(0o007);
const app = Fastify({ logger: { redact: ["req.headers.authorization", "req.body", "req.url"] }, bodyLimit: config.maxUploadBytes * 10 });
await app.register(cors, { origin: false });
await app.register(multipart, { limits: { files: 25, fileSize: Math.max(config.maxUploadBytes, config.maxImageUploadBytes, config.maxAudioUploadBytes, config.maxVideoUploadBytes), fields: 16 } });
await fs.mkdir(config.jobDir, { recursive: true });

app.get("/health", async () => ({ ok: true }));

async function makeJobDir(token: string) {
  const dir = path.join(config.jobDir, token);
  await fs.mkdir(dir, { recursive: true, mode: 0o770 });
  return dir;
}

const pdfUtilityTypes = new Set<PdfUtilityJob["type"]>(["compress-pdf", "merge-pdf", "split-pdf", "image-pdf", "pdf-jpg", "sign-pdf", "protect-pdf", "unlock-pdf", "organize-pdf"]);
const imageExtensions = [".png", ".jpg", ".jpeg", ".webp"];
const videoExtensions = [".mp4", ".mov", ".mkv", ".webm", ".avi", ".mpeg", ".mpg", ".m4v"];
type UtilityOptions = {
  type: PdfUtilityJob["type"];
  allowedExtensions: string[];
  defaultName: string;
  multiple?: boolean;
  minFiles?: number;
  maxFiles?: number;
  defaultTool?: string;
};

function validPosition(value?: string): PdfUtilityJob["position"] {
  return value && ["top-left", "top-center", "center", "bottom-left", "bottom-center"].includes(value) ? value as PdfUtilityJob["position"] : "bottom-left";
}

async function createPdfUtilityJob(request: FastifyRequest, reply: FastifyReply, options: UtilityOptions) {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  const fields: Record<string, string> = {};
  const inputPaths: string[] = [];
  let originalName = options.defaultName;
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (!options.multiple && inputPaths.length) throw Object.assign(new Error("Envie apenas um arquivo."), { statusCode: 400 });
        if (inputPaths.length >= (options.maxFiles || 20)) throw Object.assign(new Error("Envie menos arquivos de uma vez."), { statusCode: 400 });
        const receivedName = path.basename(part.filename || options.defaultName);
        const ext = path.extname(receivedName).toLowerCase();
        if (!options.allowedExtensions.includes(ext)) throw Object.assign(new Error(`Formato invalido. Use: ${options.allowedExtensions.join(", ")}.`), { statusCode: 400 });
        if (inputPaths.length === 0) originalName = receivedName;
        const inputPath = path.join(dir, `input-${inputPaths.length}${ext}`);
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("O arquivo ultrapassa o limite de tamanho."), { statusCode: 413 });
        if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) {
          const stat = await fs.stat(inputPath);
          if (stat.size > config.maxImageUploadBytes) throw Object.assign(new Error("Cada imagem deve ter no maximo 15 MB."), { statusCode: 413 });
        }
        inputPaths.push(inputPath);
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (inputPaths.length < (options.minFiles || 1)) throw Object.assign(new Error(options.multiple ? "Selecione os arquivos para continuar." : "Selecione um arquivo para continuar."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const page = Math.max(1, Math.min(999, Number.parseInt(fields.page || "1", 10) || 1));
    const fontSize = Math.max(8, Math.min(72, Number.parseInt(fields.fontSize || "22", 10) || 22));
    const job: PdfUtilityJob = {
      token,
      type: options.type,
      inputPath: inputPaths[0],
      inputPaths,
      originalName,
      ranges: fields.ranges?.trim().slice(0, 120),
      order: fields.order?.trim().slice(0, 240),
      text: fields.text?.trim().slice(0, 160),
      password: fields.password?.trim().slice(0, 160),
      page,
      position: validPosition(fields.position),
      fontSize,
      createdAt: Date.now(),
    };
    if (!pdfUtilityTypes.has(job.type)) throw Object.assign(new Error("Ferramenta invalida."), { statusCode: 400 });
    await setRecord(token, { status: "queued", tool: options.defaultTool || options.type, updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
}

function safeInt(value: string | undefined, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value || "", 10);
  return Number.isFinite(parsed) ? Math.max(min, Math.min(max, parsed)) : fallback;
}

async function createSingleFileJob(request: FastifyRequest, options: { allowedExtensions: string[]; defaultName: string; maxBytes: number }) {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = options.defaultName;
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas um arquivo."), { statusCode: 400 });
        originalName = path.basename(part.filename || options.defaultName);
        const ext = path.extname(originalName).toLowerCase();
        if (!options.allowedExtensions.includes(ext)) throw Object.assign(new Error(`Formato invalido. Use: ${options.allowedExtensions.join(", ")}.`), { statusCode: 400 });
        inputPath = path.join(dir, `input${ext}`);
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("O arquivo ultrapassa o limite de tamanho."), { statusCode: 413 });
        const stat = await fs.stat(inputPath);
        if (stat.size > options.maxBytes) throw Object.assign(new Error("O arquivo ultrapassa o limite permitido para esta ferramenta."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 1000);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione um arquivo para continuar."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    return { token, dir, inputPath, originalName, fields };
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
}

app.post("/conversions/file", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = "";
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas um arquivo."), { statusCode: 400 });
        originalName = path.basename(part.filename || "arquivo.html");
        const ext = path.extname(originalName).toLowerCase();
        if (![".html", ".htm", ".zip"].includes(ext)) throw Object.assign(new Error("Use um arquivo HTML, HTM ou ZIP."), { statusCode: 400 });
        inputPath = path.join(dir, `input${ext}`);
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("O arquivo ultrapassa o limite de tamanho."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione um arquivo HTML ou ZIP."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const options = pdfOptionsSchema.parse({ format: fields.format, landscape: fields.landscape, margin: fields.margin });
    const job: ConversionJob = { token, type: "file", inputPath, originalName, options, createdAt: Date.now() };
    await setRecord(token, { status: "queued", tool: "pdf", updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
});

app.post("/conversions/url", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const body = request.body as Record<string, unknown> | null;
  if (!body || typeof body.url !== "string") throw Object.assign(new Error("Informe a URL da pagina."), { statusCode: 400 });
  if (!(await verifyTurnstile(typeof body.turnstileToken === "string" ? body.turnstileToken : undefined, ip, config.turnstileSecret))) {
    throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
  }
  const sourceUrl = await assertPublicUrl(body.url);
  const token = crypto.randomBytes(24).toString("base64url");
  const options = pdfOptionsSchema.parse(body.options ?? {});
  const job: ConversionJob = { token, type: "url", sourceUrl, originalName: "pagina-convertida.html", options, createdAt: Date.now() };
  await makeJobDir(token);
  await setRecord(token, { status: "queued", tool: "pdf", updatedAt: Date.now() });
  await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
  return reply.code(202).send({ token });
});

app.post("/conversions/background", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = "";
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas uma imagem."), { statusCode: 400 });
        originalName = path.basename(part.filename || "imagem.png");
        const ext = path.extname(originalName).toLowerCase();
        if (![".png", ".jpg", ".jpeg", ".webp"].includes(ext)) throw Object.assign(new Error("Use uma imagem PNG ou JPG."), { statusCode: 400 });
        inputPath = path.join(dir, `input${ext}`);
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("A imagem ultrapassa o limite de tamanho."), { statusCode: 413 });
        const stat = await fs.stat(inputPath);
        if (stat.size > config.maxImageUploadBytes) throw Object.assign(new Error("A imagem deve ter no maximo 15 MB."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione uma imagem PNG ou JPG."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const job: ConversionJob = { token, type: "background", inputPath, originalName, createdAt: Date.now() };
    await setRecord(token, { status: "queued", tool: "background", updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
});

app.post("/conversions/audio-text", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = "";
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas um arquivo de audio ou video."), { statusCode: 400 });
        originalName = path.basename(part.filename || "audio.mp3");
        const ext = path.extname(originalName).toLowerCase();
        if (![".mp3", ".wav", ".m4a", ".ogg", ".webm", ".mp4", ".mpeg", ".mpga"].includes(ext)) throw Object.assign(new Error("Use MP3, WAV, M4A, OGG, WEBM ou MP4."), { statusCode: 400 });
        inputPath = path.join(dir, `input${ext}`);
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("O arquivo ultrapassa o limite de tamanho."), { statusCode: 413 });
        const stat = await fs.stat(inputPath);
        if (stat.size > config.maxAudioUploadBytes) throw Object.assign(new Error("O arquivo deve ter no maximo 50 MB."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione um audio ou video curto."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const rawLanguage = fields.language || "pt";
    const language = ["pt", "en", "es", "auto"].includes(rawLanguage) ? rawLanguage as "pt" | "en" | "es" | "auto" : "pt";
    const job: ConversionJob = { token, type: "audio-text", inputPath, originalName, language, createdAt: Date.now() };
    await setRecord(token, { status: "queued", tool: "audio-text", updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
});

app.post("/conversions/qr-code", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const body = request.body as Record<string, unknown> | null;
  const content = typeof body?.content === "string" ? body.content.trim() : "";
  if (!content) throw Object.assign(new Error("Digite o texto ou link para gerar o QR Code."), { statusCode: 400 });
  if (content.length > 2000) throw Object.assign(new Error("O conteudo do QR Code deve ter no maximo 2000 caracteres."), { statusCode: 413 });
  if (!(await verifyTurnstile(typeof body?.turnstileToken === "string" ? body.turnstileToken : undefined, ip, config.turnstileSecret))) {
    throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
  }
  const token = crypto.randomBytes(24).toString("base64url");
  await makeJobDir(token);
  const rawSize = Number(body?.size);
  const rawMargin = Number(body?.margin);
  const rawColor = typeof body?.darkColor === "string" ? body.darkColor.trim() : "#111827";
  const size = Number.isFinite(rawSize) ? Math.max(256, Math.min(1200, Math.round(rawSize))) : 768;
  const margin = Number.isFinite(rawMargin) ? Math.max(1, Math.min(8, Math.round(rawMargin))) : 3;
  const darkColor = /^#[0-9a-fA-F]{6}$/.test(rawColor) ? `${rawColor}ff` : "#111827ff";
  const job: ConversionJob = { token, type: "qr-code", content, size, margin, darkColor, originalName: "qr-code", createdAt: Date.now() };
  await setRecord(token, { status: "queued", tool: "qr-code", updatedAt: Date.now() });
  await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
  return reply.code(202).send({ token });
});

app.post("/conversions/txt-pdf", async (request, reply) => {
  const { token, inputPath, originalName, fields } = await createSingleFileJob(request, { allowedExtensions: [".txt"], defaultName: "texto.txt", maxBytes: config.maxUploadBytes });
  const job: ConversionJob = { token, type: "txt-pdf", inputPath, originalName, title: fields.title?.trim().slice(0, 120), fontSize: safeInt(fields.fontSize, 12, 10, 16), createdAt: Date.now() };
  await setRecord(token, { status: "queued", tool: "txt-pdf", updatedAt: Date.now() });
  await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
  return reply.code(202).send({ token });
});

app.post("/conversions/markdown-pdf", async (request, reply) => {
  const { token, inputPath, originalName, fields } = await createSingleFileJob(request, { allowedExtensions: [".md", ".markdown", ".txt"], defaultName: "documento.md", maxBytes: config.maxUploadBytes });
  const job: ConversionJob = { token, type: "markdown-pdf", inputPath, originalName, title: fields.title?.trim().slice(0, 120), fontSize: safeInt(fields.fontSize, 12, 10, 16), createdAt: Date.now() };
  await setRecord(token, { status: "queued", tool: "markdown-pdf", updatedAt: Date.now() });
  await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
  return reply.code(202).send({ token });
});

app.post("/conversions/compress-image", async (request, reply) => {
  const { token, inputPath, originalName, fields } = await createSingleFileJob(request, { allowedExtensions: imageExtensions, defaultName: "imagem.jpg", maxBytes: config.maxImageUploadBytes });
  const job: ConversionJob = { token, type: "compress-image", inputPath, originalName, quality: safeInt(fields.quality, 75, 35, 95), createdAt: Date.now() };
  await setRecord(token, { status: "queued", tool: "compress-image", updatedAt: Date.now() });
  await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
  return reply.code(202).send({ token });
});

app.post("/conversions/resize-image", async (request, reply) => {
  const { token, dir, inputPath, originalName, fields } = await createSingleFileJob(request, { allowedExtensions: imageExtensions, defaultName: "imagem.jpg", maxBytes: config.maxImageUploadBytes });
  const width = fields.width ? safeInt(fields.width, 0, 16, 8000) : undefined;
  const height = fields.height ? safeInt(fields.height, 0, 16, 8000) : undefined;
  if (!width && !height) {
    await fs.rm(dir, { recursive: true, force: true });
    throw Object.assign(new Error("Informe largura ou altura para redimensionar."), { statusCode: 400 });
  }
  const job: ConversionJob = { token, type: "resize-image", inputPath, originalName, width, height, quality: safeInt(fields.quality, 85, 35, 95), createdAt: Date.now() };
  await setRecord(token, { status: "queued", tool: "resize-image", updatedAt: Date.now() });
  await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
  return reply.code(202).send({ token });
});

app.post("/conversions/convert-image", async (request, reply) => {
  const { token, inputPath, originalName, fields } = await createSingleFileJob(request, { allowedExtensions: imageExtensions, defaultName: "imagem.jpg", maxBytes: config.maxImageUploadBytes });
  const format = ["jpeg", "png", "webp"].includes(fields.format || "") ? fields.format as "jpeg" | "png" | "webp" : "webp";
  const job: ConversionJob = { token, type: "convert-image", inputPath, originalName, format, quality: safeInt(fields.quality, 85, 35, 95), createdAt: Date.now() };
  await setRecord(token, { status: "queued", tool: "convert-image", updatedAt: Date.now() });
  await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
  return reply.code(202).send({ token });
});

app.post("/conversions/video-mp3", async (request, reply) => {
  const { token, inputPath, originalName, fields } = await createSingleFileJob(request, { allowedExtensions: videoExtensions, defaultName: "video.mp4", maxBytes: config.maxVideoUploadBytes });
  const bitrate = ["96k", "128k", "192k", "256k"].includes(fields.bitrate || "") ? fields.bitrate as "96k" | "128k" | "192k" | "256k" : "128k";
  const job: ConversionJob = { token, type: "video-mp3", inputPath, originalName, bitrate, createdAt: Date.now() };
  await setRecord(token, { status: "queued", tool: "video-mp3", updatedAt: Date.now() });
  await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
  return reply.code(202).send({ token });
});

app.post("/conversions/word", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = "";
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas um documento."), { statusCode: 400 });
        originalName = path.basename(part.filename || "documento.docx");
        const ext = path.extname(originalName).toLowerCase();
        if (![".doc", ".docx"].includes(ext)) throw Object.assign(new Error("Use um arquivo DOC ou DOCX."), { statusCode: 400 });
        inputPath = path.join(dir, `input${ext}`);
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("O documento ultrapassa o limite de tamanho."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione um arquivo DOC ou DOCX."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const job: ConversionJob = { token, type: "word", inputPath, originalName, createdAt: Date.now() };
    await setRecord(token, { status: "queued", tool: "word", updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
});

app.post("/conversions/excel", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = "";
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas uma planilha."), { statusCode: 400 });
        originalName = path.basename(part.filename || "planilha.xlsx");
        const ext = path.extname(originalName).toLowerCase();
        if (![".xls", ".xlsx"].includes(ext)) throw Object.assign(new Error("Use um arquivo XLS ou XLSX."), { statusCode: 400 });
        inputPath = path.join(dir, `input${ext}`);
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("A planilha ultrapassa o limite de tamanho."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione um arquivo XLS ou XLSX."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const job: ConversionJob = { token, type: "excel", inputPath, originalName, landscape: fields.orientation === "landscape", createdAt: Date.now() };
    await setRecord(token, { status: "queued", tool: "excel", updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
});

app.post("/conversions/pdf-word", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = "";
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas um PDF."), { statusCode: 400 });
        originalName = path.basename(part.filename || "arquivo.pdf");
        const ext = path.extname(originalName).toLowerCase();
        if (ext !== ".pdf") throw Object.assign(new Error("Use um arquivo PDF."), { statusCode: 400 });
        inputPath = path.join(dir, "input.pdf");
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("O PDF ultrapassa o limite de tamanho."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione um arquivo PDF."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const job: ConversionJob = { token, type: "pdf-word", inputPath, originalName, createdAt: Date.now() };
    await setRecord(token, { status: "queued", tool: "pdf-word", updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
});

app.post("/conversions/pdf-excel", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = "";
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas um PDF."), { statusCode: 400 });
        originalName = path.basename(part.filename || "arquivo.pdf");
        const ext = path.extname(originalName).toLowerCase();
        if (ext !== ".pdf") throw Object.assign(new Error("Use um arquivo PDF."), { statusCode: 400 });
        inputPath = path.join(dir, "input.pdf");
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("O PDF ultrapassa o limite de tamanho."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione um arquivo PDF."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const job: ConversionJob = { token, type: "pdf-excel", inputPath, originalName, createdAt: Date.now() };
    await setRecord(token, { status: "queued", tool: "pdf-excel", updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
});

app.post("/conversions/edit-pdf", async (request, reply) => {
  const ip = await enforceRateLimit(request);
  const token = crypto.randomBytes(24).toString("base64url");
  const dir = await makeJobDir(token);
  let inputPath = "";
  let originalName = "";
  const fields: Record<string, string> = {};
  try {
    for await (const part of request.parts()) {
      if (part.type === "file") {
        if (inputPath) throw Object.assign(new Error("Envie apenas um PDF."), { statusCode: 400 });
        originalName = path.basename(part.filename || "arquivo.pdf");
        const ext = path.extname(originalName).toLowerCase();
        if (ext !== ".pdf") throw Object.assign(new Error("Use um arquivo PDF."), { statusCode: 400 });
        inputPath = path.join(dir, "input.pdf");
        await pipeline(part.file, createWriteStream(inputPath, { flags: "wx", mode: 0o640 }));
        if (part.file.truncated) throw Object.assign(new Error("O PDF ultrapassa o limite de tamanho."), { statusCode: 413 });
      } else {
        fields[part.fieldname] = String(part.value).slice(0, 500);
      }
    }
    if (!inputPath) throw Object.assign(new Error("Selecione um arquivo PDF."), { statusCode: 400 });
    if (!(await verifyTurnstile(fields.turnstileToken, ip, config.turnstileSecret))) {
      throw Object.assign(new Error("Nao foi possivel validar o desafio de seguranca."), { statusCode: 403 });
    }
    const rawPosition = fields.position || "";
    const position = ["top-left", "top-center", "center", "bottom-left", "bottom-center"].includes(rawPosition) ? rawPosition as "top-left" | "top-center" | "center" | "bottom-left" | "bottom-center" : "top-left";
    const page = Math.max(1, Math.min(999, Number.parseInt(fields.page || "1", 10) || 1));
    const fontSize = Math.max(8, Math.min(72, Number.parseInt(fields.fontSize || "18", 10) || 18));
    const text = (fields.text || "").trim().slice(0, 160);
    if (!text) throw Object.assign(new Error("Digite o texto que deseja adicionar ao PDF."), { statusCode: 400 });
    const job: ConversionJob = { token, type: "edit-pdf", inputPath, originalName, text, page, position, fontSize, createdAt: Date.now() };
    await setRecord(token, { status: "queued", tool: "edit-pdf", updatedAt: Date.now() });
    await queue.add("convert", job, { jobId: token, removeOnComplete: 100, removeOnFail: 100, attempts: 1 });
    return reply.code(202).send({ token });
  } catch (error) {
    await fs.rm(dir, { recursive: true, force: true });
    throw error;
  }
});

app.post("/conversions/compress-pdf", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "compress-pdf",
  allowedExtensions: [".pdf"],
  defaultName: "arquivo.pdf",
}));

app.post("/conversions/merge-pdf", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "merge-pdf",
  allowedExtensions: [".pdf"],
  defaultName: "arquivos.pdf",
  multiple: true,
  minFiles: 2,
  maxFiles: 20,
}));

app.post("/conversions/split-pdf", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "split-pdf",
  allowedExtensions: [".pdf"],
  defaultName: "arquivo.pdf",
}));

app.post("/conversions/image-pdf", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "image-pdf",
  allowedExtensions: [".png", ".jpg", ".jpeg"],
  defaultName: "imagem.png",
  multiple: true,
  minFiles: 1,
  maxFiles: 20,
}));

app.post("/conversions/pdf-jpg", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "pdf-jpg",
  allowedExtensions: [".pdf"],
  defaultName: "arquivo.pdf",
}));

app.post("/conversions/sign-pdf", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "sign-pdf",
  allowedExtensions: [".pdf"],
  defaultName: "arquivo.pdf",
}));

app.post("/conversions/protect-pdf", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "protect-pdf",
  allowedExtensions: [".pdf"],
  defaultName: "arquivo.pdf",
}));

app.post("/conversions/unlock-pdf", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "unlock-pdf",
  allowedExtensions: [".pdf"],
  defaultName: "arquivo.pdf",
}));

app.post("/conversions/organize-pdf", async (request, reply) => createPdfUtilityJob(request, reply, {
  type: "organize-pdf",
  allowedExtensions: [".pdf"],
  defaultName: "arquivo.pdf",
}));

app.get<{ Params: { token: string } }>("/conversions/:token/status", async (request, reply) => {
  if (!/^[A-Za-z0-9_-]{32}$/.test(request.params.token)) return reply.code(404).send({ status: "expired" });
  const record = await connection.hgetall(jobKey(request.params.token));
  if (!record.status) return reply.code(404).send({ status: "expired" });
  return { status: record.status, filename: record.filename, size: record.size ? Number(record.size) : undefined, mimeType: record.mimeType, tool: record.tool, error: record.error };
});

app.get<{ Params: { token: string } }>("/conversions/:token/download", async (request, reply) => {
  const { token } = request.params;
  if (!/^[A-Za-z0-9_-]{32}$/.test(token)) return reply.code(404).send({ message: "Arquivo expirado." });
  const record = await connection.hgetall(jobKey(token));
  if (record.status !== "ready" || !record.filename) return reply.code(409).send({ message: "O arquivo ainda nao esta disponivel." });
  const claimed = await connection.set(`download:${token}`, "1", "EX", 300, "NX");
  if (!claimed) return reply.code(409).send({ message: "Este download ja foi iniciado." });
  const outputFile = record.outputFile || (record.mimeType === "image/png" ? "output.png" : "output.pdf");
  const outputPath = path.join(config.jobDir, token, outputFile);
  try { await fs.access(outputPath); } catch { await connection.del(jobKey(token)); return reply.code(410).send({ message: "Arquivo expirado." }); }
  const safeName = record.filename.replace(/[^\p{L}\p{N}._-]+/gu, "-");
  reply.header("Content-Type", record.mimeType || "application/pdf");
  reply.header("Content-Length", record.size || "");
  reply.header("Content-Disposition", `attachment; filename*=UTF-8''${encodeURIComponent(safeName)}`);
  reply.header("Cache-Control", "private, no-store");
  const stream = createReadStream(outputPath);
  let completed = false;
  stream.on("end", () => { completed = true; });
  reply.raw.on("finish", async () => {
    if (!completed) return;
    await Promise.allSettled([fs.rm(path.join(config.jobDir, token), { recursive: true, force: true }), connection.del(jobKey(token)), connection.del(`download:${token}`)]);
  });
  reply.raw.on("close", async () => {
    if (!completed) await connection.del(`download:${token}`);
  });
  return reply.send(stream);
});

app.setErrorHandler((error, _request, reply) => {
  const failure = error as Error & { statusCode?: number };
  const status = typeof failure.statusCode === "number" ? failure.statusCode : 500;
  if (status >= 500) app.log.error({ err: error }, "request failed");
  const message = status >= 500 ? "O servico encontrou um erro. Tente novamente." : failure.message;
  reply.code(status).send({ message });
});

const cleanup = setInterval(async () => {
  const now = Date.now();
  for (const entry of await fs.readdir(config.jobDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(config.jobDir, entry.name);
    const stat = await fs.stat(dir).catch(() => null);
    if (stat && now - stat.mtimeMs > config.ttlSeconds * 1000) {
      await fs.rm(dir, { recursive: true, force: true });
      await connection.del(jobKey(entry.name));
    }
  }
}, 60_000).unref();

const shutdown = async () => { clearInterval(cleanup); await app.close(); await queue.close(); await connection.quit(); process.exit(0); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
await app.listen({ port: config.port, host: "0.0.0.0" });
