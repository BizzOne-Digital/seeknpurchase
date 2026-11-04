"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

type Cat = { slug: string; name: string };

export function ShopFilters({ categories }: { categories: Cat[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState({
    q: sp.get("q") || "",
    category: sp.get("category") || "",
    min: sp.get("min") || "",
    max: sp.get("max") || "",
    inStock: sp.get("inStock") === "1",
    sale: sp.get("sale") === "1",
  });

  useEffect(() => {
    setState({
      q: sp.get("q") || "", category: sp.get("category") || "", min: sp.get("min") || "", max: sp.get("max") || "",
      inStock: sp.get("inStock") === "1", sale: sp.get("sale") === "1",
    });
  }, [sp]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  const apply = (next = state) => {
    const p = new URLSearchParams();
    if (next.q) p.set("q", next.q);
    if (next.category) p.set("category", next.category);
    if (next.min) p.set("min", next.min);
    if (next.max) p.set("max", next.max);
    if (next.inStock) p.set("inStock", "1");
    if (next.sale) p.set("sale", "1");
    const sort = sp.get("sort");
    if (sort) p.set("sort", sort);
    const flag = sp.get("flag");
    if (flag) p.set("flag", flag);
    router.push(`/shop${p.toString() ? `?${p}` : ""}`);
    setOpen(false);
  };

  const clear = () => {
    router.push("/shop");
    setOpen(false);
  };

  const panel = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
      className="space-y-7"
    >
      <div>
        <label htmlFor="f-q" className="label">{t.nav.search}</label>
        <input id="f-q" className="input" value={state.q} placeholder={t.common.searchPlaceholder} onChange={(e) => setState({ ...state, q: e.target.value })} />
      </div>
      <fieldset>
        <legend className="label">{t.shop.category}</legend>
        <ul className="space-y-1">
          {[{ slug: "", name: t.shop.allCategories }, ...categories].map((c) => (
            <li key={c.slug || "all"}>
              <button
                type="button"
                onClick={() => {
                  const next = { ...state, category: c.slug };
                  setState(next);
                  apply(next);
                }}
                aria-pressed={state.category === c.slug}
                className={cn("w-full rounded-md px-3 py-2 text-left text-sm transition", state.category === c.slug ? "bg-navy text-white" : "hover:bg-cream")}
              >
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      </fieldset>
      <fieldset>
        <legend className="label">{t.shop.price}</legend>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="f-min">{t.shop.min}</label>
          <input id="f-min" inputMode="decimal" className="input" placeholder={`$ ${t.shop.min}`} value={state.min} onChange={(e) => setState({ ...state, min: e.target.value.replace(/[^\d.]/g, "") })} />
          <span className="text-slate-400">–</span>
          <label className="sr-only" htmlFor="f-max">{t.shop.max}</label>
          <input id="f-max" inputMode="decimal" className="input" placeholder={`$ ${t.shop.max}`} value={state.max} onChange={(e) => setState({ ...state, max: e.target.value.replace(/[^\d.]/g, "") })} />
        </div>
      </fieldset>
      <fieldset className="space-y-2.5">
        <legend className="label">{t.shop.availability}</legend>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-navy" checked={state.inStock} onChange={(e) => setState({ ...state, inStock: e.target.checked })} />
          {t.shop.inStockOnly}
        </label>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-navy" checked={state.sale} onChange={(e) => setState({ ...state, sale: e.target.checked })} />
          {t.shop.onSaleOnly}
        </label>
      </fieldset>
      <div className="flex gap-2">
        <button type="submit" className="btn-primary flex-1">{t.shop.apply}</button>
        <button type="button" onClick={clear} className="btn-ghost">{t.shop.clear}</button>
      </div>
    </form>
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-outline btn-sm lg:hidden">
        <SlidersHorizontal className="h-4 w-4" /> {t.shop.filters}
      </button>
      <aside className="hidden lg:block" aria-label={t.shop.filters}>{panel}</aside>
      {open && (
        <div className="fixed inset-0 z-[85] lg:hidden" role="dialog" aria-modal="true" aria-label={t.shop.filters}>
          <div className="absolute inset-0 animate-fade-in bg-navy/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-[88%] max-w-sm animate-slide-in overflow-y-auto bg-white p-5 shadow-lift">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl">{t.shop.filters}</h2>
              <button onClick={() => setOpen(false)} aria-label={t.common.close} className="rounded-full p-2 hover:bg-cream"><X className="h-5 w-5" /></button>
            </div>
            {panel}
          </div>
        </div>
      )}
    </>
  );
}

export function SortSelect() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const opts = [
    ["featured", t.shop.featured], ["newest", t.shop.newest], ["price-asc", t.shop.priceLow], ["price-desc", t.shop.priceHigh], ["best-selling", t.shop.bestSelling],
  ];
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="hidden text-sm text-slate-500 sm:block">{t.shop.sortBy}</label>
      <select
        id="sort"
        className="input w-auto py-2 pr-8"
        value={sp.get("sort") || "featured"}
        onChange={(e) => {
          const p = new URLSearchParams(sp.toString());
          p.set("sort", e.target.value);
          p.delete("page");
          router.push(`/shop?${p}`);
        }}
      >
        {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}
