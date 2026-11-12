import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, PackageCheck, Paintbrush, PackageSearch, Search, Truck, BadgeDollarSign } from "lucide-react";
import { getCategories, getWholesaleProducts, toCard } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { PageHero } from "@/components/ui/SectionHeading";
import { WholesaleOrder } from "@/components/shop/WholesaleOrder";

export const metadata: Metadata = {
  title: "Wholesale Ordering",
  description: "Order in bulk at wholesale prices. Simple quantity ordering, clear unit pricing and fast checkout for retailers, teams and businesses.",
  alternates: { canonical: "/wholesale" },
};

export default async function WholesalePage() {
  const { locale, t } = await getDictionary();
  const es = locale === "es";
  const [products, categories] = await Promise.all([getWholesaleProducts(), getCategories()]);
  const cards = products.map((p) => toCard(p, locale)).filter((p) => p.wholesalePrice);

  const steps = [
    { icon: ClipboardList, title: es ? "Elige cantidades" : "Choose quantities", text: es ? "Ingresa unidades por talla o producto. Cada producto muestra su mínimo." : "Enter units per size or product. Each product shows its minimum." },
    { icon: PackageCheck, title: es ? "Revisa tu total" : "Review your total", text: es ? "Ve tu total y ahorro en tiempo real antes de pagar." : "See your total and savings update live before you pay." },
    { icon: Truck, title: es ? "Paga y recibe" : "Check out & receive", text: es ? "Pago seguro. Te confirmamos el envío por correo." : "Secure checkout. We confirm shipping by email." },
  ];

  return (
    <>
      <PageHero
        eyebrow={t.nav.wholesale}
        title={es ? "Pedidos al Por Mayor" : "Wholesale Ordering"}
        subtitle={es ? "Compra en volumen a precios de mayoreo. Pedido simple, precios claros." : "Buy in bulk at wholesale prices. Simple ordering, clear pricing."}
      />
      <section className="container pt-10" aria-labelledby="sourcing-heading">
        <div className="grid gap-8 overflow-hidden rounded-2xl bg-navy p-7 text-white md:grid-cols-[1.4fr_1fr] md:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-100">{es ? "Abastecimiento al por mayor" : "Wholesale Sourcing"}</p>
            <h2 id="sourcing-heading" className="mt-3 text-3xl text-white md:text-4xl">
              {es ? "¿Cansado de buscar productos a precios de mayoreo?" : "Tired of Outsourcing Your Products at Wholesale Prices?"}
            </h2>
            <p className="mt-4 max-w-xl text-white/80">
              {es
                ? "En SeeknPurchase te ayudamos. Dinos qué producto necesitas, la cantidad y tu presupuesto, y lo conseguimos por ti a precio de mayoreo, sin complicaciones."
                : "At SeeknPurchase, we can help with that. Tell us the product you need, the quantity and your target price, and we'll source it for you at wholesale prices, without the hassle."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/contact?subject=Wholesale%20sourcing%20request" className="btn bg-gold-100 px-6 text-navy hover:bg-gold hover:text-white">
                {es ? "Envía tu solicitud" : "Send Your Request"} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#ws-heading" className="btn border border-white/40 px-6 text-white hover:bg-white/10">{es ? "Ver catálogo" : "Browse Catalog"}</a>
            </div>
          </div>
          <ul className="grid content-center gap-4 text-sm">
            {[
              { icon: PackageSearch, t: es ? "Buscamos el producto por ti" : "We find the product for you" },
              { icon: BadgeDollarSign, t: es ? "Precios de mayoreo competitivos" : "Competitive wholesale pricing" },
              { icon: Search, t: es ? "Revisamos calidad y proveedores" : "We check quality and suppliers" },
              { icon: Truck, t: es ? "Entrega directa a tu negocio" : "Delivered straight to your business" },
            ].map((b) => (
              <li key={b.t} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold-100"><b.icon className="h-4 w-4" /></span>
                {b.t}
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="container pt-10" aria-label={es ? "Cómo funciona" : "How it works"}>
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="card flex gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700"><s.icon className="h-5 w-5" strokeWidth={1.6} /></span>
              <div>
                <p className="font-semibold">{i + 1}. {s.title}</p>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="container section pt-10" aria-labelledby="ws-heading">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <h2 id="ws-heading" className="h-section">{es ? "Catálogo de Mayoreo" : "Wholesale Catalog"}</h2>
          <p className="flex items-center gap-2 text-sm text-slate-600">
            <Paintbrush className="h-4 w-4 text-gold" />
            {es ? "¿Camisetas personalizadas en volumen?" : "Need custom-printed shirts in bulk?"}{" "}
            <Link href="/contact?subject=Custom%20bulk%20order" className="font-semibold underline hover:text-gold-600">{es ? "Solicita una cotización" : "Request a quote"}</Link>
          </p>
        </div>
        <WholesaleOrder products={cards} categories={categories} />
      </section>
    </>
  );
}
