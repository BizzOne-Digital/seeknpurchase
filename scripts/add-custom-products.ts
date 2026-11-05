/** Adds any customizable demo products missing from MongoDB. Existing products are not changed.
 *   npx tsx --env-file=.env.local scripts/add-custom-products.ts */
import mongoose from "mongoose";
import { Product } from "../src/models";
import { DEMO_PRODUCTS } from "../src/lib/demo-data";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const { createdAt, ...p } of DEMO_PRODUCTS.filter((x) => x.customizable)) {
    void createdAt;
    const r = await Product.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true });
    console.log(`${p.slug}: ${r.upsertedCount ? "added" : "already exists"}`);
  }
  await mongoose.disconnect();
})();
