import type { Metadata } from "next";
import { Gift, Ruler, Sparkles } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { PageHero } from "@/components/ui/SectionHeading";
import { BookingForm } from "@/components/forms/BookingForm";

export const metadata: Metadata = {
  title: "Shopping Assistance",
  description: "Request a personal product consultation with the SeeknPurchase team.",
  alternates: { canonical: "/booking" },
};

export default async function BookingPage() {
  const { locale, t } = await getDictionary();
  const es = locale === "es";
  const perks = [
    { Icon: Sparkles, title: es ? "Recomendaciones personales" : "Personal recommendations" },
    { Icon: Gift, title: es ? "Ideas de regalo a tu medida" : "Tailored gift ideas" },
    { Icon: Ruler, title: es ? "Ayuda con tallas y ajuste" : "Sizing & fit guidance" },
  ];
  return (
    <>
      <PageHero title={t.booking.title} subtitle={t.booking.subtitle} eyebrow={es ? "Consulta de Compra" : "Shopping Consultation"} />
      <section className="container section grid gap-12 lg:grid-cols-[320px_1fr]">
        <ul className="space-y-4">
          {perks.map(({ Icon, title }) => (
            <li key={title} className="flex items-center gap-4 rounded-xl border border-line bg-cream p-5">
              <Icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
              <span className="font-medium">{title}</span>
            </li>
          ))}
        </ul>
        <div className="rounded-xl border border-line p-6 md:p-8"><BookingForm /></div>
      </section>
    </>
  );
}
