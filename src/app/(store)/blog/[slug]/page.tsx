import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, User } from "lucide-react";
import { getBlogPost, getBlogPosts } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { formatDate, siteUrl } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";
import { RichText } from "@/components/ui/RichText";
import { BlogCard } from "@/components/blog/BlogCard";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getBlogPost((await params).slug);
  if (!post) return { title: "Post not found", robots: { index: false } };
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title, description, publishedTime: post.publishedAt, images: post.featuredImage ? [post.featuredImage] : [] },
    twitter: { card: "summary_large_image", title, description, images: post.featuredImage ? [post.featuredImage] : [] },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();
  const { locale, t } = await getDictionary();
  const es = locale === "es";
  const title = (es && post.titleEs) || post.title;
  const content = (es && post.contentEs) || post.content;
  const more = (await getBlogPosts(4)).filter((p) => p.slug !== post.slug).slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    datePublished: post.publishedAt,
    author: { "@type": "Organization", name: post.author || "SeeknPurchase" },
    image: post.featuredImage?.startsWith("http") ? post.featuredImage : `${siteUrl()}${post.featuredImage || ""}`,
    mainEntityOfPage: `${siteUrl()}/blog/${post.slug}`,
  };

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="bg-cream">
        <div className="container max-w-3xl py-12 text-center md:py-16">
          <Link href="/blog" className="link-arrow mb-6 text-xs uppercase tracking-wider"><ArrowLeft className="h-3.5 w-3.5" /> {t.nav.blog}</Link>
          {post.category && <p className="eyebrow">{post.category}</p>}
          <h1 className="mt-3 text-3xl md:text-5xl">{title}</h1>
          <p className="mt-5 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /><time dateTime={post.publishedAt}>{formatDate(post.publishedAt, es ? "es-US" : "en-US")}</time></span>
            {post.author && <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{post.author}</span>}
          </p>
        </div>
      </header>
      {post.featuredImage && (
        <div className="container max-w-4xl">
          <div className="relative -mt-2 aspect-[16/8] overflow-hidden rounded-2xl">
            <SmartImage src={post.featuredImage} alt={title} fill priority sizes="(max-width:1024px) 100vw, 900px" className="object-cover" />
          </div>
        </div>
      )}
      <div className="container max-w-3xl py-12">
        <RichText text={content} />
      </div>
      {more.length > 0 && (
        <section className="bg-cream/60 py-14">
          <div className="container">
            <h2 className="mb-6 text-2xl md:text-3xl">{t.home.fromBlog}</h2>
            <ul className="grid gap-6 md:grid-cols-3">
              {more.map((p) => <li key={p.slug}><BlogCard post={p} locale={locale} readMore={t.common.readMore} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
