import OpenAI from "openai";
import { createStudyCorpus, selectCorpusContext } from "@/lib/corpus";
import type { NormalizedStudySource } from "@/lib/documents";

export const runtime = "nodejs";
type AskBody = { question?: string; sources?: NormalizedStudySource[]; studyTitle?: string; history?: Array<{ role: "user" | "assistant"; content: string }> };
export async function POST(request: Request) {
  try {
    const body = await request.json() as AskBody;
    if (!body.question?.trim() || !body.sources?.length) return Response.json({ success: false, error: { code: "INVALID_ASK_REQUEST", message: "Choose at least one processed source and ask a question." } }, { status: 400 });
    if (!process.env.OPENAI_API_KEY) return Response.json({ success: false, error: { code: "AI_NOT_CONFIGURED", message: "Study generation isn't configured on this server." } }, { status: 500 });
    const corpus = createStudyCorpus(body.sources);
    const context = selectCorpusContext(corpus, "ask", body.question);
    const sourceText = context.units.map((unit) => "[" + unit.sourceName + " · " + unit.reference.unitType + " " + unit.reference.unitNumber + "] " + unit.text).join("\n\n");
    const history = (body.history ?? []).filter((message) => (message.role === "user" || message.role === "assistant") && message.content.trim()).slice(-8);
    const conversation = history.length ? "\n\nCONVERSATION SO FAR:\n" + history.map((message) => (message.role === "user" ? "Student" : "StudyBud") + ": " + message.content).join("\n") : "";
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", store: false, instructions: "You are StudyBud's contextual tutor. Answer only from the supplied source units. Be concise but helpful. If the source does not support an answer, say that clearly. Use the conversation only to understand the student's follow-up; do not treat it as source material. Do not invent citations; reference source units only when supplied.", input: "Study space: " + (body.studyTitle || "Untitled") + conversation + "\n\nQuestion: " + body.question + "\n\nSOURCE UNITS:\n" + sourceText });
    return Response.json({ success: true, answer: response.output_text, references: context.units.map((unit) => ({ sourceName: unit.sourceName, reference: unit.reference })).slice(0, 6) });
  } catch (error) {
    const detail = process.env.NODE_ENV !== "production" && error instanceof Error ? error.message : undefined;
    return Response.json({ success: false, error: { code: "ASK_FAILED", message: "StudyBud couldn't answer that question right now.", ...(detail ? { detail } : {}) } }, { status: 500 });
  }
}
