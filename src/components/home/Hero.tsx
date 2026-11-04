import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import type { HomepageDTO } from "@/lib/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { SmartImage } from "@/components/ui/SmartImage";

export function Hero({ hero, locale }: { hero: HomepageDTO["hero"]; locale: Locale }) {
  const es = locale === "es";
  const l1 = (es && hero.titleLine1Es) || hero.titleLine1En;
  const l2 = (es && hero.titleLine2Es) || hero.titleLine2En;
  const l3 = (es && hero.titleLine3Es) || hero.titleLine3En;
  const sub = (es && hero.subtitleEs) || hero.subtitleEn;
  const p = (es && hero.primaryLabelEs) || hero.primaryLabelEn;
  const s = (es && hero.secondaryLabelEs) || hero.secondaryLabelEn;

  return (
    <section className="relative overflow-hidden bg-cream-100">
      <div className="absolute inset-0 md:left-[38%]">
        <SmartImage src={hero.image} alt="" fill priority sizes="(max-width:768px) 100vw, 65vw" className="object-cover object-[70%_center] md:object-center" />
        {/* soft blend from the cream panel into the photo */}
        <div className="absolute inset-0 bg-gradient-to-r from-cream-100 via-cream-100/70 to-transparent md:via-cream-100/10 md:from-cream-100" />
        <div className="absolute inset-0 bg-gradient-to-t from-cream-100/90 via-transparent to-transparent md:hidden" />
      </div>
      <div className="container relative flex min-h-[440px] items-center py-14 md:min-h-[520px] lg:min-h-[560px]">
        <div className="max-w-xl">
          <h1 className="animate-fade-up text-[2.75rem] font-bold leading-[1.05] sm:text-6xl lg:text-[4.2rem]">
            <span className="block">{l1}</span>
            <span className="block">{l2}</span>
            <span className="block text-gold">{l3}</span>
          </h1>
          <p className="mt-6 max-w-md animate-fade-up text-base leading-relaxed text-navy/80 [animation-delay:120ms] md:text-lg">{sub}</p>
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up [animation-delay:220ms]">
            <Link href={hero.primaryLink || "/shop"} className="btn-primary px-8 py-3.5">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.75} /> {p}
            </Link>
            <Link href={hero.secondaryLink || "/shop"} className="btn-outline px-8 py-3.5">{s}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
