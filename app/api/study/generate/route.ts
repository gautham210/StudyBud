import type { StudyRequest } from "@/lib/ai";
import { MockAIProvider } from "@/lib/mockAIProvider";
import { OpenAIProvider } from "@/lib/openaiProvider";

export const runtime = "nodejs";

function validRequest(value: unknown): value is StudyRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<StudyRequest>;
  return Boolean(request.source?.type === "document" && request.source.content?.text?.trim() && request.mode && request.strategy && request.learnerContext);
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!validRequest(body)) return Response.json({ success: false, error: { code: "INVALID_STUDY_REQUEST", message: "Choose a processed document before generating a study space." } }, { status: 400 });
    const providerName = process.env.AI_PROVIDER === "mock" ? "mock" : "openai";
    if (process.env.NODE_ENV !== "production") console.info("[StudyBud generation]", { provider: providerName, model: process.env.OPENAI_MODEL || "gpt-4o-mini", keyConfigured: Boolean(process.env.OPENAI_API_KEY), sourceCharacters: body.source.content.text.length });
    const provider = providerName === "mock" ? new MockAIProvider() : new OpenAIProvider();
    const studySpace = await provider.generateStudySpace(body);
    return Response.json({ success: true, studySpace });
  } catch (error) {
    const apiError = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
    console.error("Study-space generation failed", { name: apiError?.name ?? "unknown", message: apiError?.message, status: apiError?.status, code: apiError?.code });
    const missingKey = error instanceof Error && error.message === "OPENAI_API_KEY is not configured.";
    const developmentDetail = process.env.NODE_ENV !== "production" && error instanceof Error ? error.message : undefined;
    return Response.json({ success: false, error: { code: missingKey ? "AI_NOT_CONFIGURED" : "GENERATION_FAILED", message: missingKey ? "Study generation is not configured on this server." : "We couldn't generate a study space from that document.", ...(developmentDetail ? { detail: developmentDetail } : {}) } }, { status: 500 });
  }
}
