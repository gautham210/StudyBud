"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Sparkles } from "lucide-react";
import type { LearningBlock, StudySpace as StudySpaceType } from "@/lib/ai";
import { StudyBlockRenderer } from "@/components/study/StudyBlockRenderer";
import { AskBud } from "@/components/study/AskBud";

export type WorkspaceView = "overview" | "learn" | "concepts" | "takeaways" | "quiz" | "ask";
type TopicGroup = { title: string; description: string; blocks: LearningBlock[] };
function groupsFor(space: StudySpaceType): TopicGroup[] {
  const plans = space.generationContext?.learningPlan.topics ?? [];
  if (!plans.length) return [{ title: "Study lesson", description: space.overview, blocks: space.blocks }];
  const remaining = [...space.blocks];
  return plans.map((topic, index) => {
    const terms = [topic.title, ...topic.concepts.map((concept) => concept.name)].filter(Boolean).map((value) => value.toLowerCase());
    const matches = remaining.filter((block) => terms.some((term) => (block.title + " " + block.content + " " + block.term).toLowerCase().includes(term)));
    const selected = matches.length ? matches : remaining.length ? [remaining[index % remaining.length]] : [];
    for (const block of selected) { const at = remaining.indexOf(block); if (at >= 0) remaining.splice(at, 1); }
    return { title: topic.title, description: topic.learningObjectives.join(" · "), blocks: selected };
  }).filter((group) => group.blocks.length);
}
function LearnLesson({ studySpace }: { studySpace: StudySpaceType }) {
  const groups = useMemo(() => groupsFor(studySpace), [studySpace]);
  const [open, setOpen] = useState(0);
  const [explored, setExplored] = useState<number[]>([0]);
  const reveal = (index: number) => { setOpen(index); setExplored((current) => current.includes(index) ? current : [...current, index]); };
  return <section className="space-y-5"><header className="rounded-2xl border border-ink bg-[#fffdf5] p-5 shadow-tactile-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-xs font-bold tracking-widest text-purple"><Sparkles size={15} />LEARN</p><h2 className="mt-2 font-display text-2xl font-bold">Your guided lesson</h2><p className="mt-1 text-sm text-muted">Explore each generated topic at your own pace.</p></div><span className="rounded-full border border-ink bg-white px-3 py-2 text-xs font-bold">{explored.length} / {groups.length} topics explored</span></div></header>{groups.map((group, index) => { const expanded = open === index; return <article key={group.title + index} className="overflow-hidden rounded-2xl border border-ink bg-white shadow-tactile-sm"><button onClick={() => reveal(index)} className="flex w-full items-center gap-4 p-5 text-left"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-ink bg-yellow font-display text-lg font-bold">{String(index + 1).padStart(2, "0")}</span><span className="min-w-0 flex-1"><span className="block font-display text-xl font-bold">{group.title}</span><span className="mt-1 block text-sm leading-5 text-muted">{group.description || "Explore the generated learning blocks for this topic."}</span></span><ChevronDown className={expanded ? "rotate-180 transition" : "transition"} /></button>{expanded ? <div className="animate-[rise_.22s_ease-out] border-t border-ink/10 bg-[#fffdf5]/50 p-4 sm:p-5"><StudyBlockRenderer blocks={group.blocks} /></div> : null}</article>; })}</section>;
}
export function StudySpace({ studySpace, activeView = "overview", onViewChange = () => undefined, onBack = () => undefined }: { studySpace: StudySpaceType; activeView?: WorkspaceView; onViewChange?: (view: WorkspaceView) => void; onBack?: () => void }) {
 const nav: WorkspaceView[] = ["overview", "learn", "concepts", "takeaways", "quiz", "ask"];
 const overview = <div className="space-y-5"><section className="rounded-2xl border border-ink bg-[#fffdf5] p-6"><p className="text-xs font-bold tracking-widest">SESSION OVERVIEW</p><p className="mt-3 leading-7">{studySpace.overview}</p></section><section className="rounded-2xl border border-ink bg-yellow p-6"><p className="text-xs font-bold tracking-widest">HIGH-YIELD TAKEAWAY</p><p className="mt-3 font-display text-xl font-bold">{studySpace.blocks.find((b) => b.type === "core_takeaway")?.content || studySpace.keyTakeaways[0]}</p></section><div className="flex flex-wrap gap-2">{studySpace.concepts.map((c) => <button key={c.term} onClick={() => onViewChange("learn")} className="rounded-full border border-ink bg-white px-3 py-2 text-sm">{c.term}</button>)}</div></div>;
 const concepts = <div className="grid gap-3 sm:grid-cols-2">{studySpace.concepts.map((c) => <article key={c.term} className="rounded-xl border border-ink bg-purple/10 p-5"><h2 className="font-display text-xl font-bold">{c.term}</h2><p className="mt-2 text-sm">{c.explanation}</p><button onClick={() => onViewChange("learn")} className="mt-3 text-xs font-bold underline">Explore</button></article>)}</div>;
 const takeaways = <section className="rounded-2xl border border-ink bg-lime/30 p-6"><h2 className="font-display text-xl font-bold">Revision sheet</h2><ul className="mt-4 space-y-3">{studySpace.keyTakeaways.map((x) => <li key={x}>• {x}</li>)}</ul></section>;
 const content = activeView === "ask" ? <AskBud studySpace={studySpace} /> : activeView === "learn" ? <LearnLesson studySpace={studySpace} /> : activeView === "concepts" ? concepts : activeView === "takeaways" ? takeaways : overview;
 return <section className="mx-auto max-w-[1180px] space-y-5"><header className="rounded-2xl border border-ink bg-white p-5 shadow-tactile"><button onClick={onBack} className="flex gap-1 text-sm font-bold"><ArrowLeft size={16} />Back to Workspace</button><div className="mt-4 flex gap-2"><span className="rounded-full bg-yellow px-2 py-1 text-xs font-bold">{studySpace.metadata.mode}</span><span className="rounded-full bg-pink/20 px-2 py-1 text-xs font-bold">{studySpace.metadata.strategy}</span></div><h1 className="mt-3 font-display text-3xl font-bold">{studySpace.title}</h1><p className="text-sm text-muted">{studySpace.source.fileName}</p></header><nav className="flex gap-2 overflow-x-auto pb-1">{nav.map((v) => <button key={v} onClick={() => onViewChange(v)} className={"shrink-0 rounded-full border px-3 py-2 text-xs font-bold " + (activeView === v ? "bg-ink text-white" : "bg-white")}>{v}</button>)}</nav><main>{content}</main></section>;
}
