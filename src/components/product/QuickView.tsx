"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { ProductCardData } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stars } from "@/components/ui/Stars";
import { useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { AddToCartPanel } from "./AddToCartPanel";

export function QuickView({ p, onClose }: { p: ProductCardData; onClose: () => void }) {
  const { money } = useStore();
  const { t } = useI18n();
  const [img, setImg] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    ref.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-navy/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4" onClick={onClose}>
      <div
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={p.title}
        onClick={(e) => e.stopPropagation()}
        className="relative grid max-h-[92vh] w-full max-w-3xl animate-fade-up overflow-y-auto rounded-t-2xl bg-white shadow-lift outline-none sm:rounded-2xl md:grid-cols-2"
      >
        <button onClick={onClose} aria-label={t.common.close} className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 shadow-soft hover:bg-cream">
          <X className="h-4 w-4" />
        </button>
        <div className="bg-cream p-4">
          <div className="relative aspect-square overflow-hidden rounded-lg">
            <SmartImage src={p.images[img] || p.image} alt={p.title} fill sizes="400px" className="object-cover" />
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {p.images.slice(0, 5).map((src, i) => (
                <button key={src + i} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`} className={`relative h-14 w-14 overflow-hidden rounded-md border-2 ${i === img ? "border-gold" : "border-transparent"}`}>
                  <SmartImage src={src} alt="" fill sizes="56px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col p-6">
          <h2 className="text-2xl">{p.title}</h2>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Stars rating={p.rating} /> ({p.reviewCount} {t.common.reviews})
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{money(p.price)}</span>
            {p.compareAtPrice && <span className="text-slate-400 line-through">{money(p.compareAtPrice)}</span>}
          </div>
          {p.shortDescription && <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.shortDescription}</p>}
          <div className="mt-5">
            <AddToCartPanel p={p} onAdded={onClose} compact />
          </div>
          <Link href={`/products/${p.slug}`} className="link-arrow mt-5 text-xs uppercase tracking-wider" onClick={onClose}>
            {t.common.viewDetails}
          </Link>
        </div>
      </div>
    </div>
  );
}
