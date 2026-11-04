import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { getCategories, queryProducts, toCard, type ProductQuery } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { ProductCard } from "@/components/product/ProductCard";
import { ShopFilters, SortSelect } from "./ShopFilters";
import { PageHero } from "@/components/ui/SectionHeading";
import { EmptyState } from "@/components/ui/EmptyState";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export type ShopSearchParams = Record<string, string | string[] | undefined>;
const SORTS = ["featured", "newest", "price-asc", "price-desc", "best-selling"] as const;

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}
function num(v: string | string[] | undefined) {
  const n = parseFloat(str(v) || "");
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export async function ShopPage({ searchParams }: { searchParams: ShopSearchParams }) {
  const { locale, t } = await getDictionary();
  const sort = str(searchParams.sort) as ProductQuery["sort"];
  const flag = str(searchParams.flag);
  const q: ProductQuery = {
    q: str(searchParams.q)?.slice(0, 80),
    category: str(searchParams.category),
    min: num(searchParams.min),
    max: num(searchParams.max),
    inStock: str(searchParams.inStock) === "1",
    sale: str(searchParams.sale) === "1",
    sort: SORTS.includes(sort as (typeof SORTS)[number]) ? sort : "featured",
    flag: flag === "new" || flag === "best" ? flag : undefined,
    page: Math.max(1, parseInt(str(searchParams.page) || "1", 10) || 1),
    perPage: 12,
  };
  const [{ items, total, page, pages }, categories] = await Promise.all([queryProducts(q), getCategories()]);
  const cats = categories.map((c) => ({ slug: c.slug, name: (locale === "es" && c.nameEs) || c.name }));
  const activeCat = categories.find((c) => c.slug === q.category);
  const title = q.q
    ? `“${q.q}”`
    : activeCat
      ? (locale === "es" && activeCat.nameEs) || activeCat.name
      : q.sale ? t.nav.sale : q.flag === "new" ? t.nav.newArrivals : q.flag === "best" ? t.nav.bestSellers : t.shop.title;

  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      const s = str(v);
      if (s && k !== "page") p.set(k, s);
    });
    if (n > 1) p.set("page", String(n));
    return `/shop${p.toString() ? `?${p}` : ""}`;
  };

  return (
    <>
      <PageHero title={title} subtitle={activeCat?.description || t.shop.subtitle} eyebrow={t.nav.shop} />

      {str(searchParams.view) === "collections" && (
        <section className="container pt-10" aria-label={t.nav.collections}>
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/shop?category=${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden rounded-xl">
                  <SmartImage src={c.image} alt={c.name} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
                  <span className="absolute bottom-3 left-4 font-serif text-lg text-white">{(locale === "es" && c.nameEs) || c.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="container grid gap-8 py-10 lg:grid-cols-[250px_1fr]">
        <Suspense fallback={<div className="skeleton hidden h-96 lg:block" />}>
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ShopFilters categories={cats} />
          </div>
        </Suspense>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <p className="text-sm text-slate-500" aria-live="polite">
              {t.shop.showing} {items.length} {t.shop.of} {total} {t.shop.products}
            </p>
            <Suspense fallback={null}><SortSelect /></Suspense>
          </div>

          {items.length === 0 ? (
            <EmptyState icon={SearchX} title={t.shop.noProducts} text={t.shop.noProductsText} actionHref="/shop" actionLabel={t.shop.clear} />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {items.map((p, i) => (
                <li key={p.slug}><ProductCard p={toCard(p, locale)} priority={i < 4} /></li>
              ))}
            </ul>
          )}

          {pages > 1 && (
            <nav className="mt-10 flex items-center justify-center gap-1.5" aria-label="Pagination">
              {page > 1 && (
                <Link href={pageHref(page - 1)} className="btn-ghost btn-sm" aria-label={t.shop.prev}><ChevronLeft className="h-4 w-4" /></Link>
              )}
              {Array.from({ length: pages }).map((_, i) => (
                <Link
                  key={i}
                  href={pageHref(i + 1)}
                  aria-current={page === i + 1 ? "page" : undefined}
                  className={cn("flex h-9 min-w-9 items-center justify-center rounded-md px-3 text-sm", page === i + 1 ? "bg-navy text-white" : "hover:bg-cream")}
                >
                  {i + 1}
                </Link>
              ))}
              {page < pages && (
                <Link href={pageHref(page + 1)} className="btn-ghost btn-sm" aria-label={t.shop.next}><ChevronRight className="h-4 w-4" /></Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  );
}
