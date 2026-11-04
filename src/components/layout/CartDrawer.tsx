"use client";

import Link from "next/link";
import { useEffect } from "react";
import { ShoppingBag, Trash2, X } from "lucide-react";
import { lineMax, lineMin, useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { SmartImage } from "@/components/ui/SmartImage";
import { QtyStepper } from "@/components/product/AddToCartPanel";

export function CartDrawer({ freeShippingThreshold }: { freeShippingThreshold: number }) {
  const { cartOpen, setCartOpen, items, subtotal, update, remove, money } = useStore();
  const { t } = useI18n();

  useEffect(() => {
    if (!cartOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [cartOpen, setCartOpen]);

  if (!cartOpen) return null;
  const remaining = freeShippingThreshold - subtotal;

  return (
    <div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label={t.cart.title}>
      <div className="absolute inset-0 animate-fade-in bg-navy/50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md animate-slide-in-right flex-col bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-xl">{t.cart.title}</h2>
          <button onClick={() => setCartOpen(false)} aria-label={t.common.close} className="rounded-full p-2 hover:bg-cream">
            <X className="h-5 w-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <ShoppingBag className="mb-4 h-10 w-10 text-gold" strokeWidth={1.3} />
            <p className="font-serif text-xl">{t.cart.empty}</p>
            <p className="mt-1 text-sm text-slate-500">{t.cart.emptyText}</p>
            <Link href="/shop" onClick={() => setCartOpen(false)} className="btn-primary mt-6">{t.common.shopNow}</Link>
          </div>
        ) : (
          <>
            {freeShippingThreshold > 0 && (
              <div className="border-b border-line bg-cream px-5 py-3 text-xs">
                {remaining > 0 ? t.cart.freeShippingNote.replace("{amount}", money(remaining)) : `${t.cart.shipping}: ${t.cart.free}`}
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-cream-300">
                  <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }} />
                </div>
              </div>
            )}
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.slug + (i.variant || "")} className="flex gap-4 py-4">
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-cream">
                    <SmartImage src={i.image} alt={i.title} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between gap-2">
                      <Link href={`/products/${i.slug}`} onClick={() => setCartOpen(false)} className="text-sm font-semibold hover:text-gold-600">{i.title}</Link>
                      <button onClick={() => remove(i.slug, i.variant)} aria-label={`${t.cart.remove} ${i.title}`} className="text-slate-400 hover:text-red-600">
                        <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                      </button>
                    </div>
                    {i.variant && <p className="break-words text-xs text-slate-500">{i.variant}</p>}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QtyStepper size="sm" value={i.quantity} min={lineMin(i)} max={lineMax(i)} onChange={(n) => update(i.slug, i.variant, n)} />
                      <span className="text-sm font-semibold">{money(i.price * i.quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-line p-5">
              <div className="flex justify-between text-base font-semibold">
                <span>{t.cart.subtotal}</span>
                <span>{money(subtotal)}</span>
              </div>
              <p className="text-xs text-slate-500">{t.cart.shipping}: {t.cart.calculated}</p>
              <Link href="/checkout" onClick={() => setCartOpen(false)} className="btn-primary w-full">{t.cart.checkout}</Link>
              <Link href="/cart" onClick={() => setCartOpen(false)} className="btn-outline w-full">{t.cart.title}</Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
