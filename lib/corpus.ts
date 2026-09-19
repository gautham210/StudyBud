import type { ContentUnit, NormalizedStudySource } from "@/lib/documents";
import type { StudyMode } from "@/lib/study";

export type CorpusUnit = { id: string; sourceId: string; sourceName: string; order: number; reference: { unitType: "page" | "section" | "slide" | "sheet" | "document"; unitNumber: number; label?: string }; text: string };
export type StudyCorpus = { sources: NormalizedStudySource[]; units: CorpusUnit[]; characterCount: number };

function unitsFor(source: NormalizedStudySource): Array<{ unit: ContentUnit; unitType: CorpusUnit["reference"]["unitType"] }> {
  if (source.content.pages?.length) return source.content.pages.map((unit) => ({ unit, unitType: "page" }));
  if (source.content.sections?.length) return source.content.sections.map((unit) => ({ unit, unitType: "section" }));
  if (source.content.slides?.length) return source.content.slides.map((unit) => ({ unit, unitType: "slide" }));
  if (source.content.sheets?.length) return source.content.sheets.map((unit) => ({ unit, unitType: "sheet" }));
  return [{ unit: { number: 1, text: source.content.text }, unitType: "document" }];
}

export function createStudyCorpus(sources: NormalizedStudySource[]): StudyCorpus {
  const units = sources.flatMap((source) => unitsFor(source).filter(({ unit }) => unit.text.trim()).map(({ unit, unitType }, order) => ({ id: source.id + ":" + unitType + ":" + unit.number, sourceId: source.id, sourceName: source.fileName, order, reference: { unitType, unitNumber: unit.number, label: unit.title }, text: unit.text.trim() })));
  return { sources, units, characterCount: units.reduce((total, unit) => total + unit.text.length, 0) };
}

export function selectCorpusContext(corpus: StudyCorpus, mode: StudyMode, query: string | undefined, budget = 18000) {
  const terms = (query || "").toLowerCase().match(/[a-z0-9]{3,}/g) ?? [];
  const ranked = corpus.units.map((unit, index) => ({ unit, index, score: terms.reduce((score, term) => score + (unit.text.toLowerCase().includes(term) ? 8 : 0), 0) + (mode === "summarize" ? -index / 10000 : 0) })).sort((a, b) => b.score - a.score || a.index - b.index);
  const selected: CorpusUnit[] = []; let used = 0;
  for (const { unit } of ranked) { if (used + unit.text.length > budget && selected.length) continue; selected.push(unit); used += unit.text.length; if (used >= budget) break; }
  return { units: selected.sort((a, b) => a.sourceName.localeCompare(b.sourceName) || a.order - b.order), characterCount: used, coverageRatio: corpus.units.length ? selected.length / corpus.units.length : 0 };
}
