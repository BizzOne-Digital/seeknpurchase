import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardList, PackageCheck, Paintbrush, Truck } from "lucide-react";
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
            <Link href="/contact" className="font-semibold underline hover:text-gold-600">{es ? "Solicita una cotización" : "Request a quote"}</Link>
          </p>
        </div>
        <WholesaleOrder products={cards} categories={categories} />
      </section>
    </>
  );
}
