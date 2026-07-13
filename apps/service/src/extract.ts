import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import yauzl from "yauzl";
import { config } from "./config.js";

const forbiddenExtensions = new Set([".exe", ".dll", ".bat", ".cmd", ".com", ".msi", ".ps1", ".sh"]);

export async function extractZip(zipPath: string, destination: string) {
  const zip = await new Promise<yauzl.ZipFile>((resolve, reject) => yauzl.open(zipPath, { lazyEntries: true, decodeStrings: true }, (error, file) => error || !file ? reject(error) : resolve(file)));
  let count = 0;
  let total = 0;
  const htmlFiles: string[] = [];
  return new Promise<string>((resolve, reject) => {
    const fail = (error: Error) => { zip.close(); reject(error); };
    zip.on("error", fail);
    zip.on("entry", async (entry) => {
      try {
        count += 1;
        total += entry.uncompressedSize;
        if (count > config.maxZipFiles) throw new Error("O ZIP contém arquivos demais.");
        if (total > config.maxExtractedBytes) throw new Error("O conteúdo extraído ultrapassa o limite permitido.");
        const normalized = entry.fileName.replace(/\\/g, "/");
        if (normalized.startsWith("/") || normalized.includes("../") || path.isAbsolute(normalized) || normalized.includes("\0")) throw new Error("O ZIP contém caminhos inseguros.");
        const mode = (entry.externalFileAttributes >>> 16) & 0xffff;
        if ((mode & 0o170000) === 0o120000) throw new Error("Links simbólicos não são permitidos no ZIP.");
        if (forbiddenExtensions.has(path.extname(normalized).toLowerCase())) throw new Error("O ZIP contém um tipo de arquivo não permitido.");
        const target = path.resolve(destination, normalized);
        if (!target.startsWith(path.resolve(destination) + path.sep)) throw new Error("O ZIP contém caminhos inseguros.");
        if (normalized.endsWith("/")) { await fs.mkdir(target, { recursive: true }); zip.readEntry(); return; }
        await fs.mkdir(path.dirname(target), { recursive: true });
        const stream = await new Promise<NodeJS.ReadableStream>((res, rej) => zip.openReadStream(entry, (err, value) => err || !value ? rej(err) : res(value)));
        await pipeline(stream, createWriteStream(target, { flags: "wx", mode: 0o600 }));
        if ([".html", ".htm"].includes(path.extname(target).toLowerCase())) htmlFiles.push(target);
        zip.readEntry();
      } catch (error) { fail(error as Error); }
    });
    zip.on("end", () => {
      const index = htmlFiles.find((file) => path.basename(file).toLowerCase() === "index.html");
      if (index) resolve(index);
      else if (htmlFiles.length === 1) resolve(htmlFiles[0]!);
      else reject(new Error(htmlFiles.length ? "O ZIP tem vários HTMLs e nenhum index.html." : "O ZIP não contém um arquivo HTML."));
    });
    zip.readEntry();
  });
}
