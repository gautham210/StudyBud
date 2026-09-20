import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import * as XLSX from "xlsx";
import { randomUUID } from "crypto";

export const DOCUMENT_MAX_BYTES = 4 * 1024 * 1024;
export type DocumentErrorCode = "INVALID_FILE" | "FILE_TOO_LARGE" | "UNSUPPORTED_FILE_TYPE" | "EXTRACTION_FAILED" | "EMPTY_DOCUMENT" | "SERVER_ERROR";
export type DocumentError = { code: DocumentErrorCode; message: string };
export type ContentUnit = { number: number; text: string; title?: string };
export type NormalizedStudySource = { id: string; type: "document" | "image"; fileName: string; mimeType: string; extension: string; sizeBytes: number; title?: string; content: { text: string; pages?: ContentUnit[]; sections?: ContentUnit[]; slides?: ContentUnit[]; sheets?: ContentUnit[] }; metadata: { pageCount?: number; slideCount?: number; sheetCount?: number; wordCount: number; characterCount: number; imageAnalysis?: { summary: string; visibleText: string; visualElements: string[]; educationalInsights: string[] } }; createdAt: string };

const kinds: Record<string, string> = { pdf: "PDF", docx: "Word", pptx: "PowerPoint", xlsx: "Excel", txt: "Text", md: "Markdown" };
export function extensionOf(name: string) { return name.split(".").pop()?.toLowerCase() ?? ""; }
export function documentKind(name: string) { return kinds[extensionOf(name)]; }
function clean(text: string) { return text.replace(/\u0000/g, "").replace(/\r\n/g, "\n").trim(); }
function complete(file: File, text: string, units: Partial<NormalizedStudySource["content"]> = {}): NormalizedStudySource {
  const normalized = clean(text); if (!normalized) throw { code: "EMPTY_DOCUMENT", message: "We couldn't find readable text in this document." } satisfies DocumentError;
  const extension = extensionOf(file.name); const words = normalized.match(/\S+/g)?.length ?? 0;
  return { id: randomUUID(), type: "document", fileName: file.name, mimeType: file.type || "application/octet-stream", extension, sizeBytes: file.size, title: file.name.replace(/\.[^.]+$/, ""), content: { text: normalized, ...units }, metadata: { pageCount: units.pages?.length, slideCount: units.slides?.length, sheetCount: units.sheets?.length, wordCount: words, characterCount: normalized.length }, createdAt: new Date().toISOString() };
}
export async function ingestDocument(file: File): Promise<NormalizedStudySource> {
  if (!file || !file.name) throw { code: "INVALID_FILE", message: "Choose a document to process." } satisfies DocumentError;
  if (file.size > DOCUMENT_MAX_BYTES) throw { code: "FILE_TOO_LARGE", message: "File is too large. Please upload a file under 4 MB." } satisfies DocumentError;
  const extension = extensionOf(file.name); if (["doc", "ppt", "xls"].includes(extension)) throw { code: "UNSUPPORTED_FILE_TYPE", message: "Legacy Office formats are not supported yet. Please use DOCX, PPTX, or XLSX." } satisfies DocumentError;
  if (!documentKind(file.name)) throw { code: "UNSUPPORTED_FILE_TYPE", message: "This document type is not supported yet." } satisfies DocumentError;
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    if (extension === "txt" || extension === "md") return complete(file, buffer.toString("utf8"));
    if (extension === "docx") { const result = await mammoth.extractRawText({ buffer }); return complete(file, result.value, { sections: result.value.split(/\n{2,}/).filter(Boolean).map((text, index) => ({ number: index + 1, text })) }); }
    if (extension === "pdf") { const parser = new PDFParse({ data: buffer }); const result = await parser.getText(); await parser.destroy(); const pages = result.pages.map((page, index) => ({ number: index + 1, text: page.text })); return complete(file, result.text, { pages }); }
    if (extension === "xlsx") { const workbook = XLSX.read(buffer, { type: "buffer" }); const sheets = workbook.SheetNames.map((name, index) => ({ number: index + 1, title: name, text: XLSX.utils.sheet_to_csv(workbook.Sheets[name]).trim() })); return complete(file, sheets.map((sheet) => `Sheet: ${sheet.title}\n${sheet.text}`).join("\n\n"), { sheets }); }
    const zip = await JSZip.loadAsync(buffer); const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true }); const slideNames = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort((a, b) => Number(a.match(/\d+/)?.[0]) - Number(b.match(/\d+/)?.[0])); const slides = await Promise.all(slideNames.map(async (name, index) => { const xml = await zip.file(name)?.async("string"); const parsed = parser.parse(xml ?? ""); const text = JSON.stringify(parsed).match(/"t":"(.*?)"/g)?.map((value) => value.slice(5, -1)).join(" ") ?? ""; return { number: index + 1, text }; })); return complete(file, slides.map((slide) => `Slide ${slide.number}\n${slide.text}`).join("\n\n"), { slides });
  } catch (error) { if (typeof error === "object" && error && "code" in error) throw error; console.error("Document extraction failed", { fileName: file.name, extension, error }); throw { code: "EXTRACTION_FAILED", message: "We couldn't extract readable content from this document." } satisfies DocumentError; }
}
