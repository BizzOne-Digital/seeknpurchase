"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, ShoppingBag, Tag, Trash2 } from "lucide-react";
import { lineMax, lineMin, toCartLine, useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { SmartImage } from "@/components/ui/SmartImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { QtyStepper } from "@/components/product/AddToCartPanel";

export const COUPON_KEY = "sp_coupon";

export function CartView({ shippingFlat, freeThreshold, taxRate }: { shippingFlat: number; freeThreshold: number; taxRate: number }) {
  const { items, ready, subtotal, update, remove, money } = useStore();
  const { t } = useI18n();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    try {
      setCode(sessionStorage.getItem(COUPON_KEY) || "");
    } catch {}
  }, []);

  if (!ready) {
    return <div className="grid gap-4">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-24" />)}</div>;
  }
  if (!items.length) {
    return <EmptyState icon={ShoppingBag} title={t.cart.empty} text={t.cart.emptyText} actionHref="/shop" actionLabel={t.common.shopNow} />;
  }

  const applyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setChecking(true);
    try {
      const r = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, items: items.map(toCartLine) }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setDiscount(d.discount);
      sessionStorage.setItem(COUPON_KEY, code.trim().toUpperCase());
      toast(t.cart.couponApplied);
    } catch (err) {
      setDiscount(0);
      sessionStorage.removeItem(COUPON_KEY);
      toast((err as Error).message || t.common.somethingWrong, "error");
    } finally {
      setChecking(false);
    }
  };

  const after = Math.max(0, subtotal - discount);
  const shipping = freeThreshold > 0 && after >= freeThreshold ? 0 : shippingFlat;
  const tax = Math.round(after * taxRate) / 100;
  const total = after + shipping + tax;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
      <div>
        <div className="hidden grid-cols-[1fr_140px_100px_40px] gap-4 border-b border-line pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 md:grid">
          <span>{t.cart.product}</span><span>{t.common.quantity}</span><span className="text-right">{t.cart.total}</span><span />
        </div>
        <ul className="divide-y divide-line">
          {items.map((i) => (
            <li key={i.slug + (i.variant || "")} className="grid gap-4 py-5 md:grid-cols-[1fr_140px_100px_40px] md:items-center">
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                  <SmartImage src={i.image} alt={i.title} fill sizes="80px" className="object-cover" />
                </div>
                <div>
                  <Link href={`/products/${i.slug}`} className="font-semibold hover:text-gold-600">{i.title}</Link>
                  {i.variant && <p className="break-words text-xs text-slate-500">{i.variant}</p>}
                  <p className="text-sm text-slate-500">{money(i.price)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 md:contents">
                <QtyStepper size="sm" value={i.quantity} min={lineMin(i)} max={lineMax(i)} onChange={(n) => update(i.slug, i.variant, n)} />
                <span className="font-semibold md:text-right">{money(i.price * i.quantity)}</span>
                <button onClick={() => remove(i.slug, i.variant)} aria-label={`${t.cart.remove} ${i.title}`} className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" strokeWidth={1.6} />
                </button>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/shop" className="link-arrow mt-6"><ArrowLeft className="h-4 w-4" /> {t.cart.continue}</Link>
      </div>

      <aside className="h-fit rounded-xl border border-line bg-cream p-6 lg:sticky lg:top-24">
        <h2 className="text-xl">{t.cart.summary}</h2>
        <form onSubmit={applyCoupon} className="mt-5 flex gap-2">
          <label htmlFor="coupon" className="sr-only">{t.cart.coupon}</label>
          <div className="relative flex-1">
            <Tag className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input id="coupon" className="input pl-9 uppercase" placeholder={t.cart.coupon} value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <button className="btn-outline btn-sm" disabled={checking}>{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : t.cart.apply}</button>
        </form>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><dt>{t.cart.subtotal}</dt><dd>{money(subtotal)}</dd></div>
          {discount > 0 && <div className="flex justify-between text-emerald-700"><dt>{t.cart.discount}</dt><dd>-{money(discount)}</dd></div>}
          <div className="flex justify-between"><dt>{t.cart.shipping}</dt><dd>{shipping === 0 ? t.cart.free : money(shipping)}</dd></div>
          {taxRate > 0 && <div className="flex justify-between"><dt>{t.cart.tax}</dt><dd>{money(tax)}</dd></div>}
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>{t.cart.orderTotal}</dt><dd>{money(total)}</dd></div>
        </dl>
        <Link href="/checkout" className="btn-primary mt-6 w-full">{t.cart.checkout}</Link>
        <Link href="/shop" className="btn-ghost mt-2 w-full">{t.cart.continue}</Link>
      </aside>
    </div>
  );
}
