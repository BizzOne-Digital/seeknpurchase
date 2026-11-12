/**
 * One-time live update:
 *  - Seasonal Sale offer: remove "Up to 25%" and update its text
 *  - Add the Western Hats and Summer Hats collections (only if missing)
 *  - Add Color options to the T-shirt, sweatshirt, hoodie and cup
 * Run: npx tsx --env-file=.env.local scripts/update-hats-colors-offer.ts
 */
import mongoose from "mongoose";
import { Category, Product, SpecialOffer } from "../src/models";
import { DEMO_CATEGORIES } from "../src/lib/demo-data";

const APPAREL = ["White", "Black", "Navy", "Heather Gray", "Red", "Forest Green"];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);

  const o = await SpecialOffer.updateOne({ title: /^Seasonal Sale/ }, {
    $set: {
      title: "Seasonal Sale", titleEs: "Venta de Temporada", discountValue: 0,
      description: "Fresh styles at special prices. Discover limited-time savings on selected bags, knitwear and jewelry.",
      descriptionEs: "Nuevos estilos a precios especiales. Descubre ahorros por tiempo limitado en bolsos, tejidos y joyería seleccionados.",
    },
  });
  console.log(`Seasonal Sale offer: ${o.modifiedCount ? "updated" : o.matchedCount ? "already up to date" : "not found"}`);

  for (const slug of ["western-hats", "summer-hats"]) {
    const c = DEMO_CATEGORIES.find((x) => x.slug === slug)!;
    const r = await Category.updateOne({ slug }, { $setOnInsert: c }, { upsert: true });
    console.log(`${slug}: ${r.upsertedCount ? "added" : "already exists"}`);
  }

  const setColor = async (slug: string, options: string[]) => {
    const p = await Product.findOne({ slug });
    if (!p) return console.log(`${slug}: not found`);
    const others = (p.variants || []).filter((v) => !/colou?r/i.test(v.name || "")).map((v) => ({ name: v.name, options: v.options }));
    p.set("variants", [...others, { name: "Color", options }]);
    await p.save();
    console.log(`${slug}: ${options.length} colors`);
  };
  for (const slug of ["classic-cotton-t-shirt", "custom-crewneck-sweatshirt", "custom-pullover-hoodie"]) await setColor(slug, APPAREL);
  await setColor("custom-ceramic-cup", ["White", "Black"]);

  await mongoose.disconnect();
})();
