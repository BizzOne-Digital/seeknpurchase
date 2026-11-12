/** Sets the sample "buy more, save more" tiers on the two team jerseys (only if they have none yet).
 *  Run: npx tsx --env-file=.env.local scripts/set-jersey-tiers.ts */
import mongoose from "mongoose";
import { Product } from "../src/models";

const TIERS: Record<string, string> = {
  "custom-team-jersey-adult": "10=22.99, 25=19.99, 50=17.99",
  "custom-team-jersey-kids": "10=17.99, 25=15.99, 50=13.99",
};

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
  for (const [slug, priceTiers] of Object.entries(TIERS)) {
    const r = await Product.updateOne({ slug, $or: [{ priceTiers: { $exists: false } }, { priceTiers: "" }] }, { $set: { priceTiers } });
    console.log(`${slug}: ${r.modifiedCount ? "tiers added" : "skipped (missing or already has tiers)"}`);
  }
  await mongoose.disconnect();
})();
