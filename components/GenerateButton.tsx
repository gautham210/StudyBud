import { LoaderCircle, Sparkles } from "lucide-react";

export function GenerateButton({ mode, disabled, loading, onClick }: { mode: string; disabled: boolean; loading: boolean; onClick: () => void }) {
  return <button type="button" disabled={disabled || loading} onClick={onClick} className="tactile mt-1 flex w-full items-center justify-center gap-3 rounded-xl border border-ink bg-ink py-4 font-display text-lg font-bold text-white shadow-tactile disabled:cursor-not-allowed disabled:border-ink/30 disabled:bg-[#dadada] disabled:text-muted disabled:shadow-none"><span>{loading ? "Preparing your study space..." : "Generate " + (mode === "ask" ? "Answer" : "Study Space")}</span>{loading ? <LoaderCircle className="animate-spin" size={19} /> : <Sparkles size={19} />}</button>;
}
