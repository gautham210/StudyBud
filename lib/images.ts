import { randomUUID } from "crypto";
import type { NormalizedStudySource } from "@/lib/documents";

export const IMAGE_MAX_BYTES = 4 * 1024 * 1024;
export const imageMimeTypes = ["image/png", "image/jpeg", "image/webp"] as const;
export type ImageMimeType = (typeof imageMimeTypes)[number];
export type ImageAnalysis = { summary: string; visibleText: string; visualElements: string[]; educationalInsights: string[] };
export type ImageUpload = { fileName: string; mimeType: ImageMimeType; sizeBytes: number; dataUrl: string };

export function imageExtension(fileName: string) { return fileName.split(".").pop()?.toLowerCase() ?? ""; }

export function imageMimeType(file: File): ImageMimeType | null {
  const extension = imageExtension(file.name);
  const fromExtension: Record<string, ImageMimeType> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
  const mimeType = fromExtension[extension];
  return mimeType && (file.type === "" || file.type === mimeType) ? mimeType : null;
}

export async function toImageUpload(file: File): Promise<ImageUpload> {
  const mimeType = imageMimeType(file);
  if (!mimeType) throw { code: "UNSUPPORTED_IMAGE_TYPE", message: "Use a PNG, JPG, JPEG, or WEBP image." };
  if (file.size > IMAGE_MAX_BYTES) throw { code: "IMAGE_TOO_LARGE", message: "File is too large. Please upload a file under 4 MB." };
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  return { fileName: file.name, mimeType, sizeBytes: file.size, dataUrl: "data:" + mimeType + ";base64," + base64 };
}

export function normalizeImageSource(upload: ImageUpload, analysis: ImageAnalysis): NormalizedStudySource {
  const text = ["Image source: " + upload.fileName, "Summary: " + analysis.summary, analysis.visibleText ? "Visible text: " + analysis.visibleText : "", analysis.visualElements.length ? "Visual elements: " + analysis.visualElements.join("; ") : "", analysis.educationalInsights.length ? "Educational insights: " + analysis.educationalInsights.join("; ") : ""].filter(Boolean).join("\n\n");
  const wordCount = text.match(/\S+/g)?.length ?? 0;
  return { id: randomUUID(), type: "image", fileName: upload.fileName, mimeType: upload.mimeType, extension: imageExtension(upload.fileName), sizeBytes: upload.sizeBytes, title: upload.fileName.replace(/\.[^.]+$/, ""), content: { text, sections: [{ number: 1, title: "Image analysis", text }] }, metadata: { wordCount, characterCount: text.length, imageAnalysis: analysis }, createdAt: new Date().toISOString() };
}
