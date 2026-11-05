import Link from "next/link";
import { ArrowRight, Paintbrush } from "lucide-react";
import type { Locale } from "@/lib/i18n/dictionaries";
import { SmartImage } from "@/components/ui/SmartImage";

/** Homepage banner linking to the Custom page. */
export function CustomBanner({ locale }: { locale: Locale }) {
  const es = locale === "es";
  return (
    <section className="container py-8" aria-labelledby="custom-banner-heading">
      <Link href="/custom" className="group relative grid overflow-hidden rounded-2xl bg-navy text-white md:grid-cols-[1.3fr_1fr]">
        <div className="p-7 md:p-10">
          <span className="badge bg-gold text-white"><Paintbrush className="mr-1 h-3.5 w-3.5" />{es ? "Hecho para ti" : "Made for you"}</span>
          <h2 id="custom-banner-heading" className="mt-4 text-3xl text-white md:text-4xl">{es ? "Camisetas Personalizadas y Más" : "Custom T-Shirts & More"}</h2>
          <p className="mt-3 max-w-md text-white/80">
            {es ? "Agrega tu texto, logo o diseño a camisetas, sudaderas, hoodies, bolsas, tazas y gorras." : "Add your text, logo or design to T-shirts, sweatshirts, hoodies, tote bags, cups and caps."}
          </p>
          <span className="btn mt-6 bg-gold-100 text-navy group-hover:bg-gold group-hover:text-white">{es ? "Empieza a Personalizar" : "Start Customizing"} <ArrowRight className="h-4 w-4" /></span>
        </div>
        <div className="relative hidden min-h-[260px] md:block">
          <SmartImage src="/images/products/classic-cotton-t-shirt-1.webp" alt="" fill sizes="40vw" className="object-cover transition duration-700 group-hover:scale-105" />
        </div>
      </Link>
    </section>
  );
}
