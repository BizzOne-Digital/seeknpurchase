"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import type { ProductCardData } from "@/lib/types";
import { useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";
import { customizationPrice, customizationSummary } from "@/lib/customization";
import { ProductCustomizer, cleanCustomization, defaultCustom, validateCustomization } from "./ProductCustomizer";
import Link from "next/link";

export function QtyStepper({ value, onChange, max = 99, min = 1, size = "md" }: { value: number; onChange: (n: number) => void; max?: number; min?: number; size?: "sm" | "md" }) {
  const { t } = useI18n();
  const h = size === "sm" ? "h-8" : "h-11";
  return (
    <div className={cn("inline-flex items-center rounded-md border border-line bg-white", h)}>
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(Math.max(min, value - 1))} className="flex h-full w-9 items-center justify-center hover:bg-cream disabled:opacity-40" disabled={value <= min}>
        <Minus className="h-3.5 w-3.5" />
      </button>
      <input
        aria-label={t.common.quantity}
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
          onChange(Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : min);
        }}
        className="h-full w-12 border-x border-line text-center text-sm font-semibold focus:outline-none"
      />
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(Math.min(max, value + 1))} className="flex h-full w-9 items-center justify-center hover:bg-cream disabled:opacity-40" disabled={value >= max}>
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AddToCartPanel({ p, onAdded, compact }: { p: ProductCardData; onAdded?: () => void; compact?: boolean }) {
  const { add, toggleWish, inWishlist, setCartOpen } = useStore();
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [customOn, setCustomOn] = useState(false);
  const [custom, setCustom] = useState(() => defaultCustom(p.customType));
  // Links from the Custom page (?custom=1) open with customization switched on.
  useEffect(() => {
    if (p.customizable && new URLSearchParams(window.location.search).get("custom") === "1") setCustomOn(true);
  }, [p.customizable]);
  const [sel, setSel] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const out = p.stock <= 0;
  const variants = p.variants || [];
  const wished = inWishlist(p.slug);

  const doAdd = () => {
    const missing = variants.find((v) => !sel[v.name]);
    if (missing) {
      setErr(`${t.product.select} ${missing.name}`);
      return false;
    }
    const baseVariant = variants.map((v) => `${v.name}: ${sel[v.name]}`).join(", ") || undefined;
    if (p.customizable && customOn) {
      const bad = validateCustomization(custom, locale === "es");
      if (bad) {
        setErr(bad);
        return false;
      }
      const c = cleanCustomization(custom);
      const variant = [baseVariant, customizationSummary(c)].filter(Boolean).join(" | ");
      setErr("");
      add({ slug: p.slug, title: p.title, image: p.image, price: p.price + (customizationPrice(c, p.customType) ?? 0), stock: p.stock, variant, baseVariant, custom: c }, qty);
      return true;
    }
    setErr("");
    add({ slug: p.slug, title: p.title, image: p.image, price: p.price, stock: p.stock, variant: baseVariant }, qty);
    return true;
  };

  return (
    <div className="space-y-4">
      {variants.map((v) => (
        <fieldset key={v.name}>
          <legend className="mb-2 text-sm font-semibold">
            {v.name}: <span className="font-normal text-slate-500">{sel[v.name] || t.product.select}</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {v.options.map((o) => (
              <button
                key={o}
                type="button"
                aria-pressed={sel[v.name] === o}
                onClick={() => setSel((s) => ({ ...s, [v.name]: o }))}
                className={cn(
                  "min-w-[44px] rounded-md border px-3 py-2 text-sm transition",
                  sel[v.name] === o ? "border-navy bg-navy text-white" : "border-line hover:border-navy",
                )}
              >
                {o}
              </button>
            ))}
          </div>
        </fieldset>
      ))}
      {p.customizable && !out && (
        <ProductCustomizer enabled={customOn} onToggle={setCustomOn} value={custom} onChange={setCustom} basePrice={p.price} image={p.image} type={p.customType} />
      )}
      {err && <p className="field-error" role="alert">{err}</p>}

      <div className="flex flex-wrap items-center gap-3">
        {!out && <QtyStepper value={qty} onChange={setQty} max={Math.min(p.stock, 99)} />}
        <button
          type="button"
          disabled={out}
          onClick={() => {
            if (doAdd()) {
              toast(`${p.title} — ${t.common.added}`);
              onAdded?.();
              setCartOpen(true);
            }
          }}
          className="btn-primary flex-1"
        >
          <ShoppingCart className="h-4 w-4" strokeWidth={1.75} /> {out ? t.common.outOfStock : t.common.addToCart}
        </button>
        {!compact && (
          <button
            type="button"
            onClick={() => toast(toggleWish(p.slug) ? t.common.addToWishlist : t.common.removeFromWishlist, "info")}
            aria-pressed={wished}
            aria-label={wished ? t.common.removeFromWishlist : t.common.addToWishlist}
            className="flex h-11 w-11 items-center justify-center rounded-md border border-line hover:border-navy"
          >
            <Heart className={cn("h-5 w-5", wished && "fill-gold text-gold")} strokeWidth={1.5} />
          </button>
        )}
      </div>
      {!out && !compact && (
        <button
          type="button"
          onClick={() => {
            if (doAdd()) router.push("/checkout");
          }}
          className="btn-outline w-full"
        >
          <Zap className="h-4 w-4" strokeWidth={1.75} /> {t.common.buyNow}
        </button>
      )}
      {!compact && p.wholesalePrice && (
        <p className="rounded-lg bg-gold-50 px-4 py-3 text-sm text-navy">
          {locale === "es" ? "¿Compras al por mayor?" : "Buying in bulk?"}{" "}
          <Link href={`/wholesale#${p.slug}`} className="font-semibold underline hover:text-gold-600">
            {locale === "es" ? "Ver precios de mayoreo" : "See wholesale pricing"}
          </Link>
        </p>
      )}
    </div>
  );
}
