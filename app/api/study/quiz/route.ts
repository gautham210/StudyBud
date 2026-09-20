import type { QuizConfig, QuizQuestionType, QuizRequest, StudySpace } from "@/lib/ai";
import { OpenAIProvider } from "@/lib/openaiProvider";

export const runtime = "nodejs";
export const maxDuration = 300;

const questionTypes: QuizQuestionType[] = ["multiple_choice", "true_false", "short_answer", "scenario"];

function validConfig(value: unknown): value is QuizConfig {
  if (!value || typeof value !== "object") return false;
  const config = value as Partial<QuizConfig>;
  return Number.isInteger(config.questionCount)
    && (config.questionCount ?? 0) >= 1
    && (config.questionCount ?? 0) <= 25
    && (config.difficulty === "easy" || config.difficulty === "medium" || config.difficulty === "hard" || config.difficulty === "mixed")
    && Array.isArray(config.questionTypes)
    && config.questionTypes.length > 0
    && config.questionTypes.every((type) => questionTypes.includes(type));
}

function validRequest(value: unknown): value is QuizRequest {
  if (!value || typeof value !== "object") return false;
  const request = value as Partial<QuizRequest>;
  const studySpace = request.studySpace as StudySpace | undefined;
  return Boolean(studySpace?.source?.normalizedSource || studySpace?.source?.normalizedSources?.length)
    && Boolean(request.learnerContext?.level && request.learnerContext.field && request.learnerContext.goal && request.learnerContext.language)
    && validConfig(request.config);
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    if (!validRequest(body)) {
      return Response.json({ success: false, error: { code: "INVALID_QUIZ_REQUEST", message: "Choose at least one question type and a valid question count." } }, { status: 400 });
    }
    if (process.env.AI_PROVIDER === "mock") {
      return Response.json({ success: false, error: { code: "QUIZ_PROVIDER_UNAVAILABLE", message: "Real quiz generation requires the OpenAI provider." } }, { status: 503 });
    }
    const quiz = await new OpenAIProvider().generateQuiz(body);
    return Response.json({ success: true, quiz });
  } catch (error) {
    const apiError = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
    console.error("Quiz generation failed", { name: apiError.name, message: apiError.message, status: apiError.status, code: apiError.code });
    const detail = process.env.NODE_ENV !== "production" && error instanceof Error ? error.message : undefined;
    return Response.json({ success: false, error: { code: "QUIZ_GENERATION_FAILED", message: "We couldn't generate a quiz from this study space.", ...(detail ? { detail } : {}) } }, { status: 500 });
  }
}
