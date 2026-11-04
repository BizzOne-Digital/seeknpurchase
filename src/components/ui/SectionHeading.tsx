import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title, href, linkLabel, eyebrow, className, as: Tag = "h2",
}: { title: string; href?: string; linkLabel?: string; eyebrow?: string; className?: string; as?: "h1" | "h2" }) {
  return (
    <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <div className="flex items-center gap-5">
          <Tag className="h-section">{title}</Tag>
          <span aria-hidden className="hidden h-px w-16 bg-gold sm:block" />
        </div>
      </div>
      {href && linkLabel && (
        <Link href={href} className="link-arrow text-xs uppercase tracking-wider">
          {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export function PageHero({ title, subtitle, eyebrow, image }: { title: string; subtitle?: string; eyebrow?: string; image?: string }) {
  return (
    <section className="relative overflow-hidden bg-cream">
      {image && (
        <div
          aria-hidden
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${image})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-cream via-cream/90 to-cream/60" aria-hidden />
      <div className="container relative py-14 md:py-20">
        {eyebrow && <p className="eyebrow mb-3 animate-fade-up">{eyebrow}</p>}
        <h1 className="animate-fade-up text-4xl md:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl animate-fade-up text-base text-slate-600 md:text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}
