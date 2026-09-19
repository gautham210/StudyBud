import OpenAI from "openai";
import type { AIProvider, ConfiguredQuiz, ConfiguredQuizQuestion, CoverageAnalysis, CoverageTopic, LearningBlockType, LearningPlan, LearningPlanTopic, QuizConfig, QuizQuestionType, QuizRequest, StudyRequest, StudySpace } from "@/lib/ai";
import { createStudyCorpus, selectCorpusContext } from "@/lib/corpus";
import type { ImageAnalysis, ImageUpload } from "@/lib/images";

const MAX_SOURCE_CHARS = 18000;
const MAX_PLAN_CONTEXT_CHARS = 14000;
const debug = (event: string, details: Record<string, unknown> = {}) => { if (process.env.NODE_ENV !== "production") console.info("[StudyBud OpenAI]", event, details); };
const learningBlockTypes: LearningBlockType[] = ["core_takeaway", "important", "exam_tip", "memory_tip", "common_mistake", "explanation", "example", "key_term", "definition", "concept", "comparison", "process", "diagram", "code", "quick_check"];
const quizQuestionTypes: QuizQuestionType[] = ["multiple_choice", "true_false", "short_answer", "scenario"];
const schema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "overview", "sections", "keyTakeaways", "concepts", "quiz", "blocks"],
  properties: {
    title: { type: "string" },
    overview: { type: "string" },
    sections: { type: "array", minItems: 1, maxItems: 8, items: { type: "object", additionalProperties: false, required: ["title", "explanation", "keyPoints"], properties: { title: { type: "string" }, explanation: { type: "string" }, keyPoints: { type: "array", items: { type: "string" }, maxItems: 5 } } } },
    keyTakeaways: { type: "array", minItems: 3, maxItems: 8, items: { type: "string" } },
    concepts: { type: "array", minItems: 3, maxItems: 8, items: { type: "object", additionalProperties: false, required: ["term", "explanation"], properties: { term: { type: "string" }, explanation: { type: "string" } } } },
    blocks: { type: "array", minItems: 3, items: { type: "object", additionalProperties: false, required: ["type", "title", "content", "term", "definition", "emphasis", "columns", "rows", "steps", "nodes", "edges", "language", "code", "question", "options", "correctOption", "explanation"], properties: { type: { type: "string", enum: ["core_takeaway", "important", "exam_tip", "memory_tip", "common_mistake", "explanation", "example", "key_term", "definition", "concept", "comparison", "process", "diagram", "code", "quick_check"] }, title: { type: "string" }, content: { type: "string" }, term: { type: "string" }, definition: { type: "string" }, emphasis: { type: "string" }, columns: { type: "array", items: { type: "string" } }, rows: { type: "array", items: { type: "array", items: { type: "string" } } }, steps: { type: "array", items: { type: "string" } }, nodes: { type: "array", items: { type: "string" } }, edges: { type: "array", items: { type: "array", items: { type: "string" } } }, language: { type: "string" }, code: { type: "string" }, question: { type: "string" }, options: { type: "array", items: { type: "string" } }, correctOption: { type: "integer" }, explanation: { type: "string" } } } },
    quiz: { type: "object", additionalProperties: false, required: ["questions"], properties: { questions: { type: "array", minItems: 3, maxItems: 10, items: { type: "object", additionalProperties: false, required: ["question", "options", "answer", "explanation"], properties: { question: { type: "string" }, options: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } }, answer: { type: "string" }, explanation: { type: "string" } } } } } }
  }
} as const;
const coverageSchema = {
  type: "object", additionalProperties: false, required: ["topics"], properties: {
    topics: { type: "array", minItems: 1, maxItems: 20, items: { type: "object", additionalProperties: false, required: ["id", "title", "summary", "sourceUnitIds", "subtopics", "importantTerms", "contentTypes"], properties: { id: { type: "string" }, title: { type: "string" }, summary: { type: "string" }, sourceUnitIds: { type: "array", items: { type: "string" } }, subtopics: { type: "array", items: { type: "string" } }, importantTerms: { type: "array", items: { type: "string" } }, contentTypes: { type: "array", items: { type: "string" } } } } }
  }
} as const;
const imageAnalysisSchema = { type: "object", additionalProperties: false, required: ["summary", "visibleText", "visualElements", "educationalInsights"], properties: { summary: { type: "string" }, visibleText: { type: "string" }, visualElements: { type: "array", items: { type: "string" } }, educationalInsights: { type: "array", items: { type: "string" } } } } as const;
const learningPlanSchema = {
  type: "object", additionalProperties: false, required: ["topics"], properties: {
    topics: { type: "array", minItems: 1, items: { type: "object", additionalProperties: false, required: ["topicId", "title", "sourceUnitIds", "learningObjectives", "concepts", "recommendedBlocks", "examplesToTeach", "visualOpportunities", "examFocus"], properties: {
      topicId: { type: "string" },
      title: { type: "string" },
      sourceUnitIds: { type: "array", minItems: 1, items: { type: "string" } },
      learningObjectives: { type: "array", minItems: 1, items: { type: "string" } },
      concepts: { type: "array", minItems: 1, items: { type: "object", additionalProperties: false, required: ["name", "description"], properties: { name: { type: "string" }, description: { type: "string" } } } },
      recommendedBlocks: { type: "array", minItems: 1, items: { type: "string", enum: learningBlockTypes } },
      examplesToTeach: { type: "array", items: { type: "string" } },
      visualOpportunities: { type: "array", items: { type: "string" } },
      examFocus: { type: "array", items: { type: "string" } }
    } } }
  }
} as const;
function quizSchema(questionCount: number) {
  return {
    type: "object", additionalProperties: false, required: ["title", "questions"], properties: {
      title: { type: "string" },
      questions: { type: "array", minItems: questionCount, maxItems: questionCount, items: { type: "object", additionalProperties: false, required: ["id", "topicId", "question", "type", "difficulty", "options", "answer", "explanation", "sourceUnitIds"], properties: {
        id: { type: "string" },
        topicId: { type: "string" },
        question: { type: "string" },
        type: { type: "string", enum: quizQuestionTypes },
        difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
        options: { type: "array", items: { type: "string" } },
        answer: { type: "string" },
        explanation: { type: "string" },
        sourceUnitIds: { type: "array", minItems: 1, items: { type: "string" } }
      } } }
    }
  } as const;
}

