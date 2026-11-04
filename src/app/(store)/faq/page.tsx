import type { Metadata } from "next";
import Link from "next/link";
import { getFaqs, getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { loc } from "@/lib/i18n/localize";
import { PageHero } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about ordering, payment methods, shipping times, returns and order tracking at SeeknPurchase.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const { locale, t } = await getDictionary();
  const [faqs, s] = await Promise.all([getFaqs(), getSettings()]);
  const items = faqs.map((f) => ({ q: loc(f, "question", locale), a: loc(f, "answer", locale) }));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <PageHero title={t.home.faqTitle} eyebrow={t.nav.faq} />
      <section className="container section grid gap-10 lg:grid-cols-[1fr_320px]">
        <div id="payment"><Accordion items={items} /></div>
        <aside id="sizing" className="h-fit rounded-xl border border-line bg-cream p-6">
          <h2 className="text-xl">{t.contact.getInTouch}</h2>
          <p className="mt-2 text-sm text-slate-600">{t.contact.subtitle}</p>
          <p className="mt-4 text-sm"><a className="font-semibold hover:text-gold-600" href={`mailto:${s.email}`}>{s.email}</a></p>
          <p className="text-sm"><a className="font-semibold hover:text-gold-600" href={`tel:${s.phone.replace(/[^\d+]/g, "")}`}>{s.phone}</a></p>
          <Link href="/contact" className="btn-primary mt-5 w-full">{t.nav.contact}</Link>
        </aside>
      </section>
    </>
  );
}
