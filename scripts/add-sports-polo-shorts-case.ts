/**
 * Live update: Polo, Athletic Shorts and Phone Case custom products, one jersey per sport,
 * and the soccer jersey renamed with its new photo. Existing products are only changed where noted.
 * Run: npx tsx --env-file=.env.local scripts/add-sports-polo-shorts-case.ts
 */
import mongoose from "mongoose";
import { Product } from "../src/models";
import { DEMO_PRODUCTS } from "../src/lib/demo-data";

const NEW = ["custom-polo-shirt", "custom-athletic-shorts", "custom-phone-case", "custom-baseball-jersey", "custom-basketball-jersey",
  "custom-football-jersey", "custom-softball-jersey", "custom-volleyball-jersey", "custom-hockey-jersey"];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const slug of NEW) {
    const p = DEMO_PRODUCTS.find((x) => x.slug === slug);
    if (!p) { console.log(`${slug}: missing in demo data`); continue; }
    const { createdAt, ...doc } = p;
    void createdAt;
    const r = await Product.updateOne({ slug }, { $setOnInsert: doc }, { upsert: true });
    console.log(`${slug}: ${r.upsertedCount ? "added" : "already exists"}`);
  }
  const s = await Product.updateOne({ slug: "custom-team-jersey-adult" }, {
    $set: { name: "Custom Soccer Jersey", titleEs: "Uniforme de Fútbol Personalizado", images: ["/images/sports/soccer.webp"], thumbnail: "", subcategory: "soccer" },
  });
  console.log(`soccer jersey: ${s.modifiedCount ? "updated" : s.matchedCount ? "already up to date" : "not found"}`);
  await mongoose.disconnect();
})();
