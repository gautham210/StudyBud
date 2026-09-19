"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { LearnerProfile, profileOptions } from "@/lib/study";

export function PersonalizeSheet({ open, profile, onSave, onClose }: { open: boolean; profile: LearnerProfile; onSave: (profile: LearnerProfile) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(profile);
  useEffect(() => setDraft(profile), [profile, open]);
  useEffect(() => { const close = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; if (open) window.addEventListener("keydown", close); return () => window.removeEventListener("keydown", close); }, [open, onClose]);
  if (!open) return null;
  const fields = (["level", "board", "field", "goal", "language"] as const);
  const labels = { level: "Learning level", board: "Board / curriculum", field: "Field / subject", goal: "Learning goal", language: "Language" };
  return <div className="fixed inset-0 z-[60] flex items-end bg-ink/30 p-0 sm:items-center sm:justify-center sm:p-6" role="dialog" aria-modal="true" aria-label="Personalize learning"><button className="absolute inset-0 cursor-default" aria-label="Close personalization" onClick={onClose} /><section className="relative z-10 w-full animate-[rise_.18s_ease-out] rounded-t-2xl border border-ink bg-paper p-5 shadow-tactile sm:max-w-xl sm:rounded-2xl"><div className="flex items-start justify-between"><div><p className="font-display text-xl font-bold">Personalize your study space</p><p className="mt-1 text-sm text-muted">StudyBud will use this context when processing your material.</p></div><button type="button" onClick={onClose} className="rounded-full p-2 hover:bg-[#eeeeee] focus:outline-none focus:ring-2 focus:ring-ink" aria-label="Close"><X size={20} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{fields.map((field) => <label key={field} className={`text-sm font-medium ${field === "goal" ? "sm:col-span-2" : ""}`}>{labels[field]}<select value={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.value })} className="mt-1.5 w-full rounded-lg border border-ink bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ink">{profileOptions[field].map((option) => <option key={option}>{option}</option>)}</select></label>)}</div><button type="button" onClick={() => { onSave(draft); onClose(); }} className="mt-5 w-full rounded-full bg-ink py-3 font-display font-semibold text-white shadow-tactile transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-tactile-sm">Save preferences</button></section></div>;
}
