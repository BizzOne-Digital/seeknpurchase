// Writes a reviewable mapping only. This script never imports or connects to MongoDB.
import { writeFileSync } from "node:fs";
import { DEFAULT_HOMEPAGE, DEFAULT_SETTINGS, DEMO_BLOG, DEMO_CATEGORIES, DEMO_OFFERS, DEMO_PRODUCTS, DEMO_TESTIMONIALS } from "../src/lib/demo-data";

writeFileSync("scripts/image-record-updates.json", JSON.stringify({
  note: "Manual reference only; no records have been changed. Update existing records by slug/key/title, never reseed. Also replace thumbnail fields if they still contain stock URLs.",
  products: DEMO_PRODUCTS.map(({ slug, images }) => ({ match: { slug }, set: { images, thumbnail: images?.[0] } })),
  categories: DEMO_CATEGORIES.map(({ slug, image }) => ({ match: { slug }, set: { image } })),
  blogPosts: DEMO_BLOG.map(({ slug, featuredImage }) => ({ match: { slug }, set: { featuredImage } })),
  homepageContent: { match: { key: "main" }, set: {
    "hero.image": DEFAULT_HOMEPAGE.hero.image,
    "about.image": DEFAULT_HOMEPAGE.about.image,
    "promo.image": DEFAULT_HOMEPAGE.promo.image,
    categoryCardImages: DEFAULT_HOMEPAGE.categoryCards.map(({ link, image }) => ({ matchByLink: link, image })),
  } },
  specialOffers: DEMO_OFFERS.map(({ title, image }) => ({ match: { title }, set: { image } })),
  siteSettings: { match: { key: "main" }, set: { "seo.ogImage": DEFAULT_SETTINGS.seo.ogImage } },
  testimonials: DEMO_TESTIMONIALS.map(({ name }) => ({ match: { name }, unset: ["avatar"], note: "Optional cleanup; the storefront always renders initials." })),
}, null, 2) + "\n");
