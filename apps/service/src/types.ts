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
export type ConversionJob = PdfConversionJob | BackgroundJob | AudioTextJob | OfficeJob | EditPdfJob | PdfUtilityJob;

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
