import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ClipboardList, PackageCheck, Paintbrush, PackageSearch, Search, Truck, BadgeDollarSign } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { PageHero } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Wholesale Ordering",
  description: "Order in bulk at wholesale prices. Simple quantity ordering, clear unit pricing and fast checkout for retailers, teams and businesses.",
  alternates: { canonical: "/wholesale" },
};

export default async function WholesalePage() {
  const { locale, t } = await getDictionary();
  const es = locale === "es";
  // Wholesale is for approved customers only: no public catalog, just a quote request.
  const quote = "/contact?subject=Wholesale%20quote%20request";
  const steps = [
    { icon: ClipboardList, title: es ? "Envía tu solicitud" : "Send your request", text: es ? "Dinos qué producto buscas y la cantidad. Puedes adjuntar una foto o muestra." : "Tell us the product and quantity you need. You can attach a photo or sample." },
    { icon: PackageCheck, title: es ? "Recibe tu cotización" : "Get your quote", text: es ? "Buscamos el producto y te enviamos precios de mayoreo." : "We source the product and send you wholesale pricing." },
    { icon: Truck, title: es ? "Aprobación y entrega" : "Approve & receive", text: es ? "Los clientes aprobados ordenan y lo entregamos a su negocio." : "Approved customers place the order and we deliver to your business." },
  ];

  return (
    <>
      <PageHero
        eyebrow={t.nav.wholesale}
        title={es ? "Mayoreo" : "Wholesale"}
        subtitle={es ? "Para clientes aprobados. Solicita una cotización y te respondemos con precios de mayoreo." : "For approved business customers. Request a quote and we'll reply with wholesale pricing."}
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
              <Link href={quote} className="btn bg-gold-100 px-6 text-navy hover:bg-gold hover:text-white">
                {es ? "Solicitar cotización" : "Request a Quote"} <ArrowRight className="h-4 w-4" />
              </Link>
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
      <section className="container section pt-10 text-center" aria-labelledby="ws-cta">
        <h2 id="ws-cta" className="h-section">{es ? "¿Listo para cotizar?" : "Ready for a Quote?"}</h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">{es ? "Completa el formulario con tu nombre, correo, teléfono y el producto que necesitas. Puedes adjuntar una imagen de referencia." : "Fill in the form with your name, email, phone and the products you need. You can attach a reference image or sample photo."}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={quote} className="btn-primary px-6">{es ? "Solicitar cotización" : "Request a Quote"} <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/contact?subject=Custom%20bulk%20order" className="btn-outline px-6"><Paintbrush className="h-4 w-4" /> {es ? "Camisetas personalizadas en volumen" : "Custom-printed shirts in bulk"}</Link>
        </div>
      </section>
    </>
  );
}
