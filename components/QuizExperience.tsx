"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, LoaderCircle, RotateCcw } from "lucide-react";
import { createStudyCorpus } from "@/lib/corpus";
import type { ConfiguredQuiz, ConfiguredQuizQuestion, QuizConfig, QuizDifficulty, QuizQuestionType, StudySpace } from "@/lib/ai";
import type { LearnerProfile } from "@/lib/study";

const questionCounts = [5, 10, 15, 20, 25];
const questionTypeOptions: Array<{ value: QuizQuestionType; label: string }> = [
  { value: "multiple_choice", label: "Multiple Choice" },
  { value: "true_false", label: "True / False" },
  { value: "short_answer", label: "Short Answer" },
  { value: "scenario", label: "Scenario / Application" }
];
const difficultyOptions: Array<{ value: QuizDifficulty; label: string }> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "mixed", label: "Mixed" }
];

type Answer = { question: ConfiguredQuizQuestion; answer: string; correct: boolean };
type Phase = "configure" | "loading" | "quiz" | "results" | "review";

function normalized(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function shortAnswerCorrect(answer: string, expected: string) {
  const submitted = normalized(answer);
  const target = normalized(expected);
  if (!submitted || !target) return false;
  if (submitted.includes(target) || target.includes(submitted)) return true;
  const targetWords = target.split(" ").filter((word) => word.length > 2);
  if (!targetWords.length) return submitted === target;
  return targetWords.filter((word) => submitted.split(" ").includes(word)).length / targetWords.length >= 0.6;
}

function isCorrect(question: ConfiguredQuizQuestion, answer: string) {
  return question.type === "short_answer" ? shortAnswerCorrect(answer, question.answer) : normalized(answer) === normalized(question.answer);
}

function questionTypeLabel(type: QuizQuestionType) {
  return questionTypeOptions.find((option) => option.value === type)?.label ?? type;
}

function SourceReferences({ studySpace, question }: { studySpace: StudySpace; question: ConfiguredQuizQuestion }) {
  const sources = studySpace.source.normalizedSources ?? (studySpace.source.normalizedSource ? [studySpace.source.normalizedSource] : []);
  const units = new Map(createStudyCorpus(sources).units.map((unit) => [unit.id, unit]));
  const topic = studySpace.generationContext?.coverage.topics.find((item) => item.id === question.topicId);
  const labels = question.sourceUnitIds.map((id) => {
    const unit = units.get(id);
    return unit ? unit.sourceName + " · " + unit.reference.unitType + " " + unit.reference.unitNumber : id;
  });
  return <div className="mt-4 rounded-xl border border-ink/20 bg-[#fffdf5] p-3 text-xs"><p className="font-bold uppercase tracking-wider text-muted">Source grounding</p><p className="mt-1 font-semibold">{topic?.title ?? question.topicId}</p><p className="mt-1 text-muted">{labels.join(" · ")}</p></div>;
}

export function QuizExperience({ studySpace, learnerContext, onBack }: { studySpace: StudySpace; learnerContext: Pick<LearnerProfile, "level" | "field" | "goal" | "language">; onBack: () => void }) {
  const [phase, setPhase] = useState<Phase>("configure");
  const [countMode, setCountMode] = useState<string>("5");
  const [customCount, setCustomCount] = useState("5");
  const [difficulty, setDifficulty] = useState<QuizDifficulty>("mixed");
  const [questionTypes, setQuestionTypes] = useState<QuizQuestionType[]>(["multiple_choice", "true_false"]);
  const [quiz, setQuiz] = useState<ConfiguredQuiz | null>(null);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState("");
  const questionCount = countMode === "custom" ? Number(customCount) : Number(countMode);
  const config = useMemo<QuizConfig>(() => ({ questionCount, difficulty, questionTypes }), [questionCount, difficulty, questionTypes]);

  const toggleType = (type: QuizQuestionType) => {
    setQuestionTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  };

  const generate = async () => {
    if (!Number.isInteger(config.questionCount) || config.questionCount < 1 || config.questionCount > 25) {
      setError("Choose a question count from 1 to 25.");
      return;
    }
    if (!config.questionTypes.length) {
      setError("Choose at least one question type.");
      return;
    }
    setPhase("loading");
    setError("");
    try {
      const response = await fetch("/api/study/quiz", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ studySpace, config, learnerContext })
      });
      const body = await response.json();
      if (!response.ok || !body?.success) throw new Error(body?.error?.detail ?? body?.error?.message ?? "Quiz generation failed.");
      setQuiz(body.quiz);
      setIndex(0);
      setAnswer("");
      setChecked(false);
      setAnswers([]);
      setPhase("quiz");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Quiz generation failed.");
      setPhase("configure");
    }
  };

  const retry = () => {
    setIndex(0);
    setAnswer("");
    setChecked(false);
    setAnswers([]);
    setPhase("quiz");
  };

  if (phase === "configure" || phase === "loading") {
    return <section className="mx-auto max-w-3xl space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-bold"><ArrowLeft size={16} />Back to Study Space</button>
      <article className="rounded-2xl border border-ink bg-white p-5 shadow-tactile sm:p-7">
        <p className="text-xs font-bold tracking-widest text-muted">QUIZ BUILDER</p>
        <h1 className="mt-2 font-display text-3xl font-bold">Test what you learned</h1>
        <p className="mt-2 text-sm text-muted">Questions are generated from this StudySpace’s selected source material and teaching plan.</p>
        <fieldset className="mt-7">
          <legend className="font-display text-sm font-bold uppercase tracking-wider">Question count</legend>
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {questionCounts.map((count) => <label key={count} className={"cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-bold " + (countMode === String(count) ? "border-ink bg-yellow" : "border-ink/30 bg-[#fffdf5]")}>
              <input className="sr-only" type="radio" name="questionCount" checked={countMode === String(count)} onChange={() => setCountMode(String(count))} />
              {count}
            </label>)}
            <label className={"cursor-pointer rounded-xl border px-3 py-3 text-center text-sm font-bold " + (countMode === "custom" ? "border-ink bg-yellow" : "border-ink/30 bg-[#fffdf5]")}>
              <input className="sr-only" type="radio" name="questionCount" checked={countMode === "custom"} onChange={() => setCountMode("custom")} />
              Custom
            </label>
          </div>
          {countMode === "custom" ? <input value={customCount} onChange={(event) => setCustomCount(event.target.value)} type="number" min="1" max="25" className="mt-3 w-32 rounded-xl border border-ink bg-white px-3 py-2 text-sm" aria-label="Custom question count" /> : null}
        </fieldset>
        <fieldset className="mt-7">
          <legend className="font-display text-sm font-bold uppercase tracking-wider">Difficulty</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {difficultyOptions.map((option) => <label key={option.value} className={"cursor-pointer rounded-full border px-4 py-2 text-sm font-bold " + (difficulty === option.value ? "border-ink bg-lilac" : "border-ink/30 bg-[#fffdf5]")}>
              <input className="sr-only" type="radio" name="difficulty" checked={difficulty === option.value} onChange={() => setDifficulty(option.value)} />
              {option.label}
            </label>)}
          </div>
        </fieldset>
        <fieldset className="mt-7">
          <legend className="font-display text-sm font-bold uppercase tracking-wider">Question types</legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {questionTypeOptions.map((option) => <label key={option.value} className={"flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm font-semibold " + (questionTypes.includes(option.value) ? "border-ink bg-lime/30" : "border-ink/30 bg-[#fffdf5]")}>
              <input type="checkbox" checked={questionTypes.includes(option.value)} onChange={() => toggleType(option.value)} className="h-4 w-4 accent-black" />
              {option.label}
            </label>)}
          </div>
        </fieldset>
        {error ? <div role="alert" className="mt-5 rounded-xl border border-coral bg-coral/10 p-3 text-sm">{error}<button onClick={() => void generate()} className="ml-2 font-bold underline">Retry</button></div> : null}
        <button disabled={phase === "loading"} onClick={() => void generate()} className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl border border-ink bg-ink py-4 font-display text-lg font-bold text-white shadow-tactile disabled:opacity-50">
          {phase === "loading" ? <><LoaderCircle className="animate-spin" size={19} />Generating grounded quiz…</> : "Generate Quiz"}
        </button>
      </article>
    </section>;
  }

  const questions = quiz?.questions ?? [];
  if (phase === "results") {
    const score = answers.filter((item) => item.correct).length;
    const weakAreas = new Map<string, number>();
    for (const item of answers.filter((entry) => !entry.correct)) weakAreas.set(item.question.topicId, (weakAreas.get(item.question.topicId) ?? 0) + 1);
    const topicTitle = (topicId: string) => studySpace.generationContext?.learningPlan.topics.find((topic) => topic.topicId === topicId)?.title ?? studySpace.generationContext?.coverage.topics.find((topic) => topic.id === topicId)?.title ?? topicId;
    return <section className="mx-auto max-w-3xl space-y-5">
      <article className="rounded-2xl border border-ink bg-yellow p-7 text-center shadow-tactile">
        <p className="text-xs font-bold tracking-widest">QUIZ COMPLETE</p>
        <h1 className="mt-3 font-display text-5xl font-bold">{score} / {questions.length}</h1>
        <p className="mt-3">Correct: {score} · Incorrect: {questions.length - score}</p>
      </article>
      <article className="rounded-2xl border border-ink bg-white p-5">
        <h2 className="font-display text-xl font-bold">Weak areas</h2>
        {weakAreas.size ? <ul className="mt-4 space-y-2">{Array.from(weakAreas.entries()).sort((a, b) => b[1] - a[1]).map(([topicId, count]) => <li key={topicId} className="flex justify-between rounded-xl bg-coral/10 p-3 text-sm"><span className="font-semibold">{topicTitle(topicId)}</span><span>{count} incorrect</span></li>)}</ul> : <p className="mt-3 rounded-xl bg-lime/30 p-3 text-sm">Excellent—no weak areas from this quiz.</p>}
      </article>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setPhase("review")} className="rounded-full border border-ink bg-white px-4 py-2 text-sm font-bold">Review Answers</button>
        <button onClick={retry} className="inline-flex items-center gap-2 rounded-full border border-ink bg-lilac px-4 py-2 text-sm font-bold"><RotateCcw size={15} />Retry Quiz</button>
        <button onClick={onBack} className="rounded-full border border-ink bg-ink px-4 py-2 text-sm font-bold text-white">Back to Study</button>
      </div>
    </section>;
  }

  if (phase === "review") {
    return <section className="mx-auto max-w-3xl space-y-4">
      <button onClick={() => setPhase("results")} className="flex items-center gap-1 text-sm font-bold"><ArrowLeft size={16} />Back to results</button>
      <h1 className="font-display text-3xl font-bold">Review answers</h1>
      {answers.map((item, number) => <article key={item.question.id} className="rounded-2xl border border-ink bg-white p-5">
        <p className="text-xs font-bold text-muted">QUESTION {number + 1} · {questionTypeLabel(item.question.type)}</p>
        <p className="mt-2 font-bold">{item.question.question}</p>
        <p className="mt-3 text-sm"><b>Your answer:</b> {item.answer || "No answer"}</p>
        <p className="text-sm"><b>Correct answer:</b> {item.question.answer}</p>
        <p className="mt-2 rounded-xl bg-[#f3f3f3] p-3 text-sm">{item.question.explanation}</p>
        <SourceReferences studySpace={studySpace} question={item.question} />
      </article>)}
    </section>;
  }

  const question = questions[index];
  if (!question) return null;
  const correct = isCorrect(question, answer);
  const progress = ((index + 1) / questions.length) * 100;
  const next = () => {
    setAnswers((current) => [...current, { question, answer, correct }]);
    setAnswer("");
    setChecked(false);
    if (index + 1 >= questions.length) setPhase("results");
    else setIndex((current) => current + 1);
  };

  return <section className="mx-auto max-w-3xl">
    <header className="mb-5 flex items-center justify-between gap-3">
      <button onClick={onBack} className="flex items-center gap-1 text-sm font-bold"><ArrowLeft size={16} />Back to Study Space</button>
      <span className="text-xs font-bold">QUIZ · {index + 1}/{questions.length}</span>
    </header>
    <div className="h-2 overflow-hidden rounded-full border border-ink bg-white"><div className="h-full bg-lime transition-all" style={{ width: progress + "%" }} /></div>
    <article className="mt-5 rounded-2xl border border-ink bg-white p-5 shadow-tactile sm:p-7">
      <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider"><span className="rounded-full bg-lilac px-2 py-1">{questionTypeLabel(question.type)}</span><span className="rounded-full bg-yellow px-2 py-1">{question.difficulty}</span><span className="rounded-full bg-[#f3f3f3] px-2 py-1">{studySpace.generationContext?.learningPlan.topics.find((topic) => topic.topicId === question.topicId)?.title ?? question.topicId}</span></div>
      <p className="mt-5 text-xs font-bold tracking-widest text-muted">QUESTION {index + 1} OF {questions.length}</p>
      <h1 className="mt-3 font-display text-xl font-bold">{question.question}</h1>
      {question.options.length ? <div className="mt-6 space-y-3">{question.options.map((option, optionIndex) => <button key={option} disabled={checked} onClick={() => setAnswer(option)} className={"w-full rounded-xl border p-4 text-left font-semibold transition " + (checked && option === question.answer ? "border-lime bg-lime/40" : checked && option === answer ? "border-coral bg-coral/20" : answer === option ? "border-ink bg-yellow" : "border-ink/30 bg-[#fffdf5]")}>{String.fromCharCode(65 + optionIndex)}. {option}</button>)}</div> : <textarea value={answer} disabled={checked} onChange={(event) => setAnswer(event.target.value)} rows={4} placeholder="Write your answer…" className="mt-6 w-full rounded-xl border border-ink bg-[#fffdf5] p-3 text-sm outline-none focus:ring-2 focus:ring-ink disabled:opacity-70" />}
      {checked ? <><div className={"mt-5 rounded-xl p-4 text-sm " + (correct ? "bg-lime/30" : "bg-coral/10")}><p className="flex items-center gap-2 font-bold">{correct ? <CheckCircle2 size={17} /> : null}{correct ? "Correct." : "Not quite."}</p><p className="mt-2 leading-6">{question.explanation}</p></div><SourceReferences studySpace={studySpace} question={question} /></> : null}
      <button disabled={!answer.trim()} onClick={() => checked ? next() : setChecked(true)} className="mt-6 rounded-full border border-ink bg-ink px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{checked ? (index + 1 === questions.length ? "See results" : "Next question") : "Check Answer"}</button>
    </article>
  </section>;
}
