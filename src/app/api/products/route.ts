import { handle, ok } from "@/lib/api";
import { getProductsBySlugs, queryProducts, toCard } from "@/lib/data";
import { getLocale } from "@/lib/i18n/server";

export const runtime = "nodejs";

/** Public product lookup: ?slugs=a,b,c  or  ?q=search */
export const GET = handle(async (req: Request) => {
  const url = new URL(req.url);
  const locale = await getLocale();
  const slugs = (url.searchParams.get("slugs") || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 24);
  if (slugs.length) {
    const items = await getProductsBySlugs(slugs);
    return ok({ items: items.map((p) => toCard(p, locale)) });
  }
  const q = (url.searchParams.get("q") || "").slice(0, 80);
  const { items } = await queryProducts({ q, perPage: 8 });
  return ok({ items: items.map((p) => toCard(p, locale)) });
});