export function prepareSourceForGeneration(request: StudyRequest) {
  const corpus = request.corpus ?? createStudyCorpus(request.sources ?? [request.source]);
  const selection = selectCorpusContext(corpus, request.mode, request.customQuestion || request.learnerContext.field, MAX_SOURCE_CHARS);
  const text = selection.units.map((unit) => "[" + unit.sourceName + " · " + unit.reference.unitType + " " + unit.reference.unitNumber + "]\n" + unit.text.replace(/^\s*(page\s+\d+|slide\s+\d+)\s*$/gim, "")).join("\n\n");
  return { text, truncated: selection.units.length < corpus.units.length, coverageRatio: selection.coverageRatio, sourceCount: corpus.sources.length };
}

function isStudyContent(value: unknown): value is Pick<StudySpace, "title" | "overview" | "sections" | "keyTakeaways" | "concepts" | "blocks" | "quiz"> {
  if (!value || typeof value !== "object") return false; const x = value as { title?: unknown; overview?: unknown; sections?: unknown[]; keyTakeaways?: unknown[]; concepts?: unknown[]; blocks?: unknown[]; quiz?: { questions?: unknown[] } };
  const strings = (v: unknown) => Array.isArray(v) && v.every((item) => typeof item === "string");
  const validBlock = (block: unknown) => { const b = block as Record<string, unknown>; return !!b && typeof b.type === "string" && typeof b.title === "string" && typeof b.content === "string" && typeof b.term === "string" && typeof b.definition === "string" && typeof b.emphasis === "string" && strings(b.columns) && Array.isArray(b.rows) && b.rows.every(strings) && strings(b.steps) && strings(b.nodes) && Array.isArray(b.edges) && b.edges.every(strings) && typeof b.language === "string" && typeof b.code === "string" && typeof b.question === "string" && strings(b.options) && Number.isInteger(b.correctOption) && typeof b.explanation === "string"; };
  return typeof x.title === "string" && typeof x.overview === "string" && Array.isArray(x.sections) && Array.isArray(x.keyTakeaways) && Array.isArray(x.concepts) && Array.isArray(x.blocks) && x.blocks.every(validBlock) && Array.isArray(x.quiz?.questions) && x.quiz.questions.every((q) => { const z = q as { question?: unknown; options?: unknown[]; answer?: unknown; explanation?: unknown }; return typeof z.question === "string" && Array.isArray(z.options) && typeof z.answer === "string" && typeof z.explanation === "string" && z.options.includes(z.answer); });
}

