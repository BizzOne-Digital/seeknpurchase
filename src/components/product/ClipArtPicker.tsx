"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Shapes, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Clip = { id: string; title: string; category: string; image: string };

/** Button + pop-up that lets the customer place a clip art (added by the store in Admin > Clip Art). */
export function ClipArtPicker({ es, disabled, onPick }: { es: boolean; disabled?: boolean; onPick: (image: string) => void }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Clip[] | null>(null);
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    if (open && items === null) fetch("/api/cliparts").then((r) => r.json()).then((d) => setItems(d.items || [])).catch(() => setItems([]));
  }, [open, items]);

  const cats = useMemo(() => [...new Set((items || []).map((c) => c.category))], [items]);
  const shown = (items || []).filter((c) => (!cat || c.category === cat) && (!q || c.title.toLowerCase().includes(q.toLowerCase())));

  return (
    <>
      <button type="button" disabled={disabled} onClick={() => setOpen(true)} className="btn-outline w-full disabled:opacity-40">
        <Shapes className="h-4 w-4" /> {es ? "Agregar clip art" : "Add clip art"}
      </button>
      <dialog ref={ref} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        className="w-[min(760px,calc(100vw-32px))] rounded-2xl p-0 backdrop:bg-navy/50">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-sans text-lg font-semibold">{es ? "Clip art" : "Clip Art"}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label={es ? "Cerrar" : "Close"} className="rounded-full p-1.5 hover:bg-cream"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-4 p-5">
          <label className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder={es ? "Buscar clip art" : "Find your clip art"} value={q} onChange={(e) => setQ(e.target.value)} />
          </label>
          {cats.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {["", ...cats].map((c) => (
                <button key={c || "all"} type="button" onClick={() => setCat(c)}
                  className={cn("rounded-full border px-3 py-1 text-sm", cat === c ? "border-navy bg-navy text-white" : "border-line hover:border-navy")}>
                  {c || (es ? "Todas" : "All")}
                </button>
              ))}
            </div>
          )}
          {items === null ? (
            <p className="py-10 text-center text-sm text-slate-500">{es ? "Cargando…" : "Loading…"}</p>
          ) : shown.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">{es ? "Aún no hay clip art. Puedes subir tu propia imagen." : "No clip art yet. You can upload your own image instead."}</p>
          ) : (
            <ul className="grid max-h-[50vh] grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-5">
              {shown.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => { onPick(c.image); setOpen(false); }} className="group w-full rounded-lg border border-line p-2 text-center hover:border-navy">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.image} alt="" className="mx-auto aspect-square w-full object-contain" />
                    <span className="mt-1 block truncate text-xs text-slate-600 group-hover:text-navy">{c.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </dialog>
    </>
  );
}
