import Link from "next/link";
import { ArrowRight, Paintbrush } from "lucide-react";
import { DEFAULT_HOMEPAGE } from "@/lib/demo-data";
import type { HomepageDTO } from "@/lib/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { SmartImage } from "@/components/ui/SmartImage";

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

  return (
    <section className="relative isolate overflow-hidden bg-[#08052b] text-white" aria-labelledby="hero-heading">
      <div className="absolute inset-x-0 bottom-0 h-[230px] sm:inset-0 sm:h-auto">
        <SmartImage src={hero.image} alt="" fill priority sizes="100vw" className="object-cover object-[12%_center] sm:object-center" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#08052b] via-transparent to-transparent sm:hidden" />
      </div>
      <div className="absolute inset-0 hidden bg-[#08052b]/50 sm:block lg:bg-transparent" />
      <div className="container relative flex min-h-[590px] justify-center pb-[230px] pt-10 text-center sm:min-h-[460px] sm:items-center sm:py-14 lg:min-h-[440px] xl:min-h-[480px] 2xl:min-h-[540px]">
        <div className="w-full max-w-[460px] lg:w-[40%]">
          <h1 id="hero-heading" className="animate-fade-up font-sans text-[2.8rem] font-black uppercase leading-[0.98] tracking-tight text-white sm:text-5xl lg:text-[3.6rem] xl:text-[4.25rem]">
            <span className="block">{l1}</span>
            <span className="block bg-gradient-to-r from-[#ff54b7] via-[#ffe64d] to-[#43e9ff] bg-clip-text text-transparent">{l2}</span>
            <span className="mt-5 block text-lg font-bold tracking-[0.12em] text-white sm:text-xl xl:text-2xl">{l3}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-[340px] animate-fade-up text-sm leading-relaxed text-white/85 [animation-delay:120ms] md:text-base">{sub}</p>
          <div className="mt-6 flex animate-fade-up flex-wrap justify-center gap-3 [animation-delay:220ms]">
            <Link href={hero.primaryLink || "/custom"} className="btn bg-[#ffe64d] px-5 py-3 text-[#100b30] shadow-lg hover:-translate-y-0.5 hover:bg-[#fff08a]">
              <Paintbrush className="h-4 w-4" strokeWidth={1.75} /> {p}
            </Link>
            <Link href={hero.secondaryLink || "/shop"} className="btn border border-white/50 bg-[#08052b]/40 px-5 py-3 text-white hover:-translate-y-0.5 hover:bg-white/15">{s} <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </div>
    </section>
  );
}
