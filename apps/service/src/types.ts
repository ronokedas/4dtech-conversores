import { z } from "zod";

export const pdfOptionsSchema = z.object({
  format: z.enum(["A4", "Letter", "Legal"]).default("A4"),
  landscape: z.coerce.boolean().default(false),
  margin: z.enum(["none", "small", "normal"]).default("normal"),
});

export type PdfOptions = z.infer<typeof pdfOptionsSchema>;
export type JobStatus = "queued" | "processing" | "ready" | "failed" | "expired";
export type PdfConversionJob = {
  token: string;
  type: "file" | "url";
  inputPath?: string;
  sourceUrl?: string;
  originalName: string;
  options: PdfOptions;
  createdAt: number;
};
export type BackgroundJob = {
  token: string;
  type: "background";
  inputPath: string;
  originalName: string;
  createdAt: number;
};
export type AudioTextJob = {
  token: string;
  type: "audio-text";
  inputPath: string;
  originalName: string;
  language: "pt" | "en" | "es" | "auto";
  createdAt: number;
};
export type QrCodeJob = {
  token: string;
  type: "qr-code";
  content: string;
  size: number;
  margin: number;
  darkColor: string;
  originalName: string;
  createdAt: number;
};
export type TextPdfJob = {
  token: string;
  type: "txt-pdf" | "markdown-pdf";
  inputPath: string;
  originalName: string;
  title?: string;
  fontSize: number;
  createdAt: number;
};
export type ImageUtilityJob = {
  token: string;
  type: "compress-image" | "resize-image" | "convert-image";
  inputPath: string;
  originalName: string;
  quality: number;
  width?: number;
  height?: number;
  format?: "jpeg" | "png" | "webp";
  createdAt: number;
};
export type VideoMp3Job = {
  token: string;
  type: "video-mp3";
  inputPath: string;
  originalName: string;
  bitrate: "96k" | "128k" | "192k" | "256k";
  createdAt: number;
};
export type OfficeJob = {
  token: string;
  type: "word" | "excel" | "pdf-word" | "pdf-excel";
  inputPath: string;
  originalName: string;
  landscape?: boolean;
  createdAt: number;
};
export type EditPdfJob = {
  token: string;
  type: "edit-pdf";
  inputPath: string;
  originalName: string;
  text: string;
  page: number;
  position: "top-left" | "top-center" | "center" | "bottom-left" | "bottom-center";
  fontSize: number;
  createdAt: number;
};
export type PdfUtilityJob = {
  token: string;
  type: "compress-pdf" | "merge-pdf" | "split-pdf" | "image-pdf" | "pdf-jpg" | "sign-pdf" | "protect-pdf" | "unlock-pdf" | "organize-pdf";
  inputPath?: string;
  inputPaths?: string[];
  originalName: string;
  ranges?: string;
  order?: string;
  text?: string;
  password?: string;
  page?: number;
  position?: EditPdfJob["position"];
  fontSize?: number;
  createdAt: number;
};
export type ConversionJob = PdfConversionJob | BackgroundJob | AudioTextJob | QrCodeJob | TextPdfJob | ImageUtilityJob | VideoMp3Job | OfficeJob | EditPdfJob | PdfUtilityJob;

export type JobRecord = {
  status: JobStatus;
  filename?: string;
  size?: number;
  mimeType?: string;
  outputFile?: string;
  tool?: string;
  error?: string;
  updatedAt: number;
};
