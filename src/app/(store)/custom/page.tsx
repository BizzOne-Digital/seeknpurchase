import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MousePointerClick, Paintbrush, Truck } from "lucide-react";
import { getCustomProducts, getSettings, toCard } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Custom T-Shirts, Hoodies, Totes, Cups & Caps",
  description: "Customize T-shirts, sweatshirts, hoodies, tote bags, cups and caps with your own text, logo or design.",
  alternates: { canonical: "/custom" },
};

export default async function CustomPage() {
  const { locale } = await getDictionary();
  const es = locale === "es";
  const [products, settings] = await Promise.all([getCustomProducts(), getSettings()]);
  const cards = products.map((p) => toCard(p, locale));
  const money = (n: number) => formatMoney(n, settings.store.currency);
  const steps = [
    { icon: MousePointerClick, title: es ? "Elige un producto" : "Pick a product", text: es ? "Selecciona el artículo, la talla y el color." : "Choose your item, size and color." },
    { icon: Paintbrush, title: es ? "Agrega tu diseño" : "Add your design", text: es ? "Elige ubicación y método, y agrega tu texto o logo." : "Choose placement and print method, then add your text or logo." },
    { icon: Truck, title: es ? "Lo hacemos por ti" : "We make it for you", text: es ? "Revisamos tu pedido y te contactamos si hace falta algo." : "We review your order and contact you if we need anything." },
  ];

  return (
    <>
      <section className="bg-navy text-white">
        <div className="container grid items-center gap-6 py-7 md:grid-cols-[1fr_auto] md:py-8">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-100">{es ? "Personalizados" : "Custom Products"}</p>
            <h1 className="text-3xl text-white md:text-4xl">{es ? "Crea Algo Solo Tuyo" : "Make It Yours"}</h1>
            <p className="mt-2 max-w-xl text-white/80">
              {es ? "Camisetas, sudaderas, bolsas, tazas, hoodies y gorras con tu texto, logo o diseño." : "T-shirts, sweatshirts, tote bags, cups, hoodies and caps with your text, logo or design."}
            </p>
          </div>
          <div className="relative hidden h-32 w-56 overflow-hidden rounded-xl md:block">
            <SmartImage src="/images/products/classic-cotton-t-shirt-1.webp" alt={es ? "Camiseta lista para personalizar" : "T-shirt ready to customize"} fill priority sizes="224px" className="object-cover" />
          </div>
        </div>
      </section>

      <section id="custom-products" className="container scroll-mt-24 py-10 md:py-12" aria-labelledby="custom-heading">
        <h2 id="custom-heading" className="h-section mb-8">{es ? "Elige Qué Personalizar" : "Choose What to Customize"}</h2>
        {cards.length === 0 ? (
          <EmptyState icon={Paintbrush} title={es ? "Próximamente" : "Coming soon"} actionHref="/contact" actionLabel={es ? "Contáctanos" : "Contact us"} />
        ) : (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {cards.map((p) => (
              <li key={p.slug} className="flex">
                <Link href={`/products/${p.slug}?custom=1`} className="card group flex w-full flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative aspect-square bg-cream-100">
                    <SmartImage src={p.image} alt={p.title} fill sizes="(max-width:1024px) 50vw, 33vw" className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="font-sans text-base font-semibold">{p.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{es ? "Desde" : "From"} {money(p.price)}</p>
                    <span className="link-arrow mt-auto pt-3 text-sm">{es ? "Personalizar" : "Customize"} <ArrowRight className="h-4 w-4" /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bg-cream/60 py-12" aria-label={es ? "Cómo funciona" : "How it works"}>
        <ol className="container grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="card flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700"><s.icon className="h-5 w-5" strokeWidth={1.6} /></span>
              <div><p className="font-semibold">{i + 1}. {s.title}</p><p className="mt-1 text-sm text-slate-600">{s.text}</p></div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
