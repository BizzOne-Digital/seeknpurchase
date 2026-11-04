"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Search, ShoppingCart, Trash2 } from "lucide-react";
import type { CategoryDTO, ProductCardData } from "@/lib/types";
import { useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { SmartImage } from "@/components/ui/SmartImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { DEFAULT_WHOLESALE_MIN, WHOLESALE_MAX_QTY } from "@/lib/customization";
import { cn } from "@/lib/utils";

/** quantities[slug][breakdownOption | ""] = units */
type Qty = Record<string, Record<string, number>>;

const minOf = (p: ProductCardData) => p.wholesaleMinQty || DEFAULT_WHOLESALE_MIN;

function QtyInput({ value, onChange, label, max }: { value: number; onChange: (n: number) => void; label: string; max: number }) {
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={value || ""}
      placeholder="0"
      onChange={(e) => {
        const n = parseInt(e.target.value.replace(/\D/g, ""), 10);
        onChange(Number.isFinite(n) ? Math.min(n, max) : 0);
      }}
      className="input h-11 w-20 text-center font-semibold"
    />
  );
}

export function WholesaleOrder({ products, categories }: { products: ProductCardData[]; categories: CategoryDTO[] }) {
  const { add, money, setCartOpen } = useStore();
  const { locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const es = locale === "es";
  const [qty, setQty] = useState<Qty>({});
  const [extras, setExtras] = useState<Record<string, Record<string, string>>>({}); // other variant selects
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const usedCats = categories.filter((c) => products.some((p) => p.category === c.slug));
  const list = products.filter(
    (p) => (!cat || p.category === cat) && (!q.trim() || `${p.title} ${p.sku || ""}`.toLowerCase().includes(q.trim().toLowerCase())),
  );

  const unitsFor = (slug: string) => Object.values(qty[slug] || {}).reduce((n, v) => n + v, 0);
  const setUnits = (slug: string, key: string, n: number) => {
    setQty((s) => ({ ...s, [slug]: { ...(s[slug] || {}), [key]: n } }));
    setErrors((e) => ({ ...e, [slug]: "" }));
  };

  const summary = useMemo(() => {
    let units = 0, total = 0, retail = 0, lines = 0;
    for (const p of products) {
      const u = unitsFor(p.slug);
      if (!u) continue;
      lines++;
      units += u;
      total += u * (p.wholesalePrice || 0);
      retail += u * p.price;
    }
    return { units, total: Math.round(total * 100) / 100, savings: Math.max(0, Math.round((retail - total) * 100) / 100), lines };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, products]);

  const addAll = (goCheckout: boolean) => {
    const errs: Record<string, string> = {};
    for (const p of products) {
      const u = unitsFor(p.slug);
      if (!u) continue;
      if (u < minOf(p)) errs[p.slug] = es ? `Mínimo ${minOf(p)} unidades en total` : `Minimum ${minOf(p)} units in total`;
      else if (u > p.stock) errs[p.slug] = es ? `Solo ${p.stock} disponibles` : `Only ${p.stock} available`;
      const others = (p.variants || []).slice(1);
      const missing = others.find((v) => !extras[p.slug]?.[v.name]);
      if (missing) errs[p.slug] = `${es ? "Selecciona" : "Select"} ${missing.name}`;
    }
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast(es ? "Revisa las cantidades marcadas" : "Please review the highlighted products", "error");
      document.getElementById(`ws-${Object.keys(errs)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (!summary.units) {
      toast(es ? "Ingresa una cantidad para al menos un producto" : "Enter a quantity for at least one product", "error");
      return;
    }

    for (const p of products) {
      const rows = qty[p.slug] || {};
      const breakdown = p.variants?.[0];
      const others = (p.variants || []).slice(1).map((v) => `${v.name}: ${extras[p.slug]?.[v.name]}`);
      const split = Object.entries(rows).filter(([, n]) => n > 0);
      for (const [key, n] of split) {
        const baseVariant = [breakdown && key ? `${breakdown.name}: ${key}` : "", ...others].filter(Boolean).join(", ") || undefined;
        add(
          {
            slug: p.slug, title: p.title, image: p.image, price: p.wholesalePrice!, stock: p.stock,
            variant: [baseVariant, "Wholesale"].filter(Boolean).join(" | "), baseVariant, wholesale: true,
            minQty: split.length === 1 ? minOf(p) : 1,
          },
          n,
        );
      }
    }
    setQty({});
    toast(es ? `${summary.units} unidades agregadas al carrito` : `${summary.units} units added to cart`);
    if (goCheckout) router.push("/checkout");
    else setCartOpen(true);
  };

  if (!products.length) {
    return (
      <EmptyState
        icon={Boxes}
        title={es ? "Catálogo de mayoreo próximamente" : "Wholesale catalog coming soon"}
        text={es ? "Contáctanos para una cotización de mayoreo." : "Contact us for a wholesale quote."}
        actionHref="/contact"
        actionLabel={es ? "Solicitar cotización" : "Request a quote"}
      />
    );
  }

  return (
    <div className="pb-28">
      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label htmlFor="ws-search" className="sr-only">{es ? "Buscar" : "Search"}</label>
          <input id="ws-search" className="input pl-9" placeholder={es ? "Buscar por nombre o SKU" : "Search by name or SKU"} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        {usedCats.length > 1 && (
          <select aria-label={es ? "Categoría" : "Category"} className="input sm:w-56" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">{es ? "Todas las categorías" : "All categories"}</option>
            {usedCats.map((c) => <option key={c.slug} value={c.slug}>{(es && c.nameEs) || c.name}</option>)}
          </select>
        )}
      </div>

      {/* Header row (desktop) */}
      <div className="hidden grid-cols-[1fr_120px_120px_1.3fr] gap-4 border-b border-line pb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 lg:grid">
        <span>{es ? "Producto" : "Product"}</span>
        <span>{es ? "Precio unitario" : "Unit price"}</span>
        <span>{es ? "Mínimo" : "Minimum"}</span>
        <span>{es ? "Cantidad" : "Quantity"}</span>
      </div>

      <ul className="divide-y divide-line">
        {list.map((p) => {
          const units = unitsFor(p.slug);
          const breakdown = p.variants?.[0];
          const others = (p.variants || []).slice(1);
          const out = p.stock <= 0;
          const save = p.price > 0 && p.wholesalePrice ? Math.round((1 - p.wholesalePrice / p.price) * 100) : 0;
          return (
            <li key={p.slug} id={p.slug} className="scroll-mt-28">
              <div id={`ws-${p.slug}`} className={cn("grid gap-4 py-5 lg:grid-cols-[1fr_120px_120px_1.3fr] lg:items-center", errors[p.slug] && "rounded-lg bg-red-50/60 px-3")}>
                <div className="flex items-center gap-4">
                  <Link href={`/products/${p.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-cream">
                    <SmartImage src={p.image} alt={p.title} fill sizes="80px" className="object-cover" />
                  </Link>
                  <div className="min-w-0">
                    <Link href={`/products/${p.slug}`} className="font-semibold hover:text-gold-600">{p.title}</Link>
                    {p.sku && <p className="text-xs text-slate-500">SKU {p.sku}</p>}
                    <p className={cn("text-xs", out ? "text-red-600" : "text-emerald-700")}>
                      {out ? (es ? "Agotado" : "Out of stock") : `${p.stock} ${es ? "disponibles" : "available"}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-baseline gap-2 lg:block">
                  <span className="text-lg font-bold">{money(p.wholesalePrice!)}</span>
                  <span className="text-sm text-slate-400 line-through lg:block">{money(p.price)}</span>
                  {save > 0 && <span className="badge bg-emerald-50 text-emerald-700 lg:mt-1">-{save}%</span>}
                </div>

                <p className="text-sm text-slate-600">
                  <span className="lg:hidden">{es ? "Mínimo: " : "Minimum: "}</span>
                  {minOf(p)} {es ? "unidades" : "units"}
                </p>

                <div className="space-y-3">
                  {out ? (
                    <Link href="/contact" className="btn-outline btn-sm">{es ? "Solicitar reabastecimiento" : "Request restock"}</Link>
                  ) : (
                    <>
                      {others.map((v) => (
                        <select
                          key={v.name}
                          aria-label={v.name}
                          className="input"
                          value={extras[p.slug]?.[v.name] || ""}
                          onChange={(e) => setExtras((s) => ({ ...s, [p.slug]: { ...(s[p.slug] || {}), [v.name]: e.target.value } }))}
                        >
                          <option value="">{v.name}…</option>
                          {v.options.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      ))}
                      {breakdown ? (
                        <div>
                          <p className="mb-1.5 text-xs font-semibold text-slate-500">{breakdown.name}</p>
                          <div className="flex flex-wrap gap-2">
                            {breakdown.options.map((o) => (
                              <label key={o} className="flex flex-col items-center gap-1 text-xs font-medium">
                                {o}
                                <QtyInput label={`${p.title} ${breakdown.name} ${o}`} value={qty[p.slug]?.[o] || 0} onChange={(n) => setUnits(p.slug, o, n)} max={Math.min(p.stock, WHOLESALE_MAX_QTY)} />
                              </label>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <QtyInput label={`${p.title} ${es ? "cantidad" : "quantity"}`} value={qty[p.slug]?.[""] || 0} onChange={(n) => setUnits(p.slug, "", n)} max={Math.min(p.stock, WHOLESALE_MAX_QTY)} />
                      )}
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className={cn(units && units < minOf(p) ? "text-amber-700" : "text-slate-500")}>
                          {units} / {minOf(p)} {es ? "mín." : "min"}
                        </span>
                        {units > 0 && (
                          <span className="flex items-center gap-2 font-semibold">
                            {money(units * p.wholesalePrice!)}
                            <button type="button" onClick={() => setQty((s) => ({ ...s, [p.slug]: {} }))} aria-label={`${es ? "Borrar" : "Clear"} ${p.title}`} className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </span>
                        )}
                      </div>
                      {errors[p.slug] && <p className="field-error" role="alert">{errors[p.slug]}</p>}
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {!list.length && <p className="py-10 text-center text-sm text-slate-500">{es ? "No se encontraron productos." : "No products match your search."}</p>}

      {/* Sticky order bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 shadow-lift backdrop-blur">
        <div className="container flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-baseline gap-4 text-sm">
            <span><strong className="text-base">{summary.units}</strong> {es ? "unidades" : "units"} · {summary.lines} {es ? "productos" : "products"}</span>
            <span className="text-lg font-bold">{money(summary.total)}</span>
            {summary.savings > 0 && <span className="hidden text-emerald-700 sm:inline">{es ? "Ahorras" : "You save"} {money(summary.savings)}</span>}
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <button type="button" onClick={() => addAll(false)} disabled={!summary.units} className="btn-outline btn-sm disabled:opacity-50">
              <ShoppingCart className="h-4 w-4" /> {es ? "Agregar al carrito" : "Add to cart"}
            </button>
            <button type="button" onClick={() => addAll(true)} disabled={!summary.units} className="btn-primary btn-sm disabled:opacity-50">
              {es ? "Pagar pedido" : "Checkout"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