function isLearningPlan(value: unknown): value is LearningPlan {
  if (!value || typeof value !== "object" || !Array.isArray((value as { topics?: unknown }).topics) || !(value as { topics: unknown[] }).topics.length) return false;
  const strings = (items: unknown) => Array.isArray(items) && items.length > 0 && items.every((item) => typeof item === "string" && item.trim().length > 0);
  return (value as { topics: unknown[] }).topics.every((topic) => {
    const planTopic = topic as Record<string, unknown>;
    return !!planTopic
      && typeof planTopic.topicId === "string" && planTopic.topicId.trim().length > 0
      && typeof planTopic.title === "string" && planTopic.title.trim().length > 0
      && strings(planTopic.sourceUnitIds)
      && strings(planTopic.learningObjectives)
      && strings(planTopic.recommendedBlocks)
      && (planTopic.recommendedBlocks as string[]).every((block) => learningBlockTypes.includes(block as LearningBlockType))
      && strings(planTopic.examplesToTeach)
      && strings(planTopic.visualOpportunities)
      && strings(planTopic.examFocus)
      && Array.isArray(planTopic.concepts) && planTopic.concepts.length > 0
      && planTopic.concepts.every((concept) => {
        const item = concept as Record<string, unknown>;
        return !!item && typeof item.name === "string" && item.name.trim().length > 0 && typeof item.description === "string" && item.description.trim().length > 0;
      });
  });
}

