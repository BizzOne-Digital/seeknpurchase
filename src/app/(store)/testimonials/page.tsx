import type { Metadata } from "next";
import { MessageSquareQuote } from "lucide-react";
import { getTestimonials } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { PageHero } from "@/components/ui/SectionHeading";
import { TestimonialCard } from "@/components/home/Testimonials";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Read real experiences from happy SeeknPurchase shoppers.",
  alternates: { canonical: "/testimonials" },
};

export default async function TestimonialsPage() {
  const { t } = await getDictionary();
  const items = await getTestimonials();
  return (
    <>
      <PageHero title={t.home.whatCustomersSay} subtitle={t.home.realExperiences} eyebrow={t.nav.testimonials} />
      <section className="container section">
        {items.length === 0 ? (
          <EmptyState icon={MessageSquareQuote} title={t.common.noResults} />
        ) : (
          <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {items.map((x, i) => <li key={x.name + i}><TestimonialCard t={x} /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
