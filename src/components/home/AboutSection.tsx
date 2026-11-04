import { Gem, Heart, ShoppingBag } from "lucide-react";
import type { HomepageDTO } from "@/lib/types";
import type { Dictionary, Locale } from "@/lib/i18n/dictionaries";
import { SmartImage } from "@/components/ui/SmartImage";

export function AboutSection({ about, locale, t }: { about: HomepageDTO["about"]; locale: Locale; t: Dictionary }) {
  const es = locale === "es";
  const label = (es && about.labelEs) || about.labelEn || t.home.aboutLabel;
  const title = (es && about.titleEs) || about.titleEn;
  const body = ((es && about.bodyEs) || about.bodyEn || "").split(/\n\s*\n/);
  const values = [
    { Icon: ShoppingBag, title: t.home.simpleShopping, text: t.home.simpleShoppingText },
    { Icon: Gem, title: t.home.stylish, text: t.home.stylishText },
    { Icon: Heart, title: t.home.everyday, text: t.home.everydayText },
  ];

  return (
    <section className="section bg-cream" aria-labelledby="about-heading">
      <div className="container grid items-center gap-10 lg:grid-cols-12">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:col-span-5">
          <SmartImage src={about.image} alt="Curated clothing and accessories on a rack" fill sizes="(max-width:1024px) 100vw, 40vw" className="object-cover" />
        </div>
        <div className="lg:col-span-4">
          <p className="eyebrow mb-3">{label}</p>
          <h2 id="about-heading" className="text-3xl leading-tight md:text-[2.1rem]">{title}</h2>
          {body.map((p, i) => (
            <p key={i} className="mt-4 text-[15px] leading-relaxed text-slate-600">{p}</p>
          ))}
        </div>
        <ul className="space-y-6 lg:col-span-3 lg:border-l lg:border-line lg:pl-8">
          {values.map(({ Icon, title, text }) => (
            <li key={title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-gold shadow-soft">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <h3 className="font-sans text-[15px] font-semibold">{title}</h3>
                <p className="text-sm text-slate-500">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
