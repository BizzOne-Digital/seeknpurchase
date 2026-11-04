"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2, Lock, ShoppingBag } from "lucide-react";
import { toCartLine, useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { SmartImage } from "@/components/ui/SmartImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { COUPON_KEY } from "@/components/cart/CartView";
import { cn } from "@/lib/utils";

type Prefill = { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string; apartment?: string; city?: string; state?: string; zip?: string; country?: string };
type Store = { standardShipping: number; expressShipping: number; freeShippingThreshold: number; taxRate: number };

export function CheckoutForm({ prefill, store, stripeEnabled }: { prefill: Prefill; store: Store; stripeEnabled: boolean }) {
  const { items, ready, subtotal, money, clear } = useStore();
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [f, setF] = useState({
    firstName: "", lastName: "", email: "", phone: "", address: "", apartment: "", city: "", state: "", zip: "", country: "United States",
    ...Object.fromEntries(Object.entries(prefill).filter(([, v]) => v)),
  });
  const [method, setMethod] = useState<"standard" | "express">("standard");
  const [coupon, setCoupon] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      setCoupon(sessionStorage.getItem(COUPON_KEY) || "");
    } catch {}
  }, []);

  if (!ready) return <div className="skeleton h-96" />;
  if (!items.length) return <EmptyState icon={ShoppingBag} title={t.cart.empty} text={t.cart.emptyText} actionHref="/shop" actionLabel={t.common.shopNow} />;

  const free = store.freeShippingThreshold > 0 && subtotal >= store.freeShippingThreshold;
  const shipping = method === "express" ? store.expressShipping : free ? 0 : store.standardShipping;
  const tax = Math.round(subtotal * store.taxRate) / 100;

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const validate = () => {
    const e: Record<string, string> = {};
    (["firstName", "lastName", "email", "address", "city", "state", "zip", "country"] as const).forEach((k) => {
      if (!String(f[k] || "").trim()) e[k] = t.common.required;
    });
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = t.errors.invalidEmail;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast(t.common.required, "error");
      return;
    }
    setLoading(true);
    try {
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { firstName: f.firstName, lastName: f.lastName, email: f.email, phone: f.phone },
          shippingAddress: { address: f.address, apartment: f.apartment, city: f.city, state: f.state, zip: f.zip, country: f.country },
          shippingMethod: method,
          couponCode: coupon || undefined,
          items: items.map(toCartLine),
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      sessionStorage.removeItem(COUPON_KEY);
      if (d.url) {
        window.location.href = d.url; // Stripe-hosted checkout
        return;
      }
      clear();
      router.push(`/checkout/success?order=${encodeURIComponent(d.orderNumber)}&token=${encodeURIComponent(d.token)}`);
    } catch (err) {
      toast((err as Error).message || t.common.somethingWrong, "error");
      setLoading(false);
    }
  };

  const field = (k: keyof typeof f, label: string, opts: { type?: string; auto?: string; span?: boolean; optional?: boolean } = {}) => (
    <div className={cn(opts.span && "sm:col-span-2")}>
      <label htmlFor={`co-${k}`} className="label">{label}{!opts.optional && <span className="text-red-600"> *</span>}</label>
      <input
        id={`co-${k}`}
        type={opts.type || "text"}
        autoComplete={opts.auto}
        value={f[k] as string}
        onChange={set(k)}
        aria-invalid={Boolean(errors[k])}
        aria-describedby={errors[k] ? `co-${k}-err` : undefined}
        className={cn("input", errors[k] && "border-red-400")}
      />
      {errors[k] && <p id={`co-${k}-err`} className="field-error">{errors[k]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="grid gap-10 lg:grid-cols-[1fr_400px]">
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-sans text-xs text-white">1</span>{t.checkout.contact}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("firstName", t.checkout.firstName, { auto: "given-name" })}
            {field("lastName", t.checkout.lastName, { auto: "family-name" })}
            {field("email", t.common.email, { type: "email", auto: "email" })}
            {field("phone", t.common.phone, { type: "tel", auto: "tel", optional: true })}
          </div>
        </section>
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-sans text-xs text-white">2</span>{t.checkout.shippingAddress}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("address", t.checkout.address, { auto: "address-line1", span: true })}
            {field("apartment", t.checkout.apartment, { auto: "address-line2", span: true, optional: true })}
            {field("city", t.checkout.city, { auto: "address-level2" })}
            {field("state", t.checkout.state, { auto: "address-level1" })}
            {field("zip", t.checkout.zip, { auto: "postal-code" })}
            <div>
              <label htmlFor="co-country" className="label">{t.checkout.country} <span className="text-red-600">*</span></label>
              <select id="co-country" className="input" value={f.country} onChange={set("country")} autoComplete="country-name">
                {["United States", "Canada", "Mexico", "Puerto Rico"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-sans text-xs text-white">3</span>{t.checkout.shippingMethod}</h2>
          <fieldset className="space-y-3">
            <legend className="sr-only">{t.checkout.shippingMethod}</legend>
            {([
              ["standard", t.checkout.standard, free ? 0 : store.standardShipping],
              ["express", t.checkout.express, store.expressShipping],
            ] as const).map(([v, label, price]) => (
              <label key={v} className={cn("flex cursor-pointer items-center justify-between rounded-lg border p-4 transition", method === v ? "border-navy bg-cream" : "border-line hover:border-navy/40")}>
                <span className="flex items-center gap-3 text-sm">
                  <input type="radio" name="ship" value={v} checked={method === v} onChange={() => setMethod(v)} className="h-4 w-4 accent-navy" />
                  {label}
                </span>
                <span className="text-sm font-semibold">{price === 0 ? t.cart.free : money(price)}</span>
              </label>
            ))}
          </fieldset>
        </section>
        <section>
          <h2 className="mb-4 flex items-center gap-3 text-xl"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy font-sans text-xs text-white">4</span>{t.checkout.payment}</h2>
          <div className="flex items-start gap-3 rounded-lg border border-line bg-cream p-4 text-sm text-slate-600">
            {stripeEnabled ? <Lock className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> : <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-gold" />}
            <p>{stripeEnabled ? t.checkout.securePayment : t.checkout.manualPayment}</p>
          </div>
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-line bg-cream p-6 lg:sticky lg:top-24">
        <h2 className="text-xl">{t.cart.summary}</h2>
        <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto pr-1">
          {items.map((i) => (
            <li key={i.slug + (i.variant || "")} className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-white">
                <SmartImage src={i.image} alt={i.title} fill sizes="56px" className="object-cover" />
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-navy text-[10px] font-bold text-white">{i.quantity}</span>
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{i.title}</p>
                {i.variant && <p className="break-words text-xs text-slate-500">{i.variant}</p>}
              </div>
              <span className="text-sm font-semibold">{money(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2.5 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt>{t.cart.subtotal}</dt><dd>{money(subtotal)}</dd></div>
          {coupon && <div className="flex justify-between text-emerald-700"><dt>{t.cart.discount} ({coupon})</dt><dd>{t.cart.calculated}</dd></div>}
          <div className="flex justify-between"><dt>{t.cart.shipping}</dt><dd>{shipping === 0 ? t.cart.free : money(shipping)}</dd></div>
          {store.taxRate > 0 && <div className="flex justify-between"><dt>{t.cart.tax}</dt><dd>{money(tax)}</dd></div>}
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>{t.cart.orderTotal}</dt><dd>{money(subtotal + shipping + tax)}</dd></div>
        </dl>
        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full py-3.5">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> {t.checkout.processing}</> : <><Lock className="h-4 w-4" /> {stripeEnabled ? t.checkout.placeOrder : t.checkout.placeManual}</>}
        </button>
      </aside>
    </form>
  );
}
