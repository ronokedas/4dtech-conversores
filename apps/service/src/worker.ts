import fs from "node:fs/promises";
import path from "node:path";
import { Worker } from "bullmq";
import { config } from "./config.js";
import { removeBackground } from "./background.js";
import { convert, launchBrowser } from "./convert.js";
import { editPdf } from "./edit-pdf.js";
import { convertExcelToPdf, convertPdfToExcel, convertPdfToWord, convertWordToPdf } from "./office.js";
import { compressPdf, imageToPdf, mergePdfs, organizePdf, outputName, pdfToJpg, protectPdf, signPdf, splitPdf, unlockPdf } from "./pdf-tools.js";
import { bullConnection, connection, setRecord } from "./redis.js";
import type { ConversionJob } from "./types.js";

const browser = await launchBrowser();
const worker = new Worker<ConversionJob>("conversions", async (queued) => {
  const job = queued.data;
  await setRecord(job.token, { status: "processing", updatedAt: Date.now() });
  try {
    if (job.type === "background") {
      const result = await removeBackground(job);
      const base = path.basename(job.originalName, path.extname(job.originalName)).replace(/[^\p{L}\p{N}._-]+/gu, "-") || "imagem";
      await setRecord(job.token, { status: "ready", filename: `${base}-sem-fundo.png`, size: result.size, mimeType: "image/png", outputFile: "output.png", tool: "background", updatedAt: Date.now() });
      return { size: result.size };
    }

    if (job.type === "edit-pdf") {
      const result = await editPdf(job);
      const base = path.basename(job.originalName, path.extname(job.originalName)).replace(/[^\p{L}\p{N}._-]+/gu, "-") || "pdf-editado";
      await setRecord(job.token, { status: "ready", filename: `${base}-editado.pdf`, size: result.size, mimeType: "application/pdf", outputFile: "output.pdf", tool: "edit-pdf", updatedAt: Date.now() });
      return { size: result.size };
    }

    if (job.type === "word") {
      const result = await convertWordToPdf(job);
      const base = path.basename(job.originalName, path.extname(job.originalName)).replace(/[^\p{L}\p{N}._-]+/gu, "-") || "documento-word";
      await setRecord(job.token, { status: "ready", filename: `${base}.pdf`, size: result.size, mimeType: "application/pdf", outputFile: "output.pdf", tool: "word", updatedAt: Date.now() });
      return { size: result.size };
    }

    if (job.type === "excel") {
      const result = await convertExcelToPdf(job);
      const base = path.basename(job.originalName, path.extname(job.originalName)).replace(/[^\p{L}\p{N}._-]+/gu, "-") || "planilha-excel";
      await setRecord(job.token, { status: "ready", filename: `${base}.pdf`, size: result.size, mimeType: "application/pdf", outputFile: "output.pdf", tool: "excel", updatedAt: Date.now() });
      return { size: result.size };
    }

    if (job.type === "pdf-word") {
      const result = await convertPdfToWord(job);
      const base = path.basename(job.originalName, path.extname(job.originalName)).replace(/[^\p{L}\p{N}._-]+/gu, "-") || "pdf-convertido";
      await setRecord(job.token, { status: "ready", filename: `${base}.docx`, size: result.size, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", outputFile: "output.docx", tool: "pdf-word", updatedAt: Date.now() });
      return { size: result.size };
    }

    if (job.type === "pdf-excel") {
      const result = await convertPdfToExcel(job);
      const base = path.basename(job.originalName, path.extname(job.originalName)).replace(/[^\p{L}\p{N}._-]+/gu, "-") || "dados-pdf";
      await setRecord(job.token, { status: "ready", filename: `${base}.xlsx`, size: result.size, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", outputFile: "output.xlsx", tool: "pdf-excel", updatedAt: Date.now() });
      return { size: result.size };
    }

    if (job.type === "compress-pdf" || job.type === "merge-pdf" || job.type === "split-pdf" || job.type === "image-pdf" || job.type === "pdf-jpg" || job.type === "sign-pdf" || job.type === "protect-pdf" || job.type === "unlock-pdf" || job.type === "organize-pdf") {
      const handlers = {
        "compress-pdf": compressPdf,
        "merge-pdf": mergePdfs,
        "split-pdf": splitPdf,
        "image-pdf": imageToPdf,
        "pdf-jpg": pdfToJpg,
        "sign-pdf": signPdf,
        "protect-pdf": protectPdf,
        "unlock-pdf": unlockPdf,
        "organize-pdf": organizePdf,
      };
      const result = await handlers[job.type](job);
      const isZip = job.type === "pdf-jpg";
      await setRecord(job.token, { status: "ready", filename: outputName(job), size: result.size, mimeType: isZip ? "application/zip" : "application/pdf", outputFile: isZip ? "output.zip" : "output.pdf", tool: job.type, updatedAt: Date.now() });
      return { size: result.size };
    }

    if (job.type === "file" || job.type === "url") {
      const result = await convert(browser, job);
      const base = path.basename(job.originalName, path.extname(job.originalName)).replace(/[^\p{L}\p{N}._-]+/gu, "-") || "pagina-convertida";
      await setRecord(job.token, { status: "ready", filename: `${base}.pdf`, size: result.size, mimeType: "application/pdf", outputFile: "output.pdf", tool: "pdf", updatedAt: Date.now() });
      return { size: result.size };
    }

    throw new Error("Tipo de conversao desconhecido.");
  } catch (error) {
    await Promise.allSettled([
      fs.rm(path.join(config.jobDir, job.token, "output.pdf"), { force: true }),
      fs.rm(path.join(config.jobDir, job.token, "output.png"), { force: true }),
      fs.rm(path.join(config.jobDir, job.token, "output.docx"), { force: true }),
      fs.rm(path.join(config.jobDir, job.token, "output.xlsx"), { force: true }),
      fs.rm(path.join(config.jobDir, job.token, "output.zip"), { force: true }),
    ]);
    const message = error instanceof Error ? error.message : "Nao foi possivel processar este arquivo.";
    await setRecord(job.token, { status: "failed", error: message.slice(0, 240), updatedAt: Date.now() });
    throw error;
  }
}, { connection: bullConnection, concurrency: config.workerConcurrency, lockDuration: Math.max(config.conversionTimeoutMs, config.imageTimeoutMs) + 15_000 });

worker.on("error", (error) => console.error("worker error", error.message));
const shutdown = async () => { await worker.close(); await browser.close(); await connection.quit(); process.exit(0); };
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
console.log(`worker ready, concurrency=${config.workerConcurrency}`);
