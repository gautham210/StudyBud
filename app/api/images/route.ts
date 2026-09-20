import { normalizeImageSource, toImageUpload } from "@/lib/images";
import { OpenAIProvider } from "@/lib/openaiProvider";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    if (!request.headers.get("content-type")?.includes("multipart/form-data")) return Response.json({ success: false, error: { code: "INVALID_IMAGE", message: "Choose an image to process." } }, { status: 400 });
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ success: false, error: { code: "INVALID_IMAGE", message: "Choose an image to process." } }, { status: 400 });
    const upload = await toImageUpload(file);
    const analysis = await new OpenAIProvider().analyzeImage(upload);
    return Response.json({ success: true, source: normalizeImageSource(upload, analysis) });
  } catch (error) {
    const known = error as { code?: string; message?: string; name?: unknown; status?: unknown };
    if (known.code === "UNSUPPORTED_IMAGE_TYPE" || known.code === "IMAGE_TOO_LARGE") return Response.json({ success: false, error: { code: known.code, message: known.message } }, { status: known.code === "IMAGE_TOO_LARGE" ? 413 : 422 });
    console.error("Image analysis failed", { name: known.name, message: known.message, status: known.status });
    const detail = process.env.NODE_ENV !== "production" ? known.message : undefined;
    return Response.json({ success: false, error: { code: "IMAGE_ANALYSIS_FAILED", message: "We couldn't analyze that image right now.", ...(detail ? { detail } : {}) } }, { status: 500 });
  }
}
