import "server-only";
import { cache } from "react";
import { connectDB, hasDb, serialize } from "./db";
import {
  BlogPost, Category, FAQ, HomepageContent, Product, Service, SiteSettings, SpecialOffer, TeamMember, Testimonial,
} from "@/models";
import {
  DEFAULT_HOMEPAGE, DEFAULT_SETTINGS, DEMO_BLOG, DEMO_CATEGORIES, DEMO_FAQS, DEMO_OFFERS, DEMO_PRODUCTS, DEMO_SERVICES, DEMO_TESTIMONIALS,
} from "./demo-data";
import type {
  BlogDTO, CategoryDTO, FaqDTO, HomepageDTO, OfferDTO, ProductCardData, ProductDTO, ServiceDTO, SettingsDTO, TeamDTO, TestimonialDTO,
} from "./types";
import { escapeRegex, normalizeImageUrl } from "./utils";
import type { Locale } from "./i18n/dictionaries";
import { productTitle } from "./i18n/localize";

/** Runs a DB query; falls back to demo content when no DB is configured or it is unreachable. */
async function withDb<T>(query: () => Promise<unknown>, fallback: T): Promise<T> {
  if (!hasDb()) return fallback;
  try {
    await connectDB();
    return serialize<T>(await query());
  } catch (e) {
    console.error("[data] falling back to defaults:", (e as Error).message);
    return fallback;
  }
}

function mergeDeep<T>(base: T, over: unknown): T {
  if (!over || typeof over !== "object" || Array.isArray(over)) return (over ?? base) as T;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(over as Record<string, unknown>)) {
    if (v === undefined || v === null || v === "") continue;
    if (Array.isArray(v)) out[k] = v.length ? v : out[k];
    else if (typeof v === "object") out[k] = mergeDeep(out[k] ?? {}, v);
    else out[k] = v;
  }
  return out as T;
}

export const getSettings = cache(async (): Promise<SettingsDTO> => {
  const doc = await withDb<Partial<SettingsDTO> | null>(() => SiteSettings.findOne({ key: "main" }).lean(), null);
  return mergeDeep(DEFAULT_SETTINGS, doc);
});

export const getHomepage = cache(async (): Promise<HomepageDTO> => {
  const doc = await withDb<Partial<HomepageDTO> | null>(() => HomepageContent.findOne({ key: "main" }).lean(), null);
  return mergeDeep(DEFAULT_HOMEPAGE, doc);
});

export const getCategories = cache(async (): Promise<CategoryDTO[]> =>
  withDb(() => Category.find({ active: true }).sort({ sortOrder: 1, name: 1 }).lean(), DEMO_CATEGORIES),
);

/* ---------------- Products ---------------- */
export type ProductQuery = {
  q?: string; category?: string; min?: number; max?: number; inStock?: boolean; sale?: boolean;
  sort?: "featured" | "newest" | "price-asc" | "price-desc" | "best-selling"; page?: number; perPage?: number;
  flag?: "new" | "best";
};

function sortFn(sort: ProductQuery["sort"]) {
  switch (sort) {
    case "newest": return (a: ProductDTO, b: ProductDTO) => +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0);
    case "price-asc": return (a: ProductDTO, b: ProductDTO) => a.price - b.price;
    case "price-desc": return (a: ProductDTO, b: ProductDTO) => b.price - a.price;
    case "best-selling": return (a: ProductDTO, b: ProductDTO) => (b.soldCount || 0) - (a.soldCount || 0);
    default: return (a: ProductDTO, b: ProductDTO) => Number(!!b.featured) - Number(!!a.featured) || +new Date(b.createdAt || 0) - +new Date(a.createdAt || 0);
  }
}

function mongoSort(sort: ProductQuery["sort"]): Record<string, 1 | -1> {
  switch (sort) {
    case "newest": return { createdAt: -1 };
    case "price-asc": return { price: 1 };
    case "price-desc": return { price: -1 };
    case "best-selling": return { soldCount: -1 };
    default: return { featured: -1, createdAt: -1 };
  }
}

