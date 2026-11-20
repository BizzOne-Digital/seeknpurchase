"use client";

import { useEffect, useRef, useState } from "react";
import { Ruler, X } from "lucide-react";
import { ADULT, HATS, KIDS } from "@/lib/size-guide";
import { cn } from "@/lib/utils";

/** "Size guide" link that opens the size charts in a pop-up instead of leaving the product page. */
export function SizeGuideButton({ es }: { es: boolean }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"adult" | "kids" | "hats">("adult");
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const tables = {
    adult: { head: [es ? "Talla" : "Size", es ? "Pecho (in)" : "Chest (in)", es ? "Pecho (cm)" : "Chest (cm)", es ? "Largo (in)" : "Length (in)", es ? "Largo (cm)" : "Length (cm)"], rows: ADULT },
    kids: { head: [es ? "Talla" : "Size", es ? "Edad" : "Age", es ? "Pecho (in)" : "Chest (in)", es ? "Pecho (cm)" : "Chest (cm)", es ? "Estatura (in)" : "Height (in)", es ? "Estatura (cm)" : "Height (cm)"], rows: KIDS },
    hats: { head: [es ? "Talla" : "Size", es ? "Talla de sombrero" : "Hat Size", es ? "Cabeza (in)" : "Head (in)", es ? "Cabeza (cm)" : "Head (cm)"], rows: HATS },
  }[tab];

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="ml-3 inline-flex items-center gap-1 text-xs font-medium text-slate-500 underline hover:text-gold-600">
        <Ruler className="h-3.5 w-3.5" /> {es ? "Guía de tallas" : "Size guide"}
      </button>
      <dialog ref={ref} onClose={() => setOpen(false)} onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        className="w-[min(680px,calc(100vw-32px))] rounded-2xl p-0 text-left font-normal backdrop:bg-navy/50">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="font-sans text-lg font-semibold">{es ? "Guía de tallas" : "Size Guide"}</h2>
          <button type="button" onClick={() => setOpen(false)} aria-label={es ? "Cerrar" : "Close"} className="rounded-full p-1.5 hover:bg-cream"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">
          <div role="tablist" className="mb-4 flex gap-2">
            {([["adult", es ? "Adulto" : "Adult"], ["kids", es ? "Niños" : "Kids"], ["hats", es ? "Sombreros" : "Hats"]] as const).map(([k, l]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className={cn("rounded-full border px-4 py-1.5 text-sm font-medium", tab === k ? "border-navy bg-navy text-white" : "border-line hover:border-navy")}>{l}</button>
            ))}
          </div>
          <div className="overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[420px] text-sm">
              <thead className="bg-cream text-left"><tr>{tables.head.map((h) => <th key={h} className="px-3 py-2.5 font-semibold text-navy">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-line">
                {tables.rows.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={cn("px-3 py-2.5", i === 0 ? "font-semibold" : "text-slate-600")}>{c}</td>)}</tr>)}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-slate-500">{es ? "Medidas del cuerpo. Si estás entre dos tallas, elige la más grande." : "Body measurements. If you're between two sizes, choose the larger one."}</p>
        </div>
      </dialog>
    </>
  );
}
