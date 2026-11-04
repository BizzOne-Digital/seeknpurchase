import Link from "next/link";
import { Fragment } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckCircle2, ChevronRight, RotateCcw, ShieldCheck, Truck, XCircle } from "lucide-react";
import { getCategories, getProduct, getRelatedProducts, getSettings, getSuggestedProducts, toCard } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { productDescription, productTitle } from "@/lib/i18n/localize";
import { formatMoney, siteUrl } from "@/lib/utils";
import { Stars } from "@/components/ui/Stars";
import { Accordion } from "@/components/ui/Accordion";
import { Gallery } from "./Gallery";
import { AddToCartPanel } from "./AddToCartPanel";
import { ProductCard } from "./ProductCard";
import { RecentlyViewed } from "./RecentlyViewed";

export async function productMetadata(slug: string): Promise<Metadata> {
  const p = await getProduct(slug);
  if (!p) return { title: "Product not found", robots: { index: false } };
  const title = p.seoTitle || p.name;
  const description = p.seoDescription || p.shortDescription || p.description?.slice(0, 160);
  const image = p.thumbnail || p.images?.[0];
  return {
    title,
    description,
    alternates: { canonical: `/products/${p.slug}` },
    openGraph: { title, description, images: image ? [image] : [], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : [] },
  };
}

export async function ProductDetail({ slug }: { slug: string }) {
  const p = await getProduct(slug);
  if (!p) notFound();
  const { locale, t } = await getDictionary();
  const [settings, categories, related] = await Promise.all([getSettings(), getCategories(), getRelatedProducts(p, 4)]);
  const suggested = await getSuggestedProducts([p.slug, ...related.map((r) => r.slug)], 4);
  const card = toCard(p, locale);
  const title = productTitle(p, locale);
  const description = productDescription(p, locale);
  const cat = categories.find((c) => c.slug === p.category);
  const money = (n: number) => formatMoney(n, settings.store.currency);
  const out = p.stock <= 0;
  const low = !out && p.stock <= (p.lowStockThreshold ?? 5);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    image: card.images.map((i) => (i.startsWith("http") ? i : `${siteUrl()}${i}`)),
    description: p.shortDescription || p.description,
    brand: { "@type": "Brand", name: settings.businessName },
    ...(p.reviewCount > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount } } : {}),
    offers: {
      "@type": "Offer",
      url: `${siteUrl()}/products/${p.slug}`,
      priceCurrency: settings.store.currency,
      price: p.price,
      availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="container pt-6 text-xs text-slate-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li><Link href="/" className="hover:text-navy">{t.nav.home}</Link></li>
          <ChevronRight className="h-3 w-3" />
          <li><Link href="/shop" className="hover:text-navy">{t.nav.shop}</Link></li>
          {cat && (<><ChevronRight className="h-3 w-3" /><li><Link href={`/shop?category=${cat.slug}`} className="hover:text-navy">{(locale === "es" && cat.nameEs) || cat.name}</Link></li></>)}
          <ChevronRight className="h-3 w-3" />
          <li aria-current="page" className="text-navy">{title}</li>
        </ol>
      </nav>

      <section className="container grid gap-10 py-8 lg:grid-cols-2 lg:gap-14">
        <Gallery images={card.images} title={title} />
        <div>
          <div className="flex gap-2">
            {card.compareAtPrice && <span className="badge bg-[#8a2d1f] text-white">{t.common.sale}</span>}
            {card.isNew && <span className="badge bg-gold-50 text-gold-700 ring-1 ring-gold/30">{t.common.new}</span>}
          </div>
          <h1 className="mt-3 text-3xl md:text-4xl">{title}</h1>
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
            <Stars rating={p.rating} size={16} />
            <span>{p.rating.toFixed(1)} · {p.reviewCount} {t.common.reviews}</span>
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{money(p.price)}</span>
            {card.compareAtPrice && (
              <>
                <span className="text-lg text-slate-400 line-through">{money(card.compareAtPrice)}</span>
                <span className="badge bg-emerald-50 text-emerald-700">-{Math.round((1 - p.price / card.compareAtPrice) * 100)}%</span>
              </>
            )}
          </div>
          {p.shortDescription && <p className="mt-5 leading-relaxed text-slate-600">{p.shortDescription}</p>}
          <p className={`mt-4 flex items-center gap-2 text-sm font-medium ${out ? "text-red-600" : low ? "text-amber-700" : "text-emerald-700"}`}>
            {out ? <XCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            {out ? t.common.outOfStock : low ? `${t.common.lowStock} (${p.stock})` : t.common.inStock}
          </p>

          <div className="mt-6 border-t border-line pt-6">
            <AddToCartPanel p={card} />
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-3 text-center text-xs text-slate-600">
            <li className="rounded-lg bg-cream p-3"><Truck className="mx-auto mb-1 h-5 w-5 text-gold" strokeWidth={1.5} />{t.product.shipping}</li>
            <li className="rounded-lg bg-cream p-3"><RotateCcw className="mx-auto mb-1 h-5 w-5 text-gold" strokeWidth={1.5} />30-day {t.product.returns.toLowerCase()}</li>
            <li className="rounded-lg bg-cream p-3"><ShieldCheck className="mx-auto mb-1 h-5 w-5 text-gold" strokeWidth={1.5} />Secure checkout</li>
          </ul>

          <div className="mt-8">
            <Accordion
              items={[
                { q: t.product.description, a: <div className="whitespace-pre-line">{description}</div> },
                {
                  q: t.product.details,
                  a: (
                    <dl className="grid grid-cols-[110px_1fr] gap-y-1.5">
                      {p.sku && (<><dt className="font-medium text-navy">{t.product.sku}</dt><dd>{p.sku}</dd></>)}
                      {cat && (<><dt className="font-medium text-navy">{t.product.category}</dt><dd>{(locale === "es" && cat.nameEs) || cat.name}</dd></>)}
                      {p.tags?.length ? (<><dt className="font-medium text-navy">{t.product.tags}</dt><dd>{p.tags.join(", ")}</dd></>) : null}
                      {p.variants?.map((v) => (<Fragment key={v.name}><dt className="font-medium text-navy">{v.name}</dt><dd>{v.options.join(", ")}</dd></Fragment>))}
                    </dl>
                  ),
                },
                { q: t.product.shipping, a: <>{t.product.shippingText} <Link className="underline" href="/shipping-policy">→</Link></> },
                { q: t.product.returns, a: <>{t.product.returnsText} <Link className="underline" href="/return-policy">→</Link></> },
              ]}
            />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container py-12" aria-labelledby="related-heading">
          <h2 id="related-heading" className="mb-6 text-2xl md:text-3xl">{t.product.related}</h2>
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r) => <li key={r.slug}><ProductCard p={toCard(r, locale)} /></li>)}
          </ul>
        </section>
      )}
      {suggested.length > 0 && (
        <section className="bg-cream/60 py-12" aria-labelledby="like-heading">
          <div className="container">
            <h2 id="like-heading" className="mb-6 text-2xl md:text-3xl">{t.product.youMayLike}</h2>
            <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {suggested.map((r) => <li key={r.slug}><ProductCard p={toCard(r, locale)} /></li>)}
            </ul>
          </div>
        </section>
      )}
      <div className="pt-12"><RecentlyViewed current={p.slug} /></div>
    </>
  );
}
