"use client";

import { useEffect, useState } from "react";
import type { ProductCardData } from "@/lib/types";
import { useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { ProductCard } from "./ProductCard";

/** Records the current product as viewed and shows the other recently viewed products. */
export function RecentlyViewed({ current }: { current: string }) {
  const { recent, pushRecent, ready } = useStore();
  const { t } = useI18n();
  const [items, setItems] = useState<ProductCardData[]>([]);
  const [snapshot, setSnapshot] = useState<string[] | null>(null);

  useEffect(() => {
    if (!ready || snapshot) return;
    setSnapshot(recent.filter((s) => s !== current).slice(0, 4));
    pushRecent(current);
  }, [ready, recent, current, pushRecent, snapshot]);

  useEffect(() => {
    if (!snapshot?.length) return;
    fetch(`/api/products?slugs=${encodeURIComponent(snapshot.join(","))}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {});
  }, [snapshot]);

  if (!items.length) return null;
  return (
    <section className="container pb-16" aria-labelledby="recent-heading">
      <h2 id="recent-heading" className="mb-6 text-2xl md:text-3xl">{t.product.recentlyViewed}</h2>
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((p) => <li key={p.slug}><ProductCard p={p} /></li>)}
      </ul>
    </section>
  );
}
