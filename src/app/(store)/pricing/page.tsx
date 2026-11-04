import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BadgePercent } from "lucide-react";
import { getOffers, getSaleProducts, toCard } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { loc } from "@/lib/i18n/localize";
import { PageHero } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";
import { ProductCard } from "@/components/product/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Deals & Offers",
  description: "Current deals, product discounts, sale items and promotional offers at SeeknPurchase.",
  alternates: { canonical: "/pricing" },
};

export default async function PricingPage() {
  const { locale, t } = await getDictionary();
  const [offers, sale] = await Promise.all([getOffers(), getSaleProducts(12)]);
  const es = locale === "es";
  return (
    <>
      <PageHero title={es ? "Ofertas y Promociones" : "Deals & Offers"} subtitle={es ? "Ofertas actuales, descuentos y artículos en oferta." : "Current deals, product discounts, sale items and promotional offers."} eyebrow={t.nav.deals} />
      {offers.length > 0 && (
        <section className="container section pb-0" aria-labelledby="offers-heading">
          <h2 id="offers-heading" className="h-section mb-8">{t.home.currentOffers}</h2>
          <ul className="grid gap-5 md:grid-cols-2">
            {offers.map((o) => (
              <li key={o.title} className="flex">
                <Link href={o.link || "/shop?sale=1"} className="group relative flex h-full min-h-[220px] w-full overflow-hidden rounded-2xl bg-navy text-white">
                  {o.image && <SmartImage src={o.image} alt="" fill sizes="50vw" className="object-cover opacity-40 transition duration-700 group-hover:scale-105" />}
                  <div className="relative flex flex-col justify-end p-7">
                    {o.discountType === "percentage" && o.discountValue > 0 && (
                      <span className="badge mb-3 w-fit bg-gold text-white"><BadgePercent className="mr-1 h-3.5 w-3.5" />{o.discountValue}% OFF</span>
                    )}
                    <h3 className="text-2xl text-white">{loc(o as unknown as Record<string, unknown>, "title", locale)}</h3>
                    <p className="mt-2 max-w-md text-sm text-white/80">{loc(o as unknown as Record<string, unknown>, "description", locale)}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-100">{t.common.shopNow} <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="container section" aria-labelledby="sale-heading">
        <h2 id="sale-heading" className="h-section mb-8">{t.nav.sale}</h2>
        {sale.length === 0 ? (
          <EmptyState icon={BadgePercent} title={t.shop.noProducts} actionHref="/shop" actionLabel={t.common.viewAllProducts} />
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {sale.map((p) => <li key={p.slug}><ProductCard p={toCard(p, locale)} /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
