/** Puts sample wholesale prices on the custom products so the Wholesale catalog is not empty.
 *  Only products with no wholesale price yet are changed. Prices can be edited in Admin > Products.
 *  Run: npx tsx --env-file=.env.local scripts/set-wholesale-prices.ts */
import mongoose from "mongoose";
import { Product } from "../src/models";
import { WHOLESALE_SAMPLE } from "../src/lib/demo-data";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const [slug, [wholesalePrice, wholesaleMinQty]] of Object.entries(WHOLESALE_SAMPLE)) {
    const r = await Product.updateOne(
      { slug, $or: [{ wholesalePrice: { $exists: false } }, { wholesalePrice: null }, { wholesalePrice: 0 }] },
      { $set: { wholesalePrice, wholesaleMinQty } },
    );
    console.log(`${slug}: ${r.modifiedCount ? `wholesale $${wholesalePrice} (min ${wholesaleMinQty})` : "skipped (missing or already set)"}`);
  }
  await mongoose.disconnect();
})();
