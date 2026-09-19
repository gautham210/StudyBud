"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, FileImage, FileText, Plus, X } from "lucide-react";
import type { StudySource } from "@/lib/study";

const size = (value: number) => value < 1048576 ? Math.max(1, Math.round(value / 1024)) + " KB" : (value / 1048576).toFixed(1) + " MB";
function SourceThumbnail({ source }: { source: StudySource }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => { if (!source.file || source.type !== "image") return; const next = URL.createObjectURL(source.file); setUrl(next); return () => URL.revokeObjectURL(next); }, [source.file, source.type]);
  if (url) return <Image src={url} alt="" width={40} height={40} unoptimized className="h-10 w-10 rounded-lg border border-ink object-cover" />;
  return source.type === "image" ? <FileImage size={18} /> : <FileText size={18} />;
}
export function MultiSourceList({ sources, selectedIds, onToggle, onSelectAll, onClear, onRemove, onAdd }: { sources: StudySource[]; selectedIds: string[]; onToggle: (id: string) => void; onSelectAll: () => void; onClear: () => void; onRemove: (id: string) => void; onAdd: () => void }) {
  const ready = sources.filter((source) => source.processedDocument); if (!ready.length) return null;
  return <section className="mt-4 border-t border-ink/10 pt-4"><div className="flex items-center justify-between"><p className="font-display text-xs font-bold uppercase tracking-wider text-muted">Your sources</p><button onClick={onAdd} className="flex items-center gap-1 text-xs font-bold underline"><Plus size={13} />Add another</button></div><div className="mt-3 space-y-2">{ready.map((source) => { const id = source.processedDocument!.id; const selected = selectedIds.includes(id); return <div key={id} className={"flex items-center gap-3 rounded-xl border p-3 " + (selected ? "border-ink bg-[#fffdf5]" : "border-ink/20 bg-[#f3f3f3]")}><button aria-label={(selected ? "Deselect " : "Select ") + source.processedDocument!.fileName} onClick={() => onToggle(id)} className={"grid h-5 w-5 place-items-center rounded border border-ink " + (selected ? "bg-yellow" : "bg-white")}>{selected ? <Check size={14} /> : null}</button><SourceThumbnail source={source} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{source.processedDocument!.fileName}</p><p className="text-xs text-muted">{source.type === "image" ? "Image" : source.documentKind} · {size(source.processedDocument!.sizeBytes)} · Ready to learn</p></div><button aria-label={"Remove " + source.processedDocument!.fileName} onClick={() => onRemove(id)} className="rounded-full p-1"><X size={16} /></button></div>; })}</div><div className="mt-3 flex items-center justify-between"><p className="text-xs text-muted">{selectedIds.length} of {ready.length} selected</p><div className="flex gap-3"><button onClick={onSelectAll} className="text-xs font-bold underline">Select all</button><button onClick={onClear} className="text-xs font-bold underline">Clear all</button></div></div></section>;
}
