import type { Metadata } from "next";
import { Clock, Mail, Phone } from "lucide-react";
import { getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { PageHero } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about a product or order? Contact SeeknPurchase by email at info@seeknpurchase.com or phone 213-259-3140.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [{ t, locale }, s] = await Promise.all([getDictionary(), getSettings()]);
  return (
    <>
      <PageHero title={t.contact.title} subtitle={t.contact.subtitle} eyebrow={t.nav.contact} />
      <section className="container section grid gap-12 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <a href={`mailto:${s.email}`} className="flex items-start gap-4 rounded-xl border border-line bg-cream p-5 transition hover:border-gold">
            <Mail className="mt-0.5 h-5 w-5 text-gold" strokeWidth={1.6} />
            <span><span className="block text-xs uppercase tracking-wider text-slate-500">{t.common.email}</span><span className="font-semibold">{s.email}</span></span>
          </a>
          <a href={`tel:${s.phone.replace(/[^\d+]/g, "")}`} className="flex items-start gap-4 rounded-xl border border-line bg-cream p-5 transition hover:border-gold">
            <Phone className="mt-0.5 h-5 w-5 text-gold" strokeWidth={1.6} />
            <span><span className="block text-xs uppercase tracking-wider text-slate-500">{t.common.phone}</span><span className="font-semibold">{s.phone}</span></span>
          </a>
          <div className="flex items-start gap-4 rounded-xl border border-line bg-cream p-5">
            <Clock className="mt-0.5 h-5 w-5 text-gold" strokeWidth={1.6} />
            <span className="text-sm text-slate-600">{locale === "es" ? "Respondemos normalmente en 1 día hábil." : "We typically respond within 1 business day."}</span>
          </div>
        </aside>
        <div className="rounded-xl border border-line p-6 md:p-8">
          <h2 className="mb-6 text-2xl">{t.contact.getInTouch}</h2>
          <ContactForm />
        </div>
      </section>
    </>
  );
}
