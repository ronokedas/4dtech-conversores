import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { config } from "./config.js";
import type { OfficeJob } from "./types.js";

const run = promisify(execFile);

async function convertOffice(job: OfficeJob, label: string, target: { format: string; extension: string; outputFile: string }) {
  const dir = path.join(config.jobDir, job.token);
  const profileDir = path.join(dir, "lo-profile");
  const expectedName = `${path.basename(job.inputPath, path.extname(job.inputPath))}.${target.extension}`;
  const generatedPath = path.join(dir, expectedName);
  const outputPath = path.join(dir, target.outputFile);
  await fs.mkdir(profileDir, { recursive: true, mode: 0o770 });

  try {
    await run("libreoffice", [
      "--headless",
      "--nologo",
      "--nofirststartwizard",
      "--nodefault",
      "--norestore",
      `-env:UserInstallation=file://${profileDir.replace(/\\/g, "/")}`,
      "--convert-to",
      target.format,
      "--outdir",
      dir,
      job.inputPath,
    ], {
      timeout: config.conversionTimeoutMs,
      maxBuffer: 1024 * 1024,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : `Falha ao abrir o arquivo ${label}.`;
    throw new Error(`Nao foi possivel converter este ${label}. ${message}`.slice(0, 240));
  }

  await fs.rename(generatedPath, outputPath).catch(async () => {
    const outputs = (await fs.readdir(dir)).filter((file) => file.toLowerCase().endsWith(`.${target.extension}`));
    if (!outputs.length) throw new Error("O LibreOffice nao gerou o arquivo final.");
    await fs.rename(path.join(dir, outputs[0]!), outputPath);
  });

  const stat = await fs.stat(outputPath);
  if (stat.size > config.maxPdfBytes) {
    await fs.rm(outputPath, { force: true });
    throw new Error("O arquivo gerado ficou maior que o limite permitido.");
  }
  return { outputPath, size: stat.size };
}

export const convertWordToPdf = (job: OfficeJob) => convertOffice(job, "Word", { format: "pdf", extension: "pdf", outputFile: "output.pdf" });
export const convertExcelToPdf = (job: OfficeJob) => convertOffice(job, "Excel", { format: "pdf", extension: "pdf", outputFile: "output.pdf" });

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const columnName = (index: number) => {
  let name = "";
  let current = index + 1;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    current = Math.floor((current - 1) / 26);
  }
  return name;
};

async function writeDocxFromText(outputPath: string, text: string, workDir: string) {
  const docxDir = path.join(workDir, "docx");
  await fs.mkdir(path.join(docxDir, "_rels"), { recursive: true, mode: 0o770 });
  await fs.mkdir(path.join(docxDir, "word"), { recursive: true, mode: 0o770 });
  await fs.writeFile(path.join(docxDir, "[Content_Types].xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`);
  await fs.writeFile(path.join(docxDir, "_rels", ".rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`);
  const paragraphs = text.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean).slice(0, 1200);
  const body = paragraphs.map((paragraph) => `<w:p><w:r><w:t xml:space="preserve">${escapeXml(paragraph.replace(/\s*\n\s*/g, " "))}</w:t></w:r></w:p>`).join("");
  await fs.writeFile(path.join(docxDir, "word", "document.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`);
  await fs.rm(outputPath, { force: true });
  await run("zip", ["-qr", outputPath, "."], { cwd: docxDir, timeout: config.conversionTimeoutMs, maxBuffer: 1024 * 1024 });
}

export async function convertPdfToWord(job: OfficeJob) {
  const dir = path.join(config.jobDir, job.token);
  const textPath = path.join(dir, "extracted.txt");
  const outputPath = path.join(dir, "output.docx");
  try {
    await run("pdftotext", ["-layout", "-enc", "UTF-8", job.inputPath, textPath], { timeout: config.conversionTimeoutMs, maxBuffer: 1024 * 1024 });
    const text = (await fs.readFile(textPath, "utf8")).replace(/\u0000/g, "").trim();
    if (text.length < 2) throw new Error("Nao encontramos texto editavel neste PDF.");
    await writeDocxFromText(outputPath, text, dir);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao extrair texto do PDF.";
    throw new Error(`Nao foi possivel converter este PDF para Word. ${message}`.slice(0, 240));
  }
  const stat = await fs.stat(outputPath);
  if (stat.size > config.maxPdfBytes) {
    await fs.rm(outputPath, { force: true });
    throw new Error("O arquivo Word gerado ficou maior que o limite permitido.");
  }
  return { outputPath, size: stat.size };
}

function textToRows(text: string) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).slice(0, 5000);
  return lines.map((line) => {
    const byTab = line.split(/\t+/).map((cell) => cell.trim()).filter(Boolean);
    if (byTab.length > 1) return byTab.slice(0, 40);
    const bySpaces = line.split(/\s{2,}/).map((cell) => cell.trim()).filter(Boolean);
    return (bySpaces.length > 1 ? bySpaces : [line]).slice(0, 40);
  });
}

async function writeXlsxFromRows(outputPath: string, rows: string[][], workDir: string) {
  const xlsxDir = path.join(workDir, "xlsx");
  await fs.mkdir(path.join(xlsxDir, "_rels"), { recursive: true, mode: 0o770 });
  await fs.mkdir(path.join(xlsxDir, "xl", "_rels"), { recursive: true, mode: 0o770 });
  await fs.mkdir(path.join(xlsxDir, "xl", "worksheets"), { recursive: true, mode: 0o770 });
  await fs.writeFile(path.join(xlsxDir, "[Content_Types].xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`);
  await fs.writeFile(path.join(xlsxDir, "_rels", ".rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`);
  await fs.writeFile(path.join(xlsxDir, "xl", "_rels", "workbook.xml.rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`);
  await fs.writeFile(path.join(xlsxDir, "xl", "workbook.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados do PDF" sheetId="1" r:id="rId1"/></sheets></workbook>`);
  const sheetRows = rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((cell, columnIndex) => `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t>${escapeXml(cell)}</t></is></c>`).join("")}</row>`).join("");
  await fs.writeFile(path.join(xlsxDir, "xl", "worksheets", "sheet1.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`);
  await fs.rm(outputPath, { force: true });
  await run("zip", ["-qr", outputPath, "."], { cwd: xlsxDir, timeout: config.conversionTimeoutMs, maxBuffer: 1024 * 1024 });
}

export async function convertPdfToExcel(job: OfficeJob) {
  const dir = path.join(config.jobDir, job.token);
  const textPath = path.join(dir, "extracted.txt");
  const outputPath = path.join(dir, "output.xlsx");
  try {
    await run("pdftotext", ["-layout", "-enc", "UTF-8", job.inputPath, textPath], { timeout: config.conversionTimeoutMs, maxBuffer: 1024 * 1024 });
    const text = (await fs.readFile(textPath, "utf8")).replace(/\u0000/g, "").trim();
    if (text.length < 2) throw new Error("Nao encontramos texto ou tabela editavel neste PDF.");
    const rows = textToRows(text);
    if (!rows.length) throw new Error("Nao encontramos dados para montar a planilha.");
    await writeXlsxFromRows(outputPath, rows, dir);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao extrair dados do PDF.";
    throw new Error(`Nao foi possivel converter este PDF para Excel. ${message}`.slice(0, 240));
  }
  const stat = await fs.stat(outputPath);
  if (stat.size > config.maxPdfBytes) {
    await fs.rm(outputPath, { force: true });
    throw new Error("A planilha gerada ficou maior que o limite permitido.");
  }
  return { outputPath, size: stat.size };
}
