import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { config } from "./config.js";
import type { YoutubeMp4Job } from "./types.js";

const run = promisify(execFile);
const maxBytes = 500 * 1024 * 1024;

export async function downloadYoutubeVideo(job: YoutubeMp4Job) {
  const dir = path.join(config.jobDir, job.token);
  const outputPath = path.join(dir, "output.mp4");
  const format = `bestvideo[height<=${job.quality}][ext=mp4]+bestaudio[ext=m4a]/best[height<=${job.quality}][ext=mp4]/best[height<=${job.quality}]`;
  try {
    await run("yt-dlp", [
      "--no-playlist", "--no-warnings", "--restrict-filenames", "--no-progress", "--js-runtimes", "node",
      "--match-filter", "duration <= 1800", "--max-filesize", "500M",
      "--format", format, "--merge-output-format", "mp4", "--remux-video", "mp4",
      "--output", path.join(dir, "output.%(ext)s"), job.sourceUrl,
    ], { timeout: config.youtubeTimeoutMs, maxBuffer: 1024 * 1024 });
  } catch (error) {
    const stderr = error && typeof error === "object" && "stderr" in error ? String(error.stderr) : "";
    if (/duration/i.test(stderr)) throw new Error("O vídeo excede o limite de 30 minutos.");
    if (/file size|max-filesize/i.test(stderr)) throw new Error("O vídeo excede o limite de 500 MB.");
    if (/private|members-only/i.test(stderr)) throw new Error("Este vídeo é privado ou restrito a membros.");
    if (/sign in|confirm you.?re not a bot|login required/i.test(stderr)) throw new Error("O YouTube solicitou uma verificação de acesso para este vídeo. Tente novamente mais tarde.");
    if (/unavailable|not available/i.test(stderr)) throw new Error("O YouTube informou que este vídeo está indisponível para download.");
    throw new Error("Não foi possível baixar este vídeo do YouTube. Tente outro link público.");
  }
  const stat = await fs.stat(outputPath).catch(() => null);
  if (!stat) throw new Error("O YouTube não forneceu um arquivo MP4 compatível.");
  if (stat.size > maxBytes) {
    await fs.rm(outputPath, { force: true });
    throw new Error("O vídeo excede o limite de 500 MB.");
  }
  await fs.chmod(outputPath, 0o664).catch(() => undefined);
  return { size: stat.size, filename: `video-youtube-${job.quality}p.mp4` };
}