export async function queryProducts(q: ProductQuery): Promise<{ items: ProductDTO[]; total: number; page: number; pages: number }> {
  const perPage = q.perPage ?? 12;
  const page = Math.max(1, q.page ?? 1);

  const fallback = () => {
    let list = [...DEMO_PRODUCTS];
    if (q.q) {
      const r = new RegExp(escapeRegex(q.q), "i");
      list = list.filter((p) => r.test(p.name) || r.test(p.shortDescription || "") || (p.tags || []).some((t) => r.test(t)));
    }
    if (q.category) list = list.filter((p) => p.category === q.category);
    if (q.min != null) list = list.filter((p) => p.price >= q.min!);
    if (q.max != null) list = list.filter((p) => p.price <= q.max!);
    if (q.inStock) list = list.filter((p) => p.stock > 0);
    if (q.sale) list = list.filter((p) => p.onSale || (p.compareAtPrice ?? 0) > p.price);
    if (q.flag === "new") list = list.filter((p) => p.newArrival);
    if (q.flag === "best") list = list.filter((p) => p.bestSeller);
    list.sort(sortFn(q.sort));
    return { items: list.slice((page - 1) * perPage, page * perPage), total: list.length };
  };

  if (!hasDb()) {
    const r = fallback();
    return { ...r, page, pages: Math.max(1, Math.ceil(r.total / perPage)) };
  }

  try {
    await connectDB();
    const filter: Record<string, unknown> = { status: "published" };
    if (q.q) {
      const r = new RegExp(escapeRegex(q.q.slice(0, 80)), "i");
      filter.$or = [{ name: r }, { shortDescription: r }, { tags: r }, { titleEs: r }];
    }
    if (q.category) filter.category = String(q.category);
    if (q.min != null || q.max != null) {
      filter.price = { ...(q.min != null ? { $gte: q.min } : {}), ...(q.max != null ? { $lte: q.max } : {}) };
    }
    if (q.inStock) filter.stock = { $gt: 0 };
    if (q.sale) filter.onSale = true;
    if (q.flag === "new") filter.newArrival = true;
    if (q.flag === "best") filter.bestSeller = true;
    const [items, total] = await Promise.all([
      Product.find(filter).sort(mongoSort(q.sort)).skip((page - 1) * perPage).limit(perPage).lean(),
      Product.countDocuments(filter),
    ]);
    return { items: serialize<ProductDTO[]>(items), total, page, pages: Math.max(1, Math.ceil(total / perPage)) };
  } catch (e) {
    console.error("[data] queryProducts fallback:", (e as Error).message);
    const r = fallback();
    return { ...r, page, pages: Math.max(1, Math.ceil(r.total / perPage)) };
  }
}

export const getProduct = cache(async (slug: string): Promise<ProductDTO | null> =>
  withDb(
    () => Product.findOne({ slug: String(slug), status: "published" }).lean(),
    DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null,
  ),
);

export async function getProductsBySlugs(slugs: string[]): Promise<ProductDTO[]> {
  if (!slugs.length) return [];
  const safe = slugs.map(String).slice(0, 50);
  const list = await withDb<ProductDTO[]>(
    () => Product.find({ slug: { $in: safe }, status: "published" }).lean(),
    DEMO_PRODUCTS.filter((p) => safe.includes(p.slug)),
  );
  return safe.map((s) => list.find((p) => p.slug === s)).filter(Boolean) as ProductDTO[];
}

export async function getFeaturedProducts(slugs: string[] = [], limit = 5): Promise<ProductDTO[]> {
  if (slugs.length) {
    const picked = await getProductsBySlugs(slugs);
    if (picked.length) return picked.slice(0, limit);
  }
  return withDb(
    () => Product.find({ status: "published", featured: true }).sort({ createdAt: -1 }).limit(limit).lean(),
    DEMO_PRODUCTS.filter((p) => p.featured).slice(0, limit),
  );
}

export async function getRelatedProducts(p: ProductDTO, limit = 4): Promise<ProductDTO[]> {
  return withDb(
    () => Product.find({ status: "published", category: p.category, slug: { $ne: p.slug } }).limit(limit).lean(),
    DEMO_PRODUCTS.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, limit),
  );
}

