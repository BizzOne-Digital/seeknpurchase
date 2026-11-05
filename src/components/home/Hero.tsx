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

  return (
    <HeroCarousel desktopImage={desktopImage} locale={locale}>
      <div className="container relative flex justify-center pb-6 pt-8 text-center sm:min-h-[460px] sm:items-center sm:justify-start sm:py-14 sm:text-left lg:min-h-[440px] xl:min-h-[480px] 2xl:min-h-[540px]">
        <div className="w-full max-w-[430px] sm:w-[43%]">
          <p className="mb-3 animate-fade-up text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-700 sm:mb-5 sm:text-xs">{l3}</p>
          <h1 id="hero-heading" className="animate-fade-up font-serif text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-navy sm:text-5xl lg:text-[3.6rem] xl:text-[4.25rem]">
            <span className="block">{l1}</span>
            <span className="block text-gold-600">{l2}</span>
          </h1>
          <p className="mx-auto mt-3 max-w-[340px] animate-fade-up text-sm leading-relaxed text-navy/75 [animation-delay:120ms] sm:mx-0 sm:mt-5 md:text-base">{sub}</p>
          <div className="mt-5 flex animate-fade-up flex-wrap justify-center gap-3 [animation-delay:220ms] sm:mt-7 sm:justify-start">
            <Link href={hero.primaryLink || "/custom"} className="btn-primary px-5 py-3">
              <Paintbrush className="h-4 w-4" strokeWidth={1.75} /> {p}
            </Link>
            <Link href={hero.secondaryLink || "/shop"} className="btn-outline px-5 py-3">{s} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </HeroCarousel>
  );
}
