import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { config } from "./config.js";
import type { PdfUtilityJob } from "./types.js";

const run = promisify(execFile);

function jobDir(job: PdfUtilityJob) {
  return path.join(config.jobDir, job.token);
}

async function ensureOutput(filePath: string) {
  const stat = await fs.stat(filePath);
  if (stat.size > config.maxPdfBytes && filePath.endsWith(".pdf")) throw new Error("O PDF final ultrapassou o limite permitido.");
  await fs.chmod(filePath, 0o664).catch(() => undefined);
  return { path: filePath, size: stat.size };
}

function safeBase(name: string, fallback: string) {
  return path.basename(name, path.extname(name)).replace(/[^\p{L}\p{N}._-]+/gu, "-") || fallback;
}

function parsePageList(input: string | undefined, total: number, fallbackAll = true) {
  const clean = (input || "").trim();
  if (!clean) return fallbackAll ? Array.from({ length: total }, (_, index) => index) : [0];
  const pages: number[] = [];
  for (const chunk of clean.split(",")) {
    const item = chunk.trim();
    if (!item) continue;
    const match = item.match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) throw new Error("Informe as paginas no formato 1,3,5-7.");
    const start = Number.parseInt(match[1]!, 10);
    const end = Number.parseInt(match[2] || match[1]!, 10);
    if (start < 1 || end < start || end > total) throw new Error(`O PDF possui ${total} pagina(s). Confira a numeracao informada.`);
    for (let page = start; page <= end; page += 1) pages.push(page - 1);
  }
  if (!pages.length) throw new Error("Informe pelo menos uma pagina valida.");
  return pages;
}

async function createPdfFromPages(inputPath: string, outputPath: string, pageIndexes: number[]) {
  const source = await PDFDocument.load(await fs.readFile(inputPath));
  const target = await PDFDocument.create();
  const copied = await target.copyPages(source, pageIndexes);
  copied.forEach((page) => target.addPage(page));
  await fs.writeFile(outputPath, await target.save());
  return ensureOutput(outputPath);
}

export async function mergePdfs(job: PdfUtilityJob) {
  const paths = job.inputPaths || [];
  if (paths.length < 2) throw new Error("Envie pelo menos dois PDFs para juntar.");
  const target = await PDFDocument.create();
  for (const inputPath of paths) {
    const source = await PDFDocument.load(await fs.readFile(inputPath));
    const copied = await target.copyPages(source, source.getPageIndices());
    copied.forEach((page) => target.addPage(page));
  }
  const outputPath = path.join(jobDir(job), "output.pdf");
  await fs.writeFile(outputPath, await target.save());
  return ensureOutput(outputPath);
}

export async function splitPdf(job: PdfUtilityJob) {
  if (!job.inputPath) throw new Error("Selecione um PDF.");
  const source = await PDFDocument.load(await fs.readFile(job.inputPath));
  const pages = parsePageList(job.ranges, source.getPageCount(), false);
  return createPdfFromPages(job.inputPath, path.join(jobDir(job), "output.pdf"), pages);
}

export async function organizePdf(job: PdfUtilityJob) {
  if (!job.inputPath) throw new Error("Selecione um PDF.");
  const source = await PDFDocument.load(await fs.readFile(job.inputPath));
  const pages = parsePageList(job.order, source.getPageCount());
  return createPdfFromPages(job.inputPath, path.join(jobDir(job), "output.pdf"), pages);
}

export async function imageToPdf(job: PdfUtilityJob) {
  const paths = job.inputPaths || [];
  if (!paths.length) throw new Error("Envie pelo menos uma imagem.");
  const pdf = await PDFDocument.create();
  for (const inputPath of paths) {
    const bytes = await fs.readFile(inputPath);
    const ext = path.extname(inputPath).toLowerCase();
    const image = ext === ".png" ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
    const maxWidth = 595.28;
    const maxHeight = 841.89;
    const ratio = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
    const width = image.width * ratio;
    const height = image.height * ratio;
    const page = pdf.addPage([maxWidth, maxHeight]);
    page.drawImage(image, { x: (maxWidth - width) / 2, y: (maxHeight - height) / 2, width, height });
  }
  const outputPath = path.join(jobDir(job), "output.pdf");
  await fs.writeFile(outputPath, await pdf.save());
  return ensureOutput(outputPath);
}