export async function getSuggestedProducts(exclude: string[], limit = 4): Promise<ProductDTO[]> {
  return withDb(
    () => Product.find({ status: "published", slug: { $nin: exclude } }).sort({ soldCount: -1 }).limit(limit).lean(),
    DEMO_PRODUCTS.filter((x) => !exclude.includes(x.slug)).sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, limit),
  );
}

export async function getWholesaleProducts(): Promise<ProductDTO[]> {
  return withDb(
    () => Product.find({ status: "published", wholesalePrice: { $gt: 0 } }).sort({ category: 1, name: 1 }).limit(500).lean(),
    DEMO_PRODUCTS.filter((p) => (p.wholesalePrice ?? 0) > 0),
  );
}

export async function getSaleProducts(limit = 12): Promise<ProductDTO[]> {
  return withDb(
    () => Product.find({ status: "published", onSale: true }).sort({ createdAt: -1 }).limit(limit).lean(),
    DEMO_PRODUCTS.filter((p) => p.onSale).slice(0, limit),
  );
}

export function toCard(p: ProductDTO, locale: Locale): ProductCardData {
  const images = (p.images?.length ? p.images : [p.thumbnail]).filter(Boolean).map((i) => normalizeImageUrl(i));
  return {
    slug: p.slug,
    title: productTitle(p, locale),
    price: p.price,
    compareAtPrice: p.compareAtPrice && p.compareAtPrice > p.price ? p.compareAtPrice : undefined,
    image: normalizeImageUrl(p.thumbnail || images[0]),
    images: images.length ? images : [normalizeImageUrl()],
    rating: p.rating || 0,
    reviewCount: p.reviewCount || 0,
    stock: p.stock ?? 0,
    lowStockThreshold: p.lowStockThreshold ?? 5,
    isNew: Boolean(p.newArrival),
    shortDescription: p.shortDescription,
    variants: p.variants?.filter((v) => v.name && v.options?.length),
    wholesalePrice: p.wholesalePrice && p.wholesalePrice > 0 ? p.wholesalePrice : undefined,
    wholesaleMinQty: p.wholesaleMinQty && p.wholesaleMinQty > 0 ? p.wholesaleMinQty : undefined,
    customizable: Boolean(p.customizable),
    category: p.category,
    sku: p.sku,
  };
}

/* ---------------- Content ---------------- */
export const getTestimonials = cache(async (): Promise<TestimonialDTO[]> =>
  withDb(() => Testimonial.find({ active: true }).sort({ sortOrder: 1, createdAt: -1 }).lean(), DEMO_TESTIMONIALS),
);

export const getFaqs = cache(async (): Promise<FaqDTO[]> =>
  withDb(() => FAQ.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }).lean(), DEMO_FAQS),
);

export const getServices = cache(async (): Promise<ServiceDTO[]> => {
  const list = await withDb(() => Service.find({ active: true }).sort({ sortOrder: 1 }).lean(), DEMO_SERVICES);
  return list.length ? list : DEMO_SERVICES;
});

export const getTeam = cache(async (): Promise<TeamDTO[]> =>
  withDb(() => TeamMember.find({ active: true }).sort({ sortOrder: 1 }).lean(), []),
);

export const getOffers = cache(async (): Promise<OfferDTO[]> => {
  const now = new Date();
  return withDb(
    () =>
      SpecialOffer.find({
        active: true,
        $and: [
          { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
          { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        ],
      }).sort({ createdAt: -1 }).lean(),
    DEMO_OFFERS,
  );
});

export async function getBlogPosts(limit = 50, slugs: string[] = []): Promise<BlogDTO[]> {
  if (slugs.length) {
    const picked = await withDb(() => BlogPost.find({ slug: { $in: slugs }, status: "published" }).lean(), [] as BlogDTO[]);
    if (picked.length) return picked;
  }
  return withDb(
    () => BlogPost.find({ status: "published", publishedAt: { $lte: new Date() } }).sort({ publishedAt: -1 }).limit(limit).lean(),
    DEMO_BLOG.slice(0, limit),
  );
}

export const getBlogPost = cache(async (slug: string): Promise<BlogDTO | null> =>
  withDb(() => BlogPost.findOne({ slug: String(slug), status: "published" }).lean(), DEMO_BLOG.find((b) => b.slug === slug) ?? null),
);
