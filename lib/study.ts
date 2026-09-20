import type { NormalizedStudySource } from "@/lib/documents";

export const sourceTypes = ["document", "image", "youtube", "text"] as const;
export type SourceType = (typeof sourceTypes)[number];
export type StudySource = {
  type: SourceType;
  file?: File;
  documentKind?: string;
  youtubeUrl?: string;
  text?: string;
  processingStatus?: "idle" | "uploading" | "extracting" | "ready" | "error";
  processingMessage?: string;
  processedDocument?: NormalizedStudySource;
};

export const MAX_SOURCE_FILE_SIZE = 4 * 1024 * 1024;
export const MAX_IMAGE_SOURCE_FILE_SIZE = 4 * 1024 * 1024;
const documentExtensions: Record<string, string> = { pdf: "PDF", doc: "Word", docx: "Word", ppt: "PowerPoint", pptx: "PowerPoint", xls: "Excel", xlsx: "Excel", csv: "CSV", txt: "Text", md: "Markdown" };
const imageExtensions = ["jpg", "jpeg", "png", "webp"];

function extensionFor(file: File) { return file.name.split(".").pop()?.toLowerCase() ?? ""; }

export function getSourceFileKind(file: File) {
  const extension = extensionFor(file);
  if (documentExtensions[extension]) return { sourceType: "document" as const, label: documentExtensions[extension] };
  if (imageExtensions.includes(extension) && (file.type === "" || file.type === "image/png" || file.type === "image/jpeg" || file.type === "image/webp")) return { sourceType: "image" as const, label: "Image" };
  return null;
}

export function isSupportedSourceFile(file: File) {
  return Boolean(getSourceFileKind(file));
}

export function isYouTubeUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    return (host === "youtu.be" && url.pathname.length > 1) || (host === "youtube.com" && ((url.pathname === "/watch" && Boolean(url.searchParams.get("v"))) || url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")));
  } catch {
    return false;
  }
}

export function isStudySourceReady(source: StudySource) {
  if (source.type === "document") return source.processingStatus === "ready" && Boolean(source.processedDocument);
  if (source.type === "image") return source.processingStatus === "ready" && Boolean(source.processedDocument);
  if (source.type === "youtube") return Boolean(source.youtubeUrl && isYouTubeUrl(source.youtubeUrl));
  return Boolean(source.text?.trim());
}
export const modes = ["explain", "quiz", "summarize", "research", "ask"] as const;
export type StudyMode = (typeof modes)[number];
export const strategies = ["Explain simply", "Exam-ready", "Key concepts", "Step-by-step"];
export const sourceLabels: Record<SourceType, string> = { document: "Documents", image: "Image", youtube: "YouTube", text: "Text" };
export const modeLabels: Record<StudyMode, string> = { explain: "Explain", quiz: "Quiz", summarize: "Summarize", research: "Research", ask: "Ask" };

export type LearnerProfile = { level: string; board: string; field: string; goal: string; language: string; };
export const defaultLearnerProfile: LearnerProfile = { level: "College", board: "Computer Science", field: "Computer Science", goal: "Understand deeply", language: "English" };
export const profileOptions = {
  level: ["School — Grade 6", "School — Grade 7", "School — Grade 8", "School — Grade 9", "School — Grade 10", "School — Grade 11", "School — Grade 12", "College", "University / Professional"],
  board: ["CBSE", "ICSE", "Kerala State", "Other State Board", "ISC", "Engineering / University", "Computer Science", "Other"],
  field: ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Commerce", "Economics", "Humanities", "Engineering", "Other"],
  goal: ["Understand deeply", "Exam preparation", "Quick revision", "Learn from scratch", "Practice questions", "Interview preparation", "Assignment / project help"],
  language: ["English", "Malayalam", "Hindi", "Tamil"],
};
