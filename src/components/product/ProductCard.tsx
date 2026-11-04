"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye, Heart, ShoppingCart } from "lucide-react";
import type { ProductCardData } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Stars } from "@/components/ui/Stars";
import { useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";
import { QuickView } from "./QuickView";

export function ProductCard({ p, priority }: { p: ProductCardData; priority?: boolean }) {
  const { add, toggleWish, inWishlist, money, setCartOpen } = useStore();
  const { t } = useI18n();
  const { toast } = useToast();
  const [quick, setQuick] = useState(false);
  const wished = inWishlist(p.slug);
  const out = p.stock <= 0;
  const needsVariant = Boolean(p.variants?.length);

  const onAdd = () => {
    if (needsVariant) return setQuick(true);
    add({ slug: p.slug, title: p.title, image: p.image, price: p.price, stock: p.stock });
    toast(`${p.title} — ${t.common.added}`);
    setCartOpen(true);
  };

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white p-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3.4] overflow-hidden rounded-lg bg-cream-100">
        <Link href={`/products/${p.slug}`} aria-label={p.title}>
          <SmartImage
            src={p.image}
            alt={p.title}
            fill
            priority={priority}
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {p.compareAtPrice && <span className="badge bg-[#8a2d1f] text-white">{t.common.sale}</span>}
          {p.isNew && <span className="badge bg-gold-50 text-gold-700 ring-1 ring-gold/30">{t.common.new}</span>}
        </div>
        <button
          type="button"
          onClick={() => toast(toggleWish(p.slug) ? t.common.addToWishlist : t.common.removeFromWishlist, "info")}
          aria-pressed={wished}
          aria-label={wished ? t.common.removeFromWishlist : t.common.addToWishlist}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-navy shadow-soft transition hover:scale-110"
        >
          <Heart className={cn("h-4 w-4", wished && "fill-gold text-gold")} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => setQuick(true)}
          className="absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center gap-1.5 rounded-md bg-white/95 py-2 text-xs font-semibold text-navy opacity-0 shadow-soft transition-all group-hover:translate-y-0 group-hover:opacity-100 md:flex focus:translate-y-0 focus:opacity-100"
        >
          <Eye className="h-3.5 w-3.5" /> {t.common.quickView}
        </button>
        {out && (
          <span className="absolute inset-x-0 bottom-0 bg-navy/80 py-1 text-center text-[11px] font-semibold uppercase tracking-wider text-white">
            {t.common.outOfStock}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-3">
        <h3 className="font-sans text-sm font-semibold leading-snug text-navy">
          <Link href={`/products/${p.slug}`} className="hover:text-gold-600">{p.title}</Link>
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
          <Stars rating={p.rating} size={13} /> <span>({p.reviewCount})</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-base font-bold text-navy">{money(p.price)}</span>
          {p.compareAtPrice && <span className="text-xs text-slate-400 line-through">{money(p.compareAtPrice)}</span>}
        </div>
        {!out && p.stock <= p.lowStockThreshold && <p className="mt-1 text-[11px] font-medium text-amber-700">{t.common.lowStock}</p>}
        <div className="mt-auto pt-3">
          <button type="button" disabled={out} onClick={onAdd} className="btn-gold btn-sm w-full">
            <ShoppingCart className="h-4 w-4" strokeWidth={1.75} />
            {out ? t.common.outOfStock : t.common.addToCart}
          </button>
        </div>
      </div>

      {quick && <QuickView p={p} onClose={() => setQuick(false)} />}
    </article>
  );
}
