"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import type { ProductCardData } from "@/lib/types";
import { useStore } from "@/components/providers/StoreProvider";
import { useI18n } from "@/components/providers/I18nProvider";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

export function WishlistGrid({ columns = 4 }: { columns?: 3 | 4 }) {
  const { wishlist, ready } = useStore();
  const { t } = useI18n();
  const [items, setItems] = useState<ProductCardData[] | null>(null);
  const key = wishlist.join(",");

  useEffect(() => {
    if (!ready) return;
    if (!key) return setItems([]);
    fetch(`/api/products?slugs=${encodeURIComponent(key)}`)
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => setItems([]));
  }, [ready, key]);

  if (!ready || items === null) {
    return <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="skeleton aspect-[3/4]" />)}</div>;
  }
  const visible = items.filter((i) => wishlist.includes(i.slug));
  if (!visible.length) {
    return <EmptyState icon={Heart} title={t.account.wishlistEmpty} text={t.account.wishlistEmptyText} actionHref="/shop" actionLabel={t.common.shopNow} />;
  }
  return (
    <ul className={`grid grid-cols-2 gap-4 md:grid-cols-3 ${columns === 4 ? "lg:grid-cols-4" : ""}`}>
      {visible.map((p) => <li key={p.slug}><ProductCard p={p} /></li>)}
    </ul>
  );
}
