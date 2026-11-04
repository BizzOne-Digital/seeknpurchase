export function cn(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export const PLACEHOLDER = "/images/placeholder.svg";

/** Legacy "/uploads/..." disk paths are never served in production — fall back to a placeholder. */
export function normalizeImageUrl(url?: string | null) {
  if (!url) return PLACEHOLDER;
  if (url.startsWith("/uploads/")) return PLACEHOLDER;
  return url;
}

export function formatMoney(n: number, currency = "USD", locale = "en-US") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n || 0);
}

export function formatDate(d: string | Date, locale = "en-US") {
  return new Date(d).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function effectivePrice(p: { price: number; compareAtPrice?: number; onSale?: boolean }) {
  return p.price;
}

export function isOnSale(p: { price: number; compareAtPrice?: number }) {
  return Boolean(p.compareAtPrice && p.compareAtPrice > p.price);
}
