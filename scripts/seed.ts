/**
 * Seeds MongoDB with the starter catalog/content and creates the first admin.
 *   npm run seed            (reads .env.local)
 * Safe to re-run: existing records (matched by slug/email/question) are left untouched.
 */
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import {
  Admin, BlogPost, Category, FAQ, HomepageContent, Product, Service, SiteSettings, SpecialOffer, Testimonial,
} from "../src/models";
import {
  DEFAULT_HOMEPAGE, DEFAULT_SETTINGS, DEMO_BLOG, DEMO_CATEGORIES, DEMO_FAQS, DEMO_OFFERS, DEMO_PRODUCTS, DEMO_SERVICES, DEMO_TESTIMONIALS,
} from "../src/lib/demo-data";

async function upsert<T extends object>(model: mongoose.Model<any>, key: keyof T, docs: T[]) { // eslint-disable-line @typescript-eslint/no-explicit-any
  let n = 0;
  for (const [i, d] of docs.entries()) {
    const r = await model.updateOne({ [key]: d[key] }, { $setOnInsert: { sortOrder: i, ...d } }, { upsert: true });
    n += r.upsertedCount;
  }
  console.log(`  ${model.modelName}: ${n} inserted`);
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing (.env.local)");
  await mongoose.connect(uri);
  console.log("Connected. Seeding…");

  await upsert(Category, "slug", DEMO_CATEGORIES);
  await upsert(Product, "slug", DEMO_PRODUCTS.map(({ createdAt, ...p }) => { void createdAt; return p; }));
  await upsert(Testimonial, "name", DEMO_TESTIMONIALS);
  await upsert(FAQ, "questionEn", DEMO_FAQS);
  await upsert(BlogPost, "slug", DEMO_BLOG.map((b) => ({ ...b, status: "published", publishedAt: new Date(b.publishedAt) })));
  await upsert(Service, "titleEn", DEMO_SERVICES);
  await upsert(SpecialOffer, "title", DEMO_OFFERS);
  await SiteSettings.updateOne({ key: "main" }, { $setOnInsert: { key: "main", ...DEFAULT_SETTINGS } }, { upsert: true });
  await HomepageContent.updateOne({ key: "main" }, { $setOnInsert: { key: "main", ...DEFAULT_HOMEPAGE } }, { upsert: true });

  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 8) throw new Error("ADMIN_PASSWORD must be at least 8 characters");
    const exists = await Admin.exists({ email });
    if (!exists) {
      await Admin.create({ name: "Store Admin", email, role: "owner", passwordHash: await bcrypt.hash(password, 12) });
      console.log(`  Admin created: ${email}`);
    } else console.log(`  Admin exists: ${email} (unchanged)`);
  } else {
    console.log("  ADMIN_EMAIL / ADMIN_PASSWORD not set — no admin created.");
  }

  await StoredUploadIndexes();
  await mongoose.disconnect();
  console.log("Done.");
}

async function StoredUploadIndexes() {
  const { StoredUpload } = await import("../src/models");
  await StoredUpload.syncIndexes();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
