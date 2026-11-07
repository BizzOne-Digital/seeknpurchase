/** Points the 5 custom products at their real photos, only if they still use the placeholder SVG.
 *   npx tsx --env-file=.env.local scripts/set-custom-product-images.ts */
import { existsSync } from "fs";
import mongoose from "mongoose";
import { Product } from "../src/models";

const SLUGS = ["custom-crewneck-sweatshirt", "custom-pullover-hoodie", "custom-canvas-tote-bag", "custom-ceramic-cup", "custom-baseball-cap"];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const slug of SLUGS) {
    const url = `/images/products/${slug}-1.webp`;
    if (!existsSync(`public${url}`)) { console.log(`${slug}: photo missing, skipped`); continue; }
    const r = await Product.updateOne({ slug, images: { $regex: "^/images/custom/" } }, { $set: { images: [url] } });
    console.log(`${slug}: ${r.modifiedCount ? "updated" : "unchanged (already custom image)"}`);
  }
  await mongoose.disconnect();
})();
