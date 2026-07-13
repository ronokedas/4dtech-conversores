import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { config } from "./config.js";
import type { EditPdfJob } from "./types.js";

function coordinates(position: EditPdfJob["position"], width: number, height: number, textWidth: number, fontSize: number) {
  const margin = 48;
  if (position === "top-left") return { x: margin, y: height - margin - fontSize };
  if (position === "top-center") return { x: Math.max(margin, (width - textWidth) / 2), y: height - margin - fontSize };
  if (position === "center") return { x: Math.max(margin, (width - textWidth) / 2), y: Math.max(margin, (height - fontSize) / 2) };
  if (position === "bottom-left") return { x: margin, y: margin };
  return { x: Math.max(margin, (width - textWidth) / 2), y: margin };
}

export async function editPdf(job: EditPdfJob) {
  const bytes = await fs.readFile(job.inputPath);
  const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pages = pdf.getPages();
  if (!pages.length) throw new Error("Este PDF nao possui paginas editaveis.");
  const target = pages[Math.min(Math.max(job.page - 1, 0), pages.length - 1)]!;
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = target.getSize();
  const safeText = job.text.replace(/\s+/g, " ").trim().slice(0, 160);
  if (!safeText) throw new Error("Digite o texto que deseja adicionar ao PDF.");
  const textWidth = font.widthOfTextAtSize(safeText, job.fontSize);
  const { x, y } = coordinates(job.position, width, height, textWidth, job.fontSize);
  target.drawText(safeText, {
    x,
    y,
    size: job.fontSize,
    font,
    color: rgb(0.02, 0.32, 0.85),
  });
  const output = await pdf.save({ useObjectStreams: false });
  const outputPath = path.join(config.jobDir, job.token, "output.pdf");
  await fs.writeFile(outputPath, output, { mode: 0o664 });
  await fs.chmod(outputPath, 0o664);
  const stat = await fs.stat(outputPath);
  if (stat.size > config.maxPdfBytes) {
    await fs.rm(outputPath, { force: true });
    throw new Error("O PDF editado ficou maior que o limite permitido.");
  }
  return { outputPath, size: stat.size };
}
