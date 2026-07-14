import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { config } from "./config.js";
import type { VideoMp3Job } from "./types.js";

const run = promisify(execFile);

export async function convertVideoToMp3(job: VideoMp3Job) {
  const outputPath = path.join(config.jobDir, job.token, "output.mp3");
  await run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    job.inputPath,
    "-vn",
    "-acodec",
    "libmp3lame",
    "-b:a",
    job.bitrate,
    outputPath,
  ], { timeout: config.mediaTimeoutMs, maxBuffer: 1024 * 1024 });
  const stat = await fs.stat(outputPath);
  await fs.chmod(outputPath, 0o664).catch(() => undefined);
  return { path: outputPath, size: stat.size };
}
