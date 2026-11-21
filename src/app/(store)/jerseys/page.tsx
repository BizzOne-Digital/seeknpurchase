import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import { getDictionary } from "@/lib/i18n/server";
import { SPORTS, sportHref } from "@/lib/sports";

export const metadata: Metadata = {
  title: "Custom Team Jerseys",
  description: "Design custom team jerseys and uniforms for soccer, baseball, basketball, football, softball, volleyball and hockey. Add your logo, names and numbers.",
  alternates: { canonical: "/jerseys" },
};

export default async function JerseysPage() {
  const { locale } = await getDictionary();
  const es = locale === "es";
  return (
    <>
      <section className="bg-navy text-white">
        <div className="container py-8 md:py-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-100">{es ? "Ropa deportiva personalizada" : "Custom Sportswear"}</p>
          <h1 className="text-3xl text-white md:text-4xl">{es ? "Diseña el Uniforme de tu Equipo" : "Design Your Team Jersey"}</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            {es ? "Elige tu deporte. Hombre, mujer y juvenil, manga corta o larga, solo camiseta o uniforme completo, con tu logo, nombres y números." : "Choose your sport. Men's, women's and youth, short or long sleeve, top only or full uniform, with your logo, names and numbers."}
          </p>
        </div>
      </section>

      <section className="container py-10 md:py-12" aria-labelledby="sports-heading">
        <h2 id="sports-heading" className="h-section mb-8">{es ? "Elige tu Deporte" : "Shop by Sport"}</h2>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SPORTS.map((s) => (
            <li key={s.slug}>
              <Link href={sportHref(s.slug)} className="card group flex h-full flex-col overflow-hidden text-center transition hover:border-navy hover:shadow-soft">
                <span className="relative block aspect-square bg-cream">
                  <SmartImage src={`/images/sports/${s.slug}.webp`} alt={es ? `Uniforme de ${s.es}` : `${s.en} uniform`} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </span>
                <span className="mt-4 font-serif text-xl text-navy">{es ? s.es : s.en}</span>
                <span className="mb-5 mt-1 inline-flex items-center justify-center gap-1 text-sm font-semibold text-slate-600 group-hover:text-navy">{es ? "Ver uniformes" : "Shop jerseys"} <ArrowRight className="h-4 w-4" /></span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={sportHref()} className="card flex h-full flex-col items-center justify-center gap-2 bg-cream p-8 text-center hover:border-navy">
              <span className="font-serif text-xl text-navy">{es ? "Todos los uniformes" : "All Jerseys"}</span>
              <span className="text-sm text-slate-600">{es ? "Ver todo" : "View all"}</span>
            </Link>
          </li>
        </ul>
        <p className="mt-8 text-sm text-slate-600">
          {es ? "¿Pedido de equipo completo o liga? " : "Ordering for a full team or league? "}
          <Link href="/contact?subject=Team%20jersey%20order" className="font-semibold underline hover:text-gold-600">{es ? "Solicita una cotización" : "Request a team quote"}</Link>
        </p>
      </section>
    </>
  );
}
