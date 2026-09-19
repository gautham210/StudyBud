import type { AIProvider, QuizQuestion, StudyRequest, StudySection, StudySpace } from "@/lib/ai";
import type { ContentUnit } from "@/lib/documents";

const stopWords = new Set("the a an and or but for with from into that this these those are is was were be been being to of in on at by as it its their they we you your can may will would should not no".split(" "));
const firstSentence = (value: string) => value.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/)[0]?.trim() || value.trim();
const titleCase = (value: string) => value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

function topicTerms(text: string) {
  const counts = new Map<string, number>();
  for (const word of text.toLowerCase().match(/[a-z][a-z0-9-]{3,}/g) ?? []) {
    if (!stopWords.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1);
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 6).map(([term]) => titleCase(term));
}

function sourceSections(request: StudyRequest): StudySection[] {
  const units = request.source.content.sections ?? request.source.content.pages ?? request.source.content.slides ?? request.source.content.sheets;
  const chunks: ContentUnit[] = units?.filter((unit) => unit.text.trim()).slice(0, 4) ?? request.source.content.text.split(/\n{2,}/).filter(Boolean).slice(0, 4).map((text, index) => ({ number: index + 1, text }));
  return chunks.map((unit, index) => {
    const lines = unit.text.split("\n").map((line) => line.trim()).filter(Boolean);
    const heading = unit.title || (lines[0]?.length < 90 ? lines[0].replace(/^#+\s*/, "") : "Key idea " + (index + 1));
    const body = lines.slice(heading === lines[0] ? 1 : 0).join(" ") || unit.text;
    const prefix = request.strategy === "simple" ? "In simple terms, " : request.strategy === "step-by-step" ? "Step " + (index + 1) + ": " : request.strategy === "exam-ready" ? "Remember: " : "";
    return { title: heading, explanation: prefix + firstSentence(body), keyPoints: body.split(/(?<=[.!?])\s+/).filter(Boolean).slice(0, 3).map(firstSentence), sourceUnit: unit.number };
  });
}

function questions(sections: StudySection[], terms: string[]): QuizQuestion[] {
  return sections.slice(0, 3).map((section) => {
    const options = [section.title, ...terms, ...sections.map((item) => item.title)].filter((item, index, list) => list.indexOf(item) === index).slice(0, 4).sort((a, b) => a.localeCompare(b));
    if (!options.includes(section.title)) options[0] = section.title;
    return { question: "Which source topic is best described by: “" + section.explanation.slice(0, 110) + (section.explanation.length > 110 ? "…" : "") + "”?", options, answer: section.title, explanation: "The source section “" + section.title + "” introduces this idea." };
  });
}

function localization(language: string) {
  if (language === "Malayalam") return "പഠന കുറിപ്പ്: ";
  if (language === "Hindi") return "अध्ययन नोट: ";
  if (language === "Tamil") return "கற்றல் குறிப்பு: ";
  return "";
}

export class MockAIProvider implements AIProvider {
  async generateStudySpace(request: StudyRequest): Promise<StudySpace> {
    const text = request.source.content.text.trim();
    if (!text) throw new Error("The processed document has no readable content.");
    const terms = topicTerms(text);
    const sections = sourceSections(request);
    const focus = request.customQuestion?.trim();
    const prefix = localization(request.learnerContext.language);
    let overview = prefix + "Based on " + request.source.fileName + ", this " + request.learnerContext.field + " study space is tailored for " + request.learnerContext.level + " and the goal “" + request.learnerContext.goal + ".” " + firstSentence(text);
    let label: string | undefined;
    if (request.mode === "summarize") overview = prefix + "Concise source summary: " + sections.map((section) => section.explanation).join(" ").slice(0, 650);
    if (request.mode === "quiz") overview = prefix + "Use this source-based self-check to practise the main ideas in " + request.source.fileName + ".";
    if (request.mode === "research") { label = "Source-based research"; overview = prefix + "Source-based research only — these are topics and relationships found in " + request.source.fileName + ", not external web research."; }
    if (request.mode === "ask") overview = focus ? prefix + "Answering “" + focus + "” from the uploaded source: " + (sections[0]?.explanation ?? firstSentence(text)) : prefix + "Ask a specific question about this uploaded source to receive a focused answer.";
    const concepts = terms.slice(0, 5).map((term) => ({ term, explanation: text.match(new RegExp("[^.!?]*\\\\b" + term + "\\\\b[^.!?]*[.!?]?", "i"))?.[0]?.trim() || "A recurring topic in " + request.source.fileName + "." }));
    const takeaways = request.strategy === "exam-ready"
      ? sections.flatMap((section) => ["Define " + section.title + ": " + section.explanation, ...section.keyPoints.slice(0, 1)]).slice(0, 5)
      : request.strategy === "step-by-step"
        ? sections.map((section, index) => "Step " + (index + 1) + ": " + section.title + " — " + section.explanation).slice(0, 5)
        : sections.flatMap((section) => section.keyPoints).slice(0, 5);
    const blocks = takeaways.slice(0, 3).map((content) => ({ type: "explanation" as const, title: "Source note", content, term: "", definition: "", emphasis: "", columns: [], rows: [], steps: [], nodes: [], edges: [], language: "", code: "", question: "", options: [], correctOption: -1, explanation: "" }));
    return { title: request.source.title || request.source.fileName.replace(/\.[^.]+$/, ""), source: { fileName: request.source.fileName, type: request.source.extension.toUpperCase(), normalizedSource: request.source }, overview, sections, keyTakeaways: takeaways, concepts, blocks, quiz: { questions: questions(sections, terms) }, metadata: { mode: request.mode, strategy: request.strategy, generatedAt: new Date().toISOString(), language: request.learnerContext.language, label } };
  }
}
