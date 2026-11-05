import type { MetadataRoute } from "next";
import { getBlogPosts, queryProducts } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes = [
    "", "/about", "/shop", "/custom", "/wholesale", "/services", "/testimonials", "/faq", "/pricing", "/team", "/booking", "/blog", "/contact",
    "/privacy-policy", "/terms", "/shipping-policy", "/return-policy",
  ].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 }));

  const [{ items }, posts] = await Promise.all([queryProducts({ perPage: 1000 }), getBlogPosts(500)]);
  return [
    ...staticRoutes,
    ...items.map((p) => ({ url: `${base}/products/${p.slug}`, lastModified: p.createdAt ? new Date(p.createdAt) : undefined, priority: 0.8 })),
    ...posts.map((b) => ({ url: `${base}/blog/${b.slug}`, lastModified: new Date(b.publishedAt), priority: 0.6 })),
  ];
}
