/**
 * Live update for the client's video feedback:
 *  - Adds the Team Jerseys collection (sports chips: soccer, baseball, basketball...)
 *  - Team jersey: one product with Gender / Sleeve / Style / Material options, youth + adult sizes, more colors
 *  - Kids jersey is hidden (set to draft); Youth is now an option on the main jersey
 *  - More garment colors on the T-shirt, sweatshirt and hoodie
 * Run: npx tsx --env-file=.env.local scripts/update-jerseys-colors.ts
 */
import mongoose from "mongoose";
import { Category, Product } from "../src/models";
import { APPAREL_COLORS, DEMO_CATEGORIES, JERSEY_OPTIONS } from "../src/lib/demo-data";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);

  const cat = DEMO_CATEGORIES.find((c) => c.slug === "team-jerseys")!;
  const c = await Category.updateOne({ slug: "team-jerseys" }, { $setOnInsert: cat }, { upsert: true });
  console.log(`team-jerseys collection: ${c.upsertedCount ? "added" : "already exists"}`);

  const j = await Product.updateOne({ slug: "custom-team-jersey-adult" }, {
    $set: {
      name: "Custom Team Jersey", titleEs: "Camiseta de Equipo Personalizada", category: "team-jerseys", subcategory: "soccer",
      variants: [
        ...JERSEY_OPTIONS,
        { name: "Size", options: ["YS", "YM", "YL", "YXL", "S", "M", "L", "XL", "2XL", "3XL"] },
        { name: "Color", options: APPAREL_COLORS },
      ],
    },
  });
  console.log(`team jersey: ${j.modifiedCount ? "updated" : j.matchedCount ? "already up to date" : "not found (run add-custom-products.ts first)"}`);

  const k = await Product.updateOne({ slug: "custom-team-jersey-kids" }, { $set: { status: "draft" } });
  console.log(`kids jersey: ${k.modifiedCount ? "hidden (draft)" : "already hidden or not found"}`);

  for (const slug of ["classic-cotton-t-shirt", "custom-crewneck-sweatshirt", "custom-pullover-hoodie"]) {
    const p = await Product.findOne({ slug });
    if (!p) { console.log(`${slug}: not found`); continue; }
    const others = (p.variants || []).filter((v) => !/colou?r/i.test(v.name || "")).map((v) => ({ name: v.name, options: v.options }));
    p.set("variants", [...others, { name: "Color", options: APPAREL_COLORS }]);
    await p.save();
    console.log(`${slug}: ${APPAREL_COLORS.length} colors`);
  }

  await mongoose.disconnect();
})();
