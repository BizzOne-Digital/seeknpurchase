import Link from "next/link";
import { ArrowRight, BadgePercent, Headphones, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import type { OfferDTO, ProductDTO } from "@/lib/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { loc } from "@/lib/i18n/localize";
import { toCard } from "@/lib/data";
import { SmartImage } from "@/components/ui/SmartImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";
import { formatMoney } from "@/lib/utils";

const tx = {
  en: {
    trust: [
      ["Free Shipping", "On orders over {amt}"],
      ["Secure Checkout", "Payments protected by Stripe"],
      ["Easy Returns", "30-day hassle-free returns"],
      ["Friendly Support", "Real people, quick answers"],
    ],
    offers: "Current Offers", allDeals: "View All Deals", off: "OFF", freeShip: "FREE SHIPPING",
    newArrivals: "New Arrivals", bestSellers: "Best Sellers", viewAll: "View All",
    lifestyleLabel: "Shop by Lifestyle", lifestyleTitle: "Curated for Every Moment",
    lifestyle: [
      ["Everyday Style", "Comfortable staples you'll wear on repeat.", "/shop?category=everyday-essentials"],
      ["Statement Accessories", "Finishing touches that complete the look.", "/shop?category=fashion-accessories"],
      ["Thoughtful Gifting", "Gift-ready finds for the people you love.", "/shop?category=gifts"],
    ],
    explore: "Explore",
  },
  es: {
    trust: [
      ["Envío Gratis", "En pedidos mayores a {amt}"],
      ["Pago Seguro", "Pagos protegidos por Stripe"],
      ["Devoluciones Fáciles", "30 días sin complicaciones"],
      ["Atención Amable", "Personas reales, respuestas rápidas"],
    ],
    offers: "Ofertas Actuales", allDeals: "Ver Todas las Ofertas", off: "DESC.", freeShip: "ENVÍO GRATIS",
    newArrivals: "Novedades", bestSellers: "Más Vendidos", viewAll: "Ver Todo",
    lifestyleLabel: "Compra por Estilo de Vida", lifestyleTitle: "Seleccionado para Cada Momento",
    lifestyle: [
      ["Estilo Diario", "Básicos cómodos que usarás una y otra vez.", "/shop?category=everyday-essentials"],
      ["Accesorios con Carácter", "Detalles que completan tu look.", "/shop?category=fashion-accessories"],
      ["Regalos Especiales", "Ideas listas para regalar a quienes quieres.", "/shop?category=gifts"],
    ],
    explore: "Explorar",
  },
};

export function TrustBar({ locale, freeShippingThreshold, currency }: { locale: Locale; freeShippingThreshold: number; currency: string }) {
  const icons = [Truck, ShieldCheck, RotateCcw, Headphones];
  return (
    <section className="container pt-8" aria-label="Why shop with us">
      <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line lg:grid-cols-4">
        {tx[locale].trust.map(([title, text], i) => {
          const Icon = icons[i];
          return (
            <li key={title} className="flex items-center gap-3 bg-white p-4 md:p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cream text-gold">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-slate-500">{text.replace("{amt}", formatMoney(freeShippingThreshold, currency).replace(/\.00$/, ""))}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ProductRow({ title, href, products, locale }: { title: string; href: string; products: ProductDTO[]; locale: Locale }) {
  if (!products.length) return null;
  return (
    <section className="container section pt-4" aria-label={title}>
      <SectionHeading title={title} href={href} linkLabel={tx[locale].viewAll} />
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {products.slice(0, 4).map((p) => <li key={p.slug}><ProductCard p={toCard(p, locale)} /></li>)}
      </ul>
    </section>
  );
}

export function OffersBanner({ offers, locale }: { offers: OfferDTO[]; locale: Locale }) {
  if (!offers.length) return null;
  const t = tx[locale];
  return (
    <section className="container pb-6" aria-labelledby="offers-home">
      <div className="mb-6 flex items-end justify-between">
        <h2 id="offers-home" className="h-section">{t.offers}</h2>
        <Link href="/pricing" className="link-arrow text-xs uppercase tracking-wider">{t.allDeals} <ArrowRight className="h-3.5 w-3.5" /></Link>
      </div>
      <ul className="grid gap-5 md:grid-cols-2">
        {offers.slice(0, 2).map((o) => {
          const rec = o as unknown as Record<string, unknown>;
          return (
            <li key={o.title} className="flex">
              <Link href={o.link || "/shop?sale=1"} className="group relative flex h-full min-h-[230px] w-full overflow-hidden rounded-2xl bg-navy text-white">
                {o.image && <SmartImage src={o.image} alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover opacity-45 transition duration-700 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/70 to-transparent" />
                <div className="relative flex max-w-md flex-col justify-center p-7 md:p-9">
                  <span className="badge mb-3 w-fit bg-gold text-white">
                    <BadgePercent className="mr-1 h-3.5 w-3.5" />
                    {o.discountType === "percentage" && o.discountValue > 0 ? `${o.discountValue}% ${t.off}` : o.discountType === "free_shipping" ? t.freeShip : t.offers}
                  </span>
                  <h3 className="text-2xl text-white md:text-3xl">{loc(rec, "title", locale)}</h3>
                  <p className="mt-2 text-sm text-white/80">{loc(rec, "description", locale)}</p>
                  <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-md bg-gold-100 px-4 py-2 text-sm font-semibold text-navy transition group-hover:bg-gold group-hover:text-white">
                    {locale === "es" ? "Comprar Ahora" : "Shop Now"} <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function LifestyleSection({ locale, images }: { locale: Locale; images: string[] }) {
  const t = tx[locale];
  return (
    <section className="container section" aria-labelledby="lifestyle-heading">
      <div className="mb-8 text-center">
        <p className="eyebrow">{t.lifestyleLabel}</p>
        <h2 id="lifestyle-heading" className="h-section mt-2">{t.lifestyleTitle}</h2>
      </div>
      <ul className="grid gap-5 md:grid-cols-3">
        {t.lifestyle.map(([title, text, href], i) => (
          <li key={title}>
            <Link href={href} className="group relative block aspect-[4/5] overflow-hidden rounded-2xl">
              <SmartImage src={images[i]} alt={title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="text-2xl text-white">{title}</h3>
                <p className="mt-1 text-sm text-white/80">{text}</p>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-100">
                  {t.explore} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export const homeExtraText = tx;
