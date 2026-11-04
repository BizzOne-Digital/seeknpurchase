"use client";

import { useRef } from "react";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import type { TestimonialDTO } from "@/lib/types";
import { Stars } from "@/components/ui/Stars";
import { useI18n } from "@/components/providers/I18nProvider";

export function TestimonialCard({ t }: { t: TestimonialDTO }) {
  const { locale } = useI18n();
  const review = (locale === "es" && t.reviewEs) || t.review;
  return (
    <figure className="flex h-full gap-4 rounded-xl border border-line bg-white p-5 transition hover:shadow-soft">
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-cream ring-2 ring-cream-200">
        <span aria-hidden="true" className="flex h-full w-full items-center justify-center font-serif text-lg text-gold">
          {t.name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0)).join("").toUpperCase()}
        </span>
      </div>
      <div>
        <Quote className="mb-1 h-4 w-4 text-gold/60" strokeWidth={1.5} aria-hidden />
        <blockquote className="text-sm leading-relaxed text-slate-600">{review}</blockquote>
        <Stars rating={t.rating} className="mt-2" />
        <figcaption className="mt-1 text-sm font-semibold">{t.name}</figcaption>
      </div>
    </figure>
  );
}

export function TestimonialsCarousel({ items }: { items: TestimonialDTO[] }) {
  const { t } = useI18n();
  const ref = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: "smooth" });
  };
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
      <div>
        <h2 className="text-3xl leading-tight">{t.home.whatCustomersSay}</h2>
        <p className="mt-2 text-sm text-slate-500">{t.home.realExperiences}</p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => scroll(-1)} aria-label="Previous testimonials" className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-navy">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} aria-label="Next testimonials" className="flex h-9 w-9 items-center justify-center rounded-full border border-line hover:border-navy">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 lg:mx-0 lg:px-0">
        {items.map((x, i) => (
          <li key={x.name + i} className="w-[85%] shrink-0 snap-start sm:w-[48%] lg:w-[calc(33.333%-11px)]">
            <TestimonialCard t={x} />
          </li>
        ))}
      </ul>
    </div>
  );
}
