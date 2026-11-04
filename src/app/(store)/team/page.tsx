import type { Metadata } from "next";
import Link from "next/link";
import { getTeam } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { loc } from "@/lib/i18n/localize";
import { PageHero } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMG } from "@/lib/demo-data";

export const metadata: Metadata = {
  title: "Our Team",
  description: "Meet the SeeknPurchase team behind your shopping experience.",
  alternates: { canonical: "/team" },
};

export default async function TeamPage() {
  const { locale, t } = await getDictionary();
  const team = await getTeam();
  const es = locale === "es";
  return (
    <>
      <PageHero title={es ? "Conoce al Equipo de SeeknPurchase" : "Meet the SeeknPurchase Team"} eyebrow={t.nav.team} image={IMG.store} />
      <section className="container section">
        {team.length === 0 ? (
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <SmartImage src={IMG.fashionStore} alt="SeeknPurchase curated store" fill sizes="50vw" className="object-cover" />
            </div>
            <div>
              <h2 className="h-section">{es ? "Personas que aman descubrir grandes productos" : "People who love discovering great products"}</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                {es
                  ? "Detrás de SeeknPurchase hay un equipo dedicado a seleccionar productos con estilo, valor y calidad, y a brindar una experiencia de compra simple y agradable. Desde la selección de productos hasta la atención al cliente, trabajamos para que cada pedido sea una buena experiencia."
                  : "Behind SeeknPurchase is a team dedicated to curating products with style, value and quality — and to making every shopping experience simple and enjoyable. From product selection to customer support, we work to make every order a great one."}
              </p>
              <Link href="/contact" className="btn-primary mt-6">{t.contact.getInTouch}</Link>
            </div>
          </div>
        ) : (
          <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((m) => (
              <li key={m.name} className="group text-center">
                <div className="relative mx-auto aspect-square overflow-hidden rounded-xl bg-cream">
                  <SmartImage src={m.image} alt={m.name} fill sizes="25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <h2 className="mt-4 text-xl">{m.name}</h2>
                {m.role && <p className="text-sm font-medium text-gold-600">{loc(m as unknown as Record<string, unknown>, "role", locale)}</p>}
                {m.bio && <p className="mt-2 text-sm text-slate-600">{loc(m as unknown as Record<string, unknown>, "bio", locale)}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
