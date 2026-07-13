import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium, type Browser } from "playwright";
import { config } from "./config.js";
import { extractZip } from "./extract.js";
import { assertPublicUrl } from "./security.js";
import type { PdfConversionJob } from "./types.js";

const margins = {
  none: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
  small: { top: "6mm", right: "6mm", bottom: "6mm", left: "6mm" },
  normal: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
};

export async function convert(browser: Browser, job: PdfConversionJob) {
  const dir = path.join(config.jobDir, job.token);
  let target: string;
  if (job.type === "url") target = await assertPublicUrl(job.sourceUrl!);
  else if (path.extname(job.inputPath!).toLowerCase() === ".zip") {
    const extracted = path.join(dir, "extracted");
    await fs.mkdir(extracted, { recursive: true, mode: 0o700 });
    target = pathToFileURL(await extractZip(job.inputPath!, extracted)).toString();
  } else target = pathToFileURL(job.inputPath!).toString();

  const context = await browser.newContext({ javaScriptEnabled: true, acceptDownloads: false, serviceWorkers: "block" });
  const page = await context.newPage();
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (url.startsWith("file://") && job.type === "file") return route.continue();
    try { await assertPublicUrl(url); await route.continue(); } catch { await route.abort("blockedbyclient"); }
  });
  const timeout = config.conversionTimeoutMs;
  page.setDefaultTimeout(timeout);
  page.setDefaultNavigationTimeout(timeout);
  try {
    await page.goto(target, { waitUntil: "domcontentloaded", timeout });
    await page.waitForLoadState("networkidle", { timeout: Math.min(12_000, timeout) }).catch(() => undefined);
    await page.emulateMedia({ media: "print" });
    const output = path.join(dir, "output.pdf");
    await page.pdf({ path: output, format: job.options.format, landscape: job.options.landscape, margin: margins[job.options.margin], printBackground: true, preferCSSPageSize: false, tagged: true });
    const stat = await fs.stat(output);
    if (stat.size === 0 || stat.size > config.maxPdfBytes) throw new Error("O PDF gerado ultrapassa o limite permitido.");
    return { output, size: stat.size };
  } finally { await context.close(); }
}

export async function launchBrowser() {
  return chromium.launch({ headless: true, args: ["--disable-dev-shm-usage", "--disable-background-networking", "--disable-component-update", "--no-first-run"] });
}
