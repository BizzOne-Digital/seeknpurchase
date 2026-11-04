"use client";

import { useId, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type AccordionItem = { q: string; a: React.ReactNode };

export function Accordion({ items, defaultOpen = 0, compact }: { items: AccordionItem[]; defaultOpen?: number | null; compact?: boolean }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  const base = useId();
  return (
    <div className="space-y-2.5">
      {items.map((it, i) => {
        const isOpen = open === i;
        const id = `${base}-${i}`;
        return (
          <div key={i} className={cn("overflow-hidden rounded-md border transition-colors", isOpen ? "border-gold/40 bg-cream" : "border-line bg-white")}>
            <h3 className="font-sans">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-panel`}
                id={`${id}-btn`}
                onClick={() => setOpen(isOpen ? null : i)}
                className={cn("flex w-full items-center justify-between gap-4 text-left font-semibold text-navy", compact ? "px-4 py-2.5 text-sm" : "px-5 py-4 text-[15px]")}
              >
                {it.q}
                {isOpen ? <Minus className="h-4 w-4 shrink-0" /> : <Plus className="h-4 w-4 shrink-0" />}
              </button>
            </h3>
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-btn`}
              className={cn("grid transition-all duration-300 ease-out", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}
            >
              <div className="overflow-hidden">
                <div className={cn("text-sm leading-relaxed text-slate-600", compact ? "px-4 pb-3" : "px-5 pb-5")}>{it.a}</div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
