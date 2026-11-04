"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { CartItem } from "@/lib/types";
import { formatMoney } from "@/lib/utils";
import { RETAIL_MAX_QTY, WHOLESALE_MAX_QTY } from "@/lib/customization";

/** Highest quantity allowed for a cart line (stock-limited; wholesale lines allow bulk). */
export const lineMax = (i: Pick<CartItem, "stock" | "wholesale">) => Math.max(1, Math.min(i.stock || 1, i.wholesale ? WHOLESALE_MAX_QTY : RETAIL_MAX_QTY));
export const lineMin = (i: Pick<CartItem, "minQty">) => Math.max(1, i.minQty || 1);
const clampQty = (i: CartItem, n: number) => Math.max(lineMin(i), Math.min(n, lineMax(i)));

/** The payload the server prices. Prices are never sent; the server recalculates them. */
export const toCartLine = (i: CartItem) => ({
  slug: i.slug,
  quantity: i.quantity,
  variant: i.baseVariant ?? i.variant,
  ...(i.wholesale ? { wholesale: true } : {}),
  ...(i.custom ? { custom: i.custom } : {}),
});

const CART_KEY = "sp_cart_v1";
const WISH_KEY = "sp_wishlist_v1";
const RECENT_KEY = "sp_recent_v1";

type StoreCtx = {
  ready: boolean;
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  update: (slug: string, variant: string | undefined, qty: number) => void;
  remove: (slug: string, variant?: string) => void;
  clear: () => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  wishlist: string[];
  toggleWish: (slug: string) => boolean;
  inWishlist: (slug: string) => boolean;
  recent: string[];
  pushRecent: (slug: string) => void;
  currency: string;
  money: (n: number) => string;
};

const Ctx = createContext<StoreCtx | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, v: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(v));
  } catch {}
}

const same = (a: CartItem, slug: string, variant?: string) => a.slug === slug && (a.variant || "") === (variant || "");

export function StoreProvider({ loggedIn, currency = "USD", children }: { loggedIn: boolean; currency?: string; children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const synced = useRef(false);

  useEffect(() => {
    setItems(read(CART_KEY, []));
    setWishlist(read(WISH_KEY, []));
    setRecent(read(RECENT_KEY, []));
    setReady(true);
  }, []);

  // Merge the local wishlist with the account wishlist once when signed in.
  useEffect(() => {
    if (!ready || !loggedIn || synced.current) return;
    synced.current = true;
    fetch("/api/account/wishlist", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ merge: read<string[]>(WISH_KEY, []) }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d?.wishlist && setWishlist(d.wishlist))
      .catch(() => {});
  }, [ready, loggedIn]);

  useEffect(() => { if (ready) write(CART_KEY, items); }, [items, ready]);
  useEffect(() => { if (ready) write(WISH_KEY, wishlist); }, [wishlist, ready]);
  useEffect(() => { if (ready) write(RECENT_KEY, recent); }, [recent, ready]);

  const add = useCallback((item: Omit<CartItem, "quantity">, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((p) => same(p, item.slug, item.variant));
      if (existing) {
        return prev.map((p) => (same(p, item.slug, item.variant) ? { ...p, quantity: clampQty(p, p.quantity + qty) } : p));
      }
      const next = { ...item, quantity: qty } as CartItem;
      return [...prev, { ...next, quantity: clampQty(next, qty) }];
    });
  }, []);

  const update = useCallback((slug: string, variant: string | undefined, qty: number) => {
    setItems((prev) => prev.map((p) => (same(p, slug, variant) ? { ...p, quantity: clampQty(p, qty) } : p)));
  }, []);

  const remove = useCallback((slug: string, variant?: string) => setItems((prev) => prev.filter((p) => !same(p, slug, variant))), []);
  const clear = useCallback(() => setItems([]), []);

  const toggleWish = useCallback(
    (slug: string) => {
      const adding = !wishlist.includes(slug);
      const next = adding ? [...wishlist, slug] : wishlist.filter((s) => s !== slug);
      setWishlist(next);
      if (loggedIn) {
        fetch("/api/account/wishlist", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ wishlist: next }) }).catch(() => {});
      }
      return adding;
    },
    [wishlist, loggedIn],
  );

  const pushRecent = useCallback((slug: string) => setRecent((r) => [slug, ...r.filter((s) => s !== slug)].slice(0, 8)), []);

  const value = useMemo<StoreCtx>(
    () => ({
      ready, items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotal: Math.round(items.reduce((n, i) => n + i.price * i.quantity, 0) * 100) / 100,
      add, update, remove, clear, cartOpen, setCartOpen,
      wishlist, toggleWish, inWishlist: (s: string) => wishlist.includes(s),
      recent, pushRecent,
      currency, money: (n: number) => formatMoney(n, currency),
    }),
    [ready, items, add, update, remove, clear, cartOpen, wishlist, toggleWish, recent, pushRecent, currency],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used within StoreProvider");
  return c;
}
