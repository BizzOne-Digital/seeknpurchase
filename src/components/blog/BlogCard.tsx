import Link from "next/link";
import { ArrowRight, CalendarDays } from "lucide-react";
import type { BlogDTO } from "@/lib/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { SmartImage } from "@/components/ui/SmartImage";
import { formatDate } from "@/lib/utils";

export function BlogCard({ post, locale, readMore, compact }: { post: BlogDTO; locale: Locale; readMore: string; compact?: boolean }) {
  const title = (locale === "es" && post.titleEs) || post.title;
  const excerpt = (locale === "es" && post.excerptEs) || post.excerpt;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] overflow-hidden bg-cream" tabIndex={-1} aria-hidden>
        <SmartImage src={post.featuredImage} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        {post.category && <span className="badge absolute bottom-3 left-3 bg-cream text-navy normal-case tracking-normal">{post.category}</span>}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-sans text-[15px] font-semibold leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-gold-600">{title}</Link>
        </h3>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.6} />
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt, locale === "es" ? "es-US" : "en-US")}</time>
        </p>
        {!compact && excerpt && <p className="mt-3 line-clamp-3 text-sm text-slate-600">{excerpt}</p>}
        {!compact && (
          <Link href={`/blog/${post.slug}`} className="link-arrow mt-auto pt-4 text-xs uppercase tracking-wider">
            {readMore} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </article>
  );
}
