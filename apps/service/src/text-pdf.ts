import fs from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { config } from "./config.js";
import type { TextPdfJob } from "./types.js";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 56;

function cleanText(value: string) {
  return value.replace(/\u0000/g, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
}

function stripMarkdown(line: string) {
  return line
    .replace(/^#{1,6}\s+/, "")
    .replace(/^[-*+]\s+/, "• ")
    .replace(/^\d+\.\s+/, "• ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}

function wrapLine(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(next, fontSize) <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
        let chunk = "";
        for (const char of word) {
          const candidate = `${chunk}${char}`;
          if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) chunk = candidate;
          else {
            if (chunk) lines.push(chunk);
            chunk = char;
          }
        }
        current = chunk;
      } else {
        current = word;
      }
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function addPage(pdf: PDFDocument) {
  return pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
}

function drawWrapped(pdf: PDFDocument, page: PDFPage, lines: string[], state: { y: number }, font: PDFFont, fontSize: number, lineHeight: number, color = rgb(0.12, 0.16, 0.24)) {
  for (const line of lines) {
    if (state.y < MARGIN) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      state.y = PAGE_HEIGHT - MARGIN;
    }
    page.drawText(line, { x: MARGIN, y: state.y, size: fontSize, font, color });
    state.y -= lineHeight;
  }
  return page;
}

export async function createTextPdf(job: TextPdfJob) {
  const raw = cleanText(await fs.readFile(job.inputPath, "utf8"));
  if (!raw) throw new Error("O arquivo nao possui texto para converter.");
  const text = raw.slice(0, 400_000);
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const mono = await pdf.embedFont(StandardFonts.Courier);
  let page = addPage(pdf);
  const state = { y: PAGE_HEIGHT - MARGIN };
  const title = (job.title || path.basename(job.originalName, path.extname(job.originalName))).trim().slice(0, 120);
  if (title) {
    page = drawWrapped(pdf, page, wrapLine(title, bold, 20, PAGE_WIDTH - MARGIN * 2), state, bold, 20, 26, rgb(0.03, 0.20, 0.48));
    state.y -= 12;
  }
  const baseFontSize = Math.max(10, Math.min(16, job.fontSize || 12));
  for (const rawLine of text.split("\n")) {
    const isMarkdown = job.type === "markdown-pdf";
    const line = isMarkdown ? stripMarkdown(rawLine) : rawLine;
    if (!line.trim()) {
      state.y -= baseFontSize * 0.85;
      continue;
    }
    const heading = isMarkdown ? rawLine.match(/^(#{1,3})\s+(.+)/) : null;
    const code = isMarkdown && rawLine.trim().startsWith("```");
    const font = code ? mono : (heading ? bold : regular);
    const size = heading ? Math.max(baseFontSize + 4, 16) : baseFontSize;
    page = drawWrapped(pdf, page, wrapLine(line, font, size, PAGE_WIDTH - MARGIN * 2), state, font, size, size * 1.45);
    if (heading) state.y -= 5;
  }
  const outputPath = path.join(config.jobDir, job.token, "output.pdf");
  await fs.writeFile(outputPath, await pdf.save());
  const stat = await fs.stat(outputPath);
  if (stat.size > config.maxPdfBytes) throw new Error("O PDF final ultrapassou o limite permitido.");
  await fs.chmod(outputPath, 0o664).catch(() => undefined);
  return { path: outputPath, size: stat.size };
}
