import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { HomepageDTO } from "@/lib/types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { SmartImage } from "@/components/ui/SmartImage";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function PromoBanner({ promo, locale, t }: { promo: HomepageDTO["promo"]; locale: Locale; t: Dictionary }) {
  const es = locale === "es";
  const title = (es && promo.titleEs) || promo.titleEn || t.home.joinOffers;
  const text = (es && promo.textEs) || promo.textEn || t.home.joinOffersText;
  return (
    <section className="container py-10" aria-labelledby="promo-heading">
      <div className="relative overflow-hidden rounded-2xl bg-navy text-white">
        {promo.image && (
          <div className="absolute inset-y-0 left-0 hidden w-1/4 md:block">
            <SmartImage src={promo.image} alt="" fill sizes="25vw" className="object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-navy" />
          </div>
        )}
        <div className="relative grid items-center gap-6 px-6 py-10 md:grid-cols-[1fr_auto] md:pl-[28%] md:pr-10">
          <div>
            <h2 id="promo-heading" className="text-2xl text-white md:text-3xl">{title}</h2>
            <p className="mt-2 text-sm text-white/75 md:text-base">{text}</p>
            <div className="mt-5"><NewsletterForm variant="banner" source="home-banner" /></div>
          </div>
          <Link href="/shop" className="btn bg-gold-100 px-7 text-navy hover:bg-gold hover:text-white">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.75} /> {t.common.shopNow}
          </Link>
        </div>
      </div>
    </section>
  );
}
