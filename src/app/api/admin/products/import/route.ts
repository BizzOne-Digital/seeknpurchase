import { z } from "zod";
import { HttpError, handle, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Product } from "@/models";
import { parseCsv } from "@/lib/csv";
import { formatTiers, parseTiers } from "@/lib/tiers";

export const runtime = "nodejs";

const MAX_ROWS = 2000;
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
const num = (v: string | undefined) => (v === undefined || v.trim() === "" ? undefined : Number(v.replace(/[$,\s]/g, "")));

/** POST { csv } — creates or updates products by slug. Only columns present in the file are changed. */
export const POST = handle(async (req: Request) => {
  await requireAdmin();
  const { csv } = z.object({ csv: z.string().min(1).max(5_000_000) }).parse(await req.json());
  const rows = parseCsv(csv);
  if (rows.length < 2) throw new HttpError(400, "The file has no product rows.");
  const header = rows[0].map((h) => h.trim().toLowerCase().replace(/[\s-]+/g, "_"));
  if (!header.includes("name") && !header.includes("slug")) throw new HttpError(400, 'The file needs a "name" or "slug" column.');
  if (rows.length - 1 > MAX_ROWS) throw new HttpError(400, `Import up to ${MAX_ROWS} products at a time.`);

  await connectDB();
  let created = 0, updated = 0;
  const errors: { row: number; error: string }[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r: Record<string, string> = {};
    header.forEach((h, j) => { r[h] = (rows[i][j] ?? "").trim(); });
    if (Object.values(r).every((v) => !v)) continue;
    try {
      const slug = slugify(r.slug || r.name || "");
      if (!slug) throw new Error("Missing name or slug");
      const set: Record<string, unknown> = {};
      const str = (key: string, col = key, max = 5000) => { if (col in r && r[col] !== "") set[key] = r[col].slice(0, max); };
      const money = (key: string, col: string) => {
        if (!(col in r) || r[col] === "") return;
        const n = num(r[col]);
        if (n === undefined || !Number.isFinite(n) || n < 0) throw new Error(`"${col}" must be a positive number`);
        set[key] = Math.round(n * 100) / 100;
      };
      const int = (key: string, col: string, min = 0) => {
        if (!(col in r) || r[col] === "") return;
        const n = num(r[col]);
        if (n === undefined || !Number.isInteger(n) || n < min) throw new Error(`"${col}" must be a whole number`);
        set[key] = n;
      };
      str("name", "name", 200); str("sku", "sku", 80); str("category", "category", 120);
      str("shortDescription", "short_description", 500); str("description", "description");
      money("price", "price"); money("compareAtPrice", "compare_at_price");
      money("wholesalePrice", "wholesale_price"); int("wholesaleMinQty", "wholesale_min_qty", 1); int("stock", "stock");
      money("cost", "cost");
      if ("price_tiers" in r) set.priceTiers = formatTiers(parseTiers(r.price_tiers));
      if (r.status) {
        if (!["published", "draft"].includes(r.status.toLowerCase())) throw new Error('"status" must be published or draft');
        set.status = r.status.toLowerCase();
      }
      const images = (r.images || r.image || "").split(/[|;]/).map((u) => u.trim()).filter(Boolean);
      if (images.length) {
        if (images.some((u) => !/^https:\/\//.test(u) && !u.startsWith("/"))) throw new Error("Image links must start with https://");
        set.images = images.slice(0, 20);
      }
      if (r.tags) set.tags = r.tags.split(/[|;,]/).map((t) => t.trim()).filter(Boolean).slice(0, 30);

      const exists = await Product.exists({ slug });
      if (!exists) {
        if (!set.name) throw new Error("New products need a name");
        if (set.price === undefined) throw new Error("New products need a price");
      }
      await Product.updateOne({ slug }, { $set: set, $setOnInsert: { slug } }, { upsert: true, runValidators: true });
      if (exists) updated++; else created++;
    } catch (e) {
      if (errors.length < 50) errors.push({ row: i + 1, error: (e as Error).message });
    }
  }
  return ok({ success: true, created, updated, failed: errors.length, errors });
});
