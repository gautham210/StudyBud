"use client";
import { SlidersHorizontal, Sparkles } from "lucide-react";
import { LearnerProfile } from "@/lib/study";
export function PersonalizeButton({ onClick, profile }: { onClick: () => void; profile?: LearnerProfile }) {
  return <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4"><div className="flex items-center gap-2"><button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-full border border-ink bg-white px-4 py-2 font-display text-sm font-semibold shadow-tactile-sm transition hover:bg-[#eeeeee]"><Sparkles size={15} />Personalize</button>{profile && <div className="hidden rounded-full border border-ink/20 bg-[#eeeeee] px-3 py-2 text-xs text-muted sm:flex"><SlidersHorizontal size={14} className="mr-1" />{profile.level} / {profile.field} / {profile.goal} / {profile.language}</div>}</div><span className="text-xs font-semibold text-muted">Your learner context</span></div>;
}
