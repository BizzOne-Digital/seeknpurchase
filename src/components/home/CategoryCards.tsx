import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { HomepageDTO } from "@/lib/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { SmartImage } from "@/components/ui/SmartImage";

export function CategoryCards({ cards, locale, cta }: { cards: HomepageDTO["categoryCards"]; locale: Locale; cta: string }) {
  return (
    <section className="container pt-6 md:pt-8" aria-label="Shop by category">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const title = (locale === "es" && c.titleEs) || c.titleEn;
          return (
            <li key={c.link + title}>
              <Link href={c.link} className="group flex h-full overflow-hidden rounded-xl border border-line bg-cream transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="relative w-[52%] shrink-0 overflow-hidden">
                  <SmartImage src={c.image} alt={title} fill sizes="(max-width:640px) 50vw, 15vw" className="object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="flex min-h-[110px] flex-col justify-center p-4">
                  <h3 className="text-lg leading-tight">{title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy underline-offset-4 group-hover:text-gold-600 group-hover:underline">
                    {cta} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
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
