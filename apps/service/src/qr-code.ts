import fs from "node:fs/promises";
import path from "node:path";
import QRCode from "qrcode";
import { config } from "./config.js";
import type { QrCodeJob } from "./types.js";

export async function generateQrCode(job: QrCodeJob) {
  const outputPath = path.join(config.jobDir, job.token, "output.png");
  await QRCode.toFile(outputPath, job.content, {
    type: "png",
    width: job.size,
    margin: job.margin,
    color: {
      dark: job.darkColor,
      light: "#ffffffff",
    },
    errorCorrectionLevel: "M",
  });
  await fs.chmod(outputPath, 0o664).catch(() => undefined);
  const stat = await fs.stat(outputPath);
  return { path: outputPath, size: stat.size };
}
