import type { Metadata } from "next";
import Link from "next/link";
import { getServices } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { loc } from "@/lib/i18n/localize";
import { PageHero } from "@/components/ui/SectionHeading";
import { Icon } from "@/components/ui/Icon";
import { IMG } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Our Services",
  description: "Online shopping, fashion accessories, general merchandise, product discovery, convenient ordering and friendly customer support.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const { locale, t } = await getDictionary();
  const services = await getServices();
  return (
    <>
      <PageHero title={t.home.ourServices} eyebrow="SeeknPurchase" subtitle={locale === "es" ? "Todo lo que necesitas para comprar con confianza." : "Everything you need to shop with confidence."} image={IMG.fashionStore} />
      <section className="container section">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.titleEn} className="group rounded-xl border border-line bg-white p-7 transition hover:-translate-y-1 hover:shadow-lift">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-cream text-gold transition group-hover:bg-gold group-hover:text-white">
                <Icon name={s.icon} className="h-7 w-7" />
              </span>
              <h2 className="mt-5 text-xl">{loc(s, "title", locale)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{loc(s, "description", locale)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-14 rounded-2xl bg-navy p-8 text-center text-white md:p-12">
          <h2 className="text-2xl text-white md:text-3xl">{t.booking.title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/75">{t.booking.subtitle}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/booking" className="btn bg-gold-100 text-navy hover:bg-gold hover:text-white">{t.booking.request}</Link>
            <Link href="/shop" className="btn border border-white/40 text-white hover:bg-white hover:text-navy">{t.common.shopNow}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