function planTopicBatches(coverage: CoverageAnalysis, unitLengths: Map<string, number>) {
  const batches: CoverageTopic[][] = [];
  let batch: CoverageTopic[] = [];
  let batchUnitIds = new Set<string>();
  let batchSize = 0;

  for (const topic of coverage.topics) {
    const newUnitIds = topic.sourceUnitIds.filter((id) => !batchUnitIds.has(id));
    const topicSize = JSON.stringify(topic).length + newUnitIds.reduce((total, id) => total + (unitLengths.get(id) ?? 0), 0);
    if (batch.length && batchSize + topicSize > MAX_PLAN_CONTEXT_CHARS) {
      batches.push(batch);
      batch = [];
      batchUnitIds = new Set();
      batchSize = 0;
    }
    batch.push(topic);
    for (const id of topic.sourceUnitIds) batchUnitIds.add(id);
    batchSize += topicSize;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

function planSourceContext(topics: CoverageTopic[], corpus: ReturnType<typeof createStudyCorpus>) {
  const sourceUnitIds = Array.from(new Set(topics.flatMap((topic) => topic.sourceUnitIds)));
  const unitsById = new Map(corpus.units.map((unit) => [unit.id, unit]));
  const units = sourceUnitIds.map((id) => unitsById.get(id)).filter((unit): unit is typeof corpus.units[number] => Boolean(unit));
  const textBudgetPerUnit = Math.max(600, Math.floor(MAX_PLAN_CONTEXT_CHARS / Math.max(units.length, 1)));
  return units.map((unit) => {
    const text = unit.text.length > textBudgetPerUnit ? unit.text.slice(0, textBudgetPerUnit) + "\n[Unit text continues in canonical corpus.]" : unit.text;
    return "UNIT_ID=" + unit.id + "\nSOURCE=" + unit.sourceName + "\nREFERENCE=" + unit.reference.unitType + " " + unit.reference.unitNumber + "\nTEXT=" + text;
  }).join("\n\n");
}

function quizSourceContext(corpus: ReturnType<typeof createStudyCorpus>) {
  const selection = selectCorpusContext(corpus, "quiz", "", MAX_SOURCE_CHARS);
  return selection.units.map((unit) => "UNIT_ID=" + unit.id + "\nSOURCE=" + unit.sourceName + "\nREFERENCE=" + unit.reference.unitType + " " + unit.reference.unitNumber + "\nTEXT=" + unit.text).join("\n\n");
}

function isConfiguredQuiz(value: unknown): value is ConfiguredQuiz {
  if (!value || typeof value !== "object") return false;
  const quiz = value as { title?: unknown; questions?: unknown[] };
  if (typeof quiz.title !== "string" || !Array.isArray(quiz.questions)) return false;
  return quiz.questions.every((question) => {
    const item = question as Record<string, unknown>;
    return !!item
      && typeof item.id === "string" && item.id.length > 0
      && typeof item.topicId === "string" && item.topicId.length > 0
      && typeof item.question === "string" && item.question.length > 0
      && typeof item.type === "string" && quizQuestionTypes.includes(item.type as QuizQuestionType)
      && (item.difficulty === "easy" || item.difficulty === "medium" || item.difficulty === "hard")
      && Array.isArray(item.options) && item.options.every((option) => typeof option === "string")
      && typeof item.answer === "string" && item.answer.length > 0
      && typeof item.explanation === "string" && item.explanation.length > 0
      && Array.isArray(item.sourceUnitIds) && item.sourceUnitIds.length > 0 && item.sourceUnitIds.every((id) => typeof id === "string");
  });
}

function createQuizBlueprint(topics: LearningPlanTopic[], config: QuizConfig) {
  const difficulties = config.difficulty === "mixed" ? ["easy", "medium", "hard"] as const : [config.difficulty];
  return Array.from({ length: config.questionCount }, (_, index) => ({
    id: "q-" + (index + 1),
    topicId: topics[index % topics.length].topicId,
    type: config.questionTypes[index % config.questionTypes.length],
    difficulty: difficulties[index % difficulties.length]
  }));
}

export class OpenAIProvider implements AIProvider {
  private async analyzeCoverage(client: OpenAI, request: StudyRequest, model: string): Promise<CoverageAnalysis> {
    const corpus = request.corpus ?? createStudyCorpus(request.sources ?? [request.source]);
    const batches: typeof corpus.units[] = []; let batch: typeof corpus.units = []; let size = 0;
    for (const unit of corpus.units) { if (size + unit.text.length > 12000 && batch.length) { batches.push(batch); batch = []; size = 0; } batch.push(unit); size += unit.text.length; } if (batch.length) batches.push(batch);
    const knownIds = new Set(corpus.units.map((unit) => unit.id)); const topics: CoverageTopic[] = [];
    for (let index = 0; index < batches.length; index += 1) {
      const input = batches[index].map((unit) => "UNIT_ID=" + unit.id + "\nSOURCE=" + unit.sourceName + "\nREFERENCE=" + unit.reference.unitType + " " + unit.reference.unitNumber + "\nTEXT=" + unit.text).join("\n\n");
      const response = await client.responses.create({ model, store: false, instructions: "Analyze only these educational source units. Build a coverage map of every meaningful topic in this batch. Use only UNIT_ID values provided; never invent IDs. Group related units when justified. This is analysis, not a lesson. Do not return HTML or CSS.", input, text: { format: { type: "json_schema", name: "coverage_analysis", strict: true, schema: coverageSchema } } });
      const parsed = JSON.parse(response.output_text) as { topics?: CoverageTopic[] };
      for (const topic of parsed.topics ?? []) { const sourceUnitIds = topic.sourceUnitIds.filter((id) => knownIds.has(id)); if (sourceUnitIds.length) topics.push({ ...topic, id: "batch" + index + "-" + topic.id, sourceUnitIds }); }
    }
    const coveredUnitIds = Array.from(new Set(topics.flatMap((topic) => topic.sourceUnitIds)));
    debug("coverage analysis", { sources: corpus.sources.length, units: corpus.units.length, batches: batches.length, topics: topics.length, coveredUnits: coveredUnitIds.length });
    if (!topics.length) throw new Error("Coverage analysis found no usable source topics.");
    return { topics, sourceUnitCount: corpus.units.length, coveredUnitIds };
  }
  private async createLearningPlan(client: OpenAI, corpus: ReturnType<typeof createStudyCorpus>, coverage: CoverageAnalysis, model: string): Promise<LearningPlan> {
    const unitIds = new Set(corpus.units.map((unit) => unit.id));
    const coverageById = new Map(coverage.topics.map((topic) => [topic.id, topic]));
    const batches = planTopicBatches(coverage, new Map(corpus.units.map((unit) => [unit.id, unit.text.length])));
    const plannedTopics: LearningPlanTopic[] = [];

    for (let index = 0; index < batches.length; index += 1) {
      const coverageTopics = batches[index];
      const expectedTopicIds = new Set(coverageTopics.map((topic) => topic.id));
      const input = "Coverage topics to plan (return exactly one plan topic for every supplied coverage topic, preserving its id as topicId):\n"
        + JSON.stringify(coverageTopics)
        + "\n\nRelevant source-unit context:\n"
        + planSourceContext(coverageTopics, corpus);
      let response;
      try {
        response = await client.responses.create({
          model,
          store: false,
          instructions: "You are StudyBud's source-grounded learning planner. Turn the supplied coverage topics into a rich teaching blueprint, not a generic curriculum. Use only the supplied terminology, organization, relationships, processes, formulas, classifications, and examples. For every coverage topic, return one detailed plan topic with the exact topicId supplied. Every sourceUnitIds value must be a UNIT_ID provided for that coverage topic; do not invent or borrow locations. Specify concrete learning objectives, concepts with accurate descriptions, appropriate semantic study blocks, source-supported examples, useful visual opportunities, and revision or exam focus. Do not generate a lesson, HTML, or CSS.",
          input,
          text: { format: { type: "json_schema", name: "learning_plan", strict: true, schema: learningPlanSchema } }
        });
      } catch (error) {
        const apiError = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown };
        debug("learning plan request failed", { batch: index + 1, name: apiError.name, message: apiError.message, status: apiError.status, code: apiError.code });
        throw error;
      }
      debug("learning plan response received", { batch: index + 1, status: response.status, outputCharacters: response.output_text.length });
      let parsed: unknown;
      try { parsed = JSON.parse(response.output_text); } catch { throw new Error("OpenAI returned invalid learning-plan structured output."); }
      if (!isLearningPlan(parsed)) throw new Error("OpenAI returned an invalid learning-plan structure.");
      const returnedTopicIds = new Set<string>();
      for (const topic of parsed.topics) {
        const coverageTopic = coverageById.get(topic.topicId);
        if (!coverageTopic || !expectedTopicIds.has(topic.topicId) || returnedTopicIds.has(topic.topicId)) {
          throw new Error("Learning plan returned an invalid or duplicate coverage topic ID.");
        }
        if (!topic.sourceUnitIds.length || topic.sourceUnitIds.some((id) => !unitIds.has(id) || !coverageTopic.sourceUnitIds.includes(id))) {
          throw new Error("Learning plan returned an invalid source unit ID.");
        }
        returnedTopicIds.add(topic.topicId);
        plannedTopics.push(topic);
      }
      if (returnedTopicIds.size !== expectedTopicIds.size || Array.from(expectedTopicIds).some((id) => !returnedTopicIds.has(id))) {
        throw new Error("Learning plan did not return every required coverage topic.");
      }
    }
    debug("learning plan validated", { batches: batches.length, topics: plannedTopics.length, sourceUnits: new Set(plannedTopics.flatMap((topic) => topic.sourceUnitIds)).size });
    if (!plannedTopics.length) throw new Error("Learning plan found no usable topics.");
    return { topics: plannedTopics };
  }
  async analyzeImage(upload: ImageUpload): Promise<ImageAnalysis> {
    const key = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    if (!key) throw new Error("OPENAI_API_KEY is not configured.");
    const client = new OpenAI({ apiKey: key });
    debug("image analysis started", { provider: "openai", model, fileName: upload.fileName, mimeType: upload.mimeType, sizeBytes: upload.sizeBytes });
    const response = await client.responses.create({
      model,
      store: false,
      instructions: "You are StudyBud's image learning analyst. Analyze the actual uploaded image as educational material. Extract only visible information: text, labels, diagrams, tables, charts, relationships, captions, symbols, and key visual facts. Do not infer missing content from the filename. Return concise source-grounded structured analysis; do not return HTML or CSS.",
      input: [{ role: "user", content: [{ type: "input_text", text: "Analyze this image for a study workspace. Preserve meaningful visual relationships and visible educational information." }, { type: "input_image", image_url: upload.dataUrl, detail: "high" }] }],
      text: { format: { type: "json_schema", name: "image_analysis", strict: true, schema: imageAnalysisSchema } }
    });
    let parsed: unknown;
    try { parsed = JSON.parse(response.output_text); } catch { throw new Error("OpenAI returned invalid image-analysis structured output."); }
    const image = parsed as Partial<ImageAnalysis>;
    if (!image || typeof image.summary !== "string" || typeof image.visibleText !== "string" || !Array.isArray(image.visualElements) || !image.visualElements.every((item) => typeof item === "string") || !Array.isArray(image.educationalInsights) || !image.educationalInsights.every((item) => typeof item === "string")) throw new Error("OpenAI returned an invalid image-analysis structure.");
    if (!image.summary.trim() && !image.visibleText.trim() && !image.visualElements.length && !image.educationalInsights.length) throw new Error("We couldn't find usable educational information in that image.");
    debug("image analysis validated", { fileName: upload.fileName, visualElements: image.visualElements.length, insights: image.educationalInsights.length });
    return image as ImageAnalysis;
  }  async generateStudySpace(request: StudyRequest): Promise<StudySpace> {
    const key = process.env.OPENAI_API_KEY; const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    debug("request started", { provider: "openai", model, keyConfigured: Boolean(key), sourceCharacters: request.source.content.text.length, sourceCount: request.sources?.length ?? 1 });
    if (!key) throw new Error("OPENAI_API_KEY is not configured.");
    const corpus = request.corpus ?? createStudyCorpus(request.sources ?? [request.source]);
    const client = new OpenAI({ apiKey: key });
    const coverage = request.coverage ?? await this.analyzeCoverage(client, { ...request, corpus }, model);
    const learningPlan = request.learningPlan ?? await this.createLearningPlan(client, corpus, coverage, model);
    const source = prepareSourceForGeneration({ ...request, corpus, coverage });
    let response;
    try { response = await client.responses.create({
      model,
      store: false,
      instructions: "You are StudyBud, an AI learning assistant. Create a study experience ONLY from supplied source material. Do not invent facts. Ignore titles, page labels, repeated headers and extraction noise as concepts. Test knowledge, never extraction mechanics. Preserve terminology. If insufficient, say so. The LearningPlan is the teaching blueprint: generate blocks that satisfy its learning objectives and appropriate recommended blocks for every meaningful topic. Do not collapse the plan into a few summary cards, and do not mechanically emit every recommended block. Choose blocks that teach the material well while retaining the plan's sourceUnitIds-to-topic traceability. Return semantic blocks: core_takeaway for one high-yield idea, explanation for teaching, example only when supported, exam_tip for exam-ready material, memory_tip for recall hooks, common_mistake for source-supported traps. EXPLAIN teaches progressively; SUMMARIZE compresses; RESEARCH is source-based; ASK directly answers the custom question. Strategy changes structure: simple uses intuition, exam-ready definitions/traps, key-concepts prioritization, step-by-step ordered processes. Never return HTML or CSS.",
      input: "Learner context: level=" + request.learnerContext.level + "; subject=" + request.learnerContext.field + "; goal=" + request.learnerContext.goal + "; language=" + request.learnerContext.language + ". Mode=" + request.mode + "; strategy=" + request.strategy + "; custom question=" + (request.customQuestion || "none") + ". Sources selected: " + source.sourceCount + ". Context coverage ratio: " + source.coverageRatio.toFixed(2) + ". Coverage analysis: " + JSON.stringify(coverage.topics) + ".\n\nLearningPlan (the required teaching blueprint): " + JSON.stringify(learningPlan.topics) + ".\n\nSOURCE UNITS:\n" + source.text,
      text: { format: { type: "json_schema", name: "study_space", strict: true, schema } }
    }); } catch (error) { const apiError = error as { name?: unknown; message?: unknown; status?: unknown; code?: unknown }; debug("OpenAI request failed", { name: apiError.name, message: apiError.message, status: apiError.status, code: apiError.code }); throw error; }
    debug("OpenAI response received", { status: response.status, outputCharacters: response.output_text.length });
    let parsed: unknown; try { parsed = JSON.parse(response.output_text); } catch { debug("structured output parsing failed"); throw new Error("OpenAI returned invalid structured output."); }
    if (!isStudyContent(parsed)) throw new Error("OpenAI returned an invalid study-space structure.");
    debug("structured output validated", { sections: parsed.sections.length, concepts: parsed.concepts.length, questions: parsed.quiz?.questions.length ?? 0 });
    return { ...parsed, source: { fileName: request.sources?.length && request.sources.length > 1 ? request.sources.length + " selected sources" : request.source.fileName, type: request.sources?.length && request.sources.length > 1 ? "MULTI-SOURCE" : request.source.extension.toUpperCase(), normalizedSource: request.source, normalizedSources: request.sources ?? [request.source] }, generationContext: { coverage, learningPlan }, metadata: { mode: request.mode, strategy: request.strategy, generatedAt: new Date().toISOString(), language: request.learnerContext.language, label: request.mode === "research" ? "Source-based research" : undefined } };
  }
  async generateQuiz(request: QuizRequest): Promise<ConfiguredQuiz> {
    const key = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
    if (!key) throw new Error("OPENAI_API_KEY is not configured.");
    const sources = request.studySpace.source.normalizedSources ?? (request.studySpace.source.normalizedSource ? [request.studySpace.source.normalizedSource] : []);
    if (!sources.length) throw new Error("This study space no longer has its normalized source material.");
    const corpus = createStudyCorpus(sources);
    const client = new OpenAI({ apiKey: key });
    const baseRequest: StudyRequest = { source: sources[0], sources, corpus, mode: "quiz", strategy: request.studySpace.metadata.strategy, learnerContext: request.learnerContext };
    const coverage = request.studySpace.generationContext?.coverage ?? await this.analyzeCoverage(client, baseRequest, model);
    const learningPlan = request.studySpace.generationContext?.learningPlan ?? await this.createLearningPlan(client, corpus, coverage, model);
    const coverageById = new Map(coverage.topics.map((topic) => [topic.id, topic]));
    const knownUnitIds = new Set(corpus.units.map((unit) => unit.id));
    const planTopics = learningPlan.topics.filter((topic) => {
      const coverageTopic = coverageById.get(topic.topicId);
      if (!coverageTopic) return false;
      return topic.sourceUnitIds.length > 0 && topic.sourceUnitIds.every((id) => knownUnitIds.has(id) && coverageTopic.sourceUnitIds.includes(id));
    });
    if (!planTopics.length) throw new Error("This study space has no valid source-grounded learning topics for a quiz.");
    const blueprint = createQuizBlueprint(planTopics, request.config);
    const response = await client.responses.create({
      model,
      store: false,
      instructions: "You are StudyBud's source-grounded quiz writer. Write only questions supported by the provided source material and teaching plan. Follow every quiz-blueprint entry exactly: preserve id, topicId, question type, and difficulty. Use the sourceUnitIds belonging to that topic only. Do not reveal answers in question wording. Multiple-choice and scenario questions require exactly four plausible options and one exact answer among them. True/false questions require options True and False. Short-answer questions must have no options and a concise expected answer that can be reasonably evaluated by text normalization. Explanations teach why the submitted answer is right or wrong and stay source-grounded. Do not return HTML or CSS.",
      input: "QUIZ BLUEPRINT (return exactly these entries, in this order): " + JSON.stringify(blueprint)
        + "\n\nCoverage topics: " + JSON.stringify(coverage.topics)
        + "\n\nLearning plan: " + JSON.stringify(learningPlan.topics)
        + "\n\nSOURCE UNITS:\n" + quizSourceContext(corpus),
      text: { format: { type: "json_schema", name: "configured_quiz", strict: true, schema: quizSchema(request.config.questionCount) } }
    });
    let parsed: unknown;
    try { parsed = JSON.parse(response.output_text); } catch { throw new Error("OpenAI returned invalid quiz structured output."); }
    if (!isConfiguredQuiz(parsed) || parsed.questions.length !== blueprint.length) throw new Error("OpenAI returned an invalid quiz structure.");
    const seenIds = new Set<string>();
    for (let index = 0; index < parsed.questions.length; index += 1) {
      const question = parsed.questions[index] as ConfiguredQuizQuestion;
      const expected = blueprint[index];
      const coverageTopic = coverageById.get(question.topicId);
      if (!coverageTopic || seenIds.has(question.id) || question.id !== expected.id || question.topicId !== expected.topicId || question.type !== expected.type || question.difficulty !== expected.difficulty) {
        throw new Error("OpenAI returned a quiz question that does not match the requested blueprint.");
      }
      if (question.sourceUnitIds.some((id) => !knownUnitIds.has(id) || !coverageTopic.sourceUnitIds.includes(id))) throw new Error("OpenAI returned a quiz question with an invalid source reference.");
      if ((question.type === "multiple_choice" || question.type === "scenario") && (question.options.length !== 4 || !question.options.includes(question.answer))) throw new Error("OpenAI returned invalid multiple-choice options.");
      if (question.type === "true_false" && (question.options.length !== 2 || !question.options.includes(question.answer) || !question.options.every((option) => option === "True" || option === "False"))) throw new Error("OpenAI returned an invalid true/false question.");
      if (question.type === "short_answer" && question.options.length !== 0) throw new Error("OpenAI returned options for a short-answer question.");
      seenIds.add(question.id);
    }
    debug("quiz generated", { questions: parsed.questions.length, topics: new Set(parsed.questions.map((question) => question.topicId)).size, sourceUnits: new Set(parsed.questions.flatMap((question) => question.sourceUnitIds)).size });
    return parsed;
  }
}
