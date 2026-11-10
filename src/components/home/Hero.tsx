import Link from "next/link";
import { ArrowRight, Paintbrush } from "lucide-react";
import { DEFAULT_HOMEPAGE } from "@/lib/demo-data";
import type { HomepageDTO } from "@/lib/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { HeroCarousel } from "@/components/home/HeroCarousel";

export function Hero({ hero, locale }: { hero: HomepageDTO["hero"]; locale: Locale }) {
  // Upgrade the original seeded hero without overwriting a customized CMS hero.
  if (hero.titleLine1En === "Seek More." && hero.titleLine2En === "Shop Smart." && hero.titleLine3En === "Save More.") {
    hero = DEFAULT_HOMEPAGE.hero;
  }
  const es = locale === "es";
  const l1 = (es && hero.titleLine1Es) || hero.titleLine1En;
  const l2 = (es && hero.titleLine2Es) || hero.titleLine2En;
  const l3 = (es && hero.titleLine3Es) || hero.titleLine3En;
  const sub = (es && hero.subtitleEs) || hero.subtitleEn;
  const p = (es && hero.primaryLabelEs) || hero.primaryLabelEn;
  const s = (es && hero.secondaryLabelEs) || hero.secondaryLabelEn;
  const desktopImage = hero.image === "/images/hero/custom-printing-banner.webp"
    ? DEFAULT_HOMEPAGE.hero.image : hero.image;

  const panel = (o: { eyebrow: string; title1: string; title2: string; text: string; primary: { href: string; label: string; icon?: boolean }; secondary: { href: string; label: string }; first?: boolean }) => {
    const Heading = o.first ? "h1" : "h2";
    return (
      <div className="container relative flex justify-center pb-6 pt-8 text-center sm:min-h-[460px] sm:items-center sm:justify-start sm:py-14 sm:text-left lg:min-h-[440px] xl:min-h-[480px] 2xl:min-h-[540px]">
        <div className="w-full max-w-[430px] sm:w-[43%]">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-700 sm:mb-5 sm:text-xs">{o.eyebrow}</p>
          <Heading id={o.first ? "hero-heading" : undefined} className="font-serif text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[3.6rem] xl:text-[4.25rem]">
            <span className="block">{o.title1}</span>
            <span className="block text-gold-600">{o.title2}</span>
          </Heading>
          <p className="mx-auto mt-3 max-w-[340px] text-sm leading-relaxed text-navy/75 sm:mx-0 sm:mt-5 md:text-base">{o.text}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:mt-7 sm:justify-start">
            <Link href={o.primary.href} className="btn-primary px-5 py-3">
              {o.primary.icon && <Paintbrush className="h-4 w-4" strokeWidth={1.75} />} {o.primary.label}
            </Link>
            <Link href={o.secondary.href} className="btn-outline px-5 py-3">{o.secondary.label} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <HeroCarousel desktopImage={desktopImage} locale={locale} panels={[
      panel({ first: true, eyebrow: l3, title1: l1, title2: l2, text: sub, primary: { href: hero.primaryLink || "/custom", label: p, icon: true }, secondary: { href: hero.secondaryLink || "/shop", label: s } }),
      panel({
        eyebrow: es ? "Estilo Vaquero" : "Western Collection", title1: es ? "Sombreros" : "Western", title2: es ? "Vaqueros" : "Hats",
        text: es ? "Sombreros de fieltro y cuero con detalles clásicos, hechos para durar." : "Classic felt and leather cowboy hats with timeless details, built to last.",
        primary: { href: "/shop?q=hat", label: es ? "Comprar Sombreros" : "Shop Western Hats" }, secondary: { href: "/shop", label: es ? "Ver Todo" : "Shop All" },
      }),
      panel({
        eyebrow: es ? "Colección de Verano" : "Summer Collection", title1: es ? "Sombreros de" : "Summer", title2: es ? "Verano" : "Hats",
        text: es ? "Sombreros de paja ligeros y frescos para el sol, la playa y cada día." : "Light, breathable straw and bucket hats for sunny days, the beach and every day.",
        primary: { href: "/shop?q=hat", label: es ? "Comprar Sombreros" : "Shop Summer Hats" }, secondary: { href: "/shop", label: es ? "Ver Todo" : "Shop All" },
      }),
    ]} />
  );
}
