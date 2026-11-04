/**
 * Replaces old Unsplash image URLs in MongoDB with the local /images/... files.
 * Only fields that still contain "unsplash" are changed. Everything else is left alone.
 *   npx tsx --env-file=.env.local scripts/replace-stock-images.ts          (dry run, shows changes)
 *   npx tsx --env-file=.env.local scripts/replace-stock-images.ts --apply  (writes changes)
 */
import mongoose from "mongoose";
import { BlogPost, Category, HomepageContent, Product, Service, SiteSettings, SpecialOffer, Testimonial } from "../src/models";
import {
  DEFAULT_HOMEPAGE, DEFAULT_SETTINGS, DEMO_BLOG, DEMO_CATEGORIES, DEMO_OFFERS, DEMO_PRODUCTS, DEMO_SERVICES,
} from "../src/lib/demo-data";

const APPLY = process.argv.includes("--apply");
const isStock = (v: unknown) => typeof v === "string" && v.includes("unsplash.com");
const unresolved: string[] = [];

/** Walks a DB value alongside its demo counterpart; returns the replaced value. */
function swap(db: unknown, demo: unknown, path: string, changes: string[]): unknown {
  if (isStock(db)) {
    if (typeof demo === "string" && demo.startsWith("/images/")) {
      changes.push(`${path}: -> ${demo}`);
      return demo;
    }
    unresolved.push(path);
    return db;
  }
  if (Array.isArray(db)) return db.map((v, i) => swap(v, Array.isArray(demo) ? demo[i] ?? demo[0] : undefined, `${path}[${i}]`, changes));
  if (db && typeof db === "object" && !(db instanceof Date) && !(db instanceof mongoose.Types.ObjectId)) {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(db)) out[k] = swap(v, (demo as Record<string, unknown> | undefined)?.[k], `${path}.${k}`, changes);
    return out;
  }
  return db;
}

async function fix(model: mongoose.Model<any>, fields: string[], label: (d: any) => string, demoFor: (d: any) => unknown) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const docs = await model.find({}).lean();
  let n = 0;
  for (const d of docs) {
    const demo = demoFor(d) as Record<string, unknown> | undefined;
    const set: Record<string, unknown> = {};
    const changes: string[] = [];
    for (const f of fields) {
      if (!(f in d)) continue;
      const next = swap((d as Record<string, unknown>)[f], demo?.[f], `${model.modelName}(${label(d)}).${f}`, changes);
      if (changes.length && JSON.stringify(next) !== JSON.stringify((d as Record<string, unknown>)[f])) set[f] = next;
    }
    if (!Object.keys(set).length) continue;
    n++;
    changes.forEach((c) => console.log("  " + c));
    if (APPLY) await model.updateOne({ _id: d._id }, { $set: set });
  }
  console.log(`${model.modelName}: ${n} document(s) ${APPLY ? "updated" : "to update"}`);
}

async function main() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI missing (.env.local)");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(APPLY ? "APPLY mode: writing changes\n" : "DRY RUN: nothing is written. Add --apply to save.\n");

  await fix(Product, ["images", "thumbnail"], (d) => d.slug, (d) => DEMO_PRODUCTS.find((p) => p.slug === d.slug));
  await fix(Category, ["image"], (d) => d.slug, (d) => DEMO_CATEGORIES.find((c) => c.slug === d.slug));
  await fix(BlogPost, ["featuredImage"], (d) => d.slug, (d) => DEMO_BLOG.find((b) => b.slug === d.slug));
  await fix(Service, ["image"], (d) => d.titleEn, (d) => DEMO_SERVICES.find((s) => s.titleEn === d.titleEn));
  await fix(SpecialOffer, ["image"], (d) => d.title, (d) => DEMO_OFFERS.find((o) => o.title === d.title));
  await fix(SiteSettings, ["seo", "logo", "favicon"], () => "main", () => DEFAULT_SETTINGS);
  await fix(HomepageContent, ["hero", "categoryCards", "about", "promo"], () => "main", () => DEFAULT_HOMEPAGE);

  // Testimonial avatars: stock faces are removed (the site shows initials instead).
  const t = await Testimonial.find({ avatar: /unsplash\.com/ }).lean();
  t.forEach((d) => console.log(`  Testimonial(${d.name}).avatar: removed`));
  if (APPLY && t.length) await Testimonial.updateMany({ avatar: /unsplash\.com/ }, { $unset: { avatar: 1 } });
  console.log(`Testimonial: ${t.length} avatar(s) ${APPLY ? "removed" : "to remove"}`);

  if (unresolved.length) {
    console.log("\nNo local image found for these (left unchanged; replace in Admin):");
    unresolved.forEach((u) => console.log("  " + u));
  }
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
