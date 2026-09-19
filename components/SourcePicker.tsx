"use client";
import { Files, ImageIcon, Type, Youtube } from "lucide-react";
import { SourceType, sourceLabels, sourceTypes } from "@/lib/study";

const icons = { document: Files, image: ImageIcon, youtube: Youtube, text: Type };
export function SourcePicker({ value, onChange }: { value: SourceType; onChange: (value: SourceType) => void }) {
  return <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist" aria-label="Study material source">
    {sourceTypes.map((source) => { const Icon = icons[source]; const active = value === source; return <button key={source} type="button" role="tab" aria-selected={active} onClick={() => onChange(source)} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2 font-display text-sm font-semibold transition-all ${active ? "border-ink bg-ink text-white shadow-tactile-sm" : "border-ink/40 bg-paper hover:border-ink hover:bg-[#f3f3f3]"}`}><Icon size={17} />{sourceLabels[source]}</button>; })}
  </div>;
}
