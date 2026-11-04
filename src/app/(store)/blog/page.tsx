import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getBlogPosts } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { PageHero } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Blog",
  description: "Style tips, lifestyle ideas and gift guides from SeeknPurchase.",
  alternates: { canonical: "/blog" },
};

export default async function BlogPage() {
  const { locale, t } = await getDictionary();
  const posts = await getBlogPosts(60);
  return (
    <>
      <PageHero title={t.home.fromBlog} eyebrow={t.nav.blog} subtitle={locale === "es" ? "Consejos de estilo, ideas y guías de regalo." : "Style tips, lifestyle ideas and gift guides."} />
      <section className="container section">
        {posts.length === 0 ? (
          <EmptyState icon={Newspaper} title={t.common.noResults} />
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => <li key={p.slug}><BlogCard post={p} locale={locale} readMore={t.common.readMore} /></li>)}
          </ul>
        )}
      </section>
    </>
  );
}