export async function pdfToJpg(job: PdfUtilityJob) {
  if (!job.inputPath) throw new Error("Selecione um PDF.");
  const dir = jobDir(job);
  const pagesDir = path.join(dir, "jpg-pages");
  await fs.mkdir(pagesDir, { recursive: true });
  await run("pdftoppm", ["-jpeg", "-r", "144", job.inputPath, path.join(pagesDir, "pagina")], { timeout: config.conversionTimeoutMs });
  const outputPath = path.join(dir, "output.zip");
  await run("zip", ["-qr", outputPath, "."], { cwd: pagesDir, timeout: 20_000 });
  const stat = await fs.stat(outputPath);
  await fs.chmod(outputPath, 0o664).catch(() => undefined);
  return { path: outputPath, size: stat.size };
}

export async function signPdf(job: PdfUtilityJob) {
  if (!job.inputPath) throw new Error("Selecione um PDF.");
  const text = (job.text || "").trim().slice(0, 120);
  if (!text) throw new Error("Digite a assinatura ou texto que deseja aplicar.");
  const pdf = await PDFDocument.load(await fs.readFile(job.inputPath));
  const pageIndex = Math.max(0, Math.min((job.page || 1) - 1, pdf.getPageCount() - 1));
  const page = pdf.getPage(pageIndex);
  const font = await pdf.embedFont(StandardFonts.HelveticaOblique);
  const fontSize = Math.max(10, Math.min(48, job.fontSize || 22));
  const { width, height } = page.getSize();
  const textWidth = font.widthOfTextAtSize(text, fontSize);
  const position = job.position || "bottom-left";
  const coordinates = {
    "top-left": { x: 42, y: height - 60 },
    "top-center": { x: Math.max(42, (width - textWidth) / 2), y: height - 60 },
    center: { x: Math.max(42, (width - textWidth) / 2), y: height / 2 },
    "bottom-left": { x: 42, y: 42 },
    "bottom-center": { x: Math.max(42, (width - textWidth) / 2), y: 42 },
  }[position];
  page.drawText(text, { ...coordinates, size: fontSize, font, color: rgb(0.02, 0.18, 0.42) });
  const outputPath = path.join(jobDir(job), "output.pdf");
  await fs.writeFile(outputPath, await pdf.save());
  return ensureOutput(outputPath);
}

export async function compressPdf(job: PdfUtilityJob) {
  if (!job.inputPath) throw new Error("Selecione um PDF.");
  const outputPath = path.join(jobDir(job), "output.pdf");
  await run("gs", ["-sDEVICE=pdfwrite", "-dCompatibilityLevel=1.4", "-dPDFSETTINGS=/ebook", "-dNOPAUSE", "-dQUIET", "-dBATCH", `-sOutputFile=${outputPath}`, job.inputPath], { timeout: config.conversionTimeoutMs });
  return ensureOutput(outputPath);
}

export async function protectPdf(job: PdfUtilityJob) {
  if (!job.inputPath) throw new Error("Selecione um PDF.");
  const password = (job.password || "").trim();
  if (password.length < 4) throw new Error("Use uma senha com pelo menos 4 caracteres.");
  const outputPath = path.join(jobDir(job), "output.pdf");
  await run("qpdf", ["--encrypt", password, password, "256", "--", job.inputPath, outputPath], { timeout: config.conversionTimeoutMs });
  return ensureOutput(outputPath);
}

export async function unlockPdf(job: PdfUtilityJob) {
  if (!job.inputPath) throw new Error("Selecione um PDF.");
  const password = (job.password || "").trim();
  if (!password) throw new Error("Informe a senha atual do PDF.");
  const outputPath = path.join(jobDir(job), "output.pdf");
  await run("qpdf", [`--password=${password}`, "--decrypt", job.inputPath, outputPath], { timeout: config.conversionTimeoutMs });
  return ensureOutput(outputPath);
}

export function outputName(job: PdfUtilityJob) {
  const base = safeBase(job.originalName, "arquivo");
  const names: Record<PdfUtilityJob["type"], string> = {
    "compress-pdf": `${base}-comprimido.pdf`,
    "merge-pdf": "pdf-juntado.pdf",
    "split-pdf": `${base}-paginas.pdf`,
    "image-pdf": "imagens-convertidas.pdf",
    "pdf-jpg": `${base}-jpg.zip`,
    "sign-pdf": `${base}-assinado.pdf`,
    "protect-pdf": `${base}-protegido.pdf`,
    "unlock-pdf": `${base}-sem-senha.pdf`,
    "organize-pdf": `${base}-organizado.pdf`,
  };
  return names[job.type];
}
