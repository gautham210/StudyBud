import type { NormalizedStudySource } from "@/lib/documents";
import type { StudyCorpus } from "@/lib/corpus";
import type { LearnerProfile, StudyMode } from "@/lib/study";

export type StudyStrategy = "simple" | "exam-ready" | "key-concepts" | "step-by-step";
export type CoverageTopic = { id: string; title: string; summary: string; sourceUnitIds: string[]; subtopics: string[]; importantTerms: string[]; contentTypes: string[] };
export type CoverageAnalysis = { topics: CoverageTopic[]; sourceUnitCount: number; coveredUnitIds: string[] };
export type LearningPlanTopic = {
  topicId: string;
  title: string;
  sourceUnitIds: string[];
  learningObjectives: string[];
  concepts: { name: string; description: string }[];
  recommendedBlocks: LearningBlockType[];
  examplesToTeach: string[];
  visualOpportunities: string[];
  examFocus: string[];
};
export type LearningPlan = { topics: LearningPlanTopic[] };
export type StudyRequest = { source: NormalizedStudySource; sources?: NormalizedStudySource[]; corpus?: StudyCorpus; coverage?: CoverageAnalysis; learningPlan?: LearningPlan; mode: StudyMode; strategy: StudyStrategy; learnerContext: Pick<LearnerProfile, "level" | "field" | "goal" | "language">; customQuestion?: string };
export type StudySection = { title: string; explanation: string; keyPoints: string[]; sourceUnit?: number };
export type StudyConcept = { term: string; explanation: string };
export type QuizQuestion = { question: string; options: string[]; answer: string; explanation: string };
export type StudyQuiz = { questions: QuizQuestion[] };
export type QuizQuestionType = "multiple_choice" | "true_false" | "short_answer" | "scenario";
export type QuizDifficulty = "easy" | "medium" | "hard" | "mixed";
export type QuizConfig = { questionCount: number; difficulty: QuizDifficulty; questionTypes: QuizQuestionType[] };
export type ConfiguredQuizQuestion = {
  id: string;
  topicId: string;
  question: string;
  type: QuizQuestionType;
  difficulty: Exclude<QuizDifficulty, "mixed">;
  options: string[];
  answer: string;
  explanation: string;
  sourceUnitIds: string[];
};
export type ConfiguredQuiz = { title: string; questions: ConfiguredQuizQuestion[] };
export type SourceReference = { unitType: "page" | "section" | "slide" | "sheet"; unitNumber: number; label?: string };
export type LearningBlockType = "core_takeaway" | "important" | "exam_tip" | "memory_tip" | "common_mistake" | "explanation" | "example" | "key_term" | "definition" | "concept" | "comparison" | "process" | "diagram" | "code" | "quick_check";
export type LearningBlock = { type: LearningBlockType; title: string; content: string; term: string; definition: string; emphasis: string; columns: string[]; rows: string[][]; steps: string[]; nodes: string[]; edges: string[][]; language: string; code: string; question: string; options: string[]; correctOption: number; explanation: string; sourceReference?: SourceReference };
export type StudySpace = {
  title: string;
  source: { fileName: string; type: string; normalizedSource?: NormalizedStudySource; normalizedSources?: NormalizedStudySource[] };
  overview: string;
  sections: StudySection[];
  keyTakeaways: string[];
  concepts: StudyConcept[];
  blocks: LearningBlock[];
  quiz?: StudyQuiz;
  generationContext?: { coverage: CoverageAnalysis; learningPlan: LearningPlan };
  metadata: { mode: StudyMode; strategy: StudyStrategy; generatedAt: string; language: string; label?: string };
};
export type QuizRequest = {
  studySpace: StudySpace;
  config: QuizConfig;
  learnerContext: Pick<LearnerProfile, "level" | "field" | "goal" | "language">;
};
export interface AIProvider {
  generateStudySpace(request: StudyRequest): Promise<StudySpace>;
  generateQuiz?(request: QuizRequest): Promise<ConfiguredQuiz>;
}
