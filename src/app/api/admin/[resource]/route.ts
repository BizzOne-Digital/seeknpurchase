import { handle, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getResource, sanitize } from "@/lib/admin/registry";
import { escapeRegex } from "@/lib/utils";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ resource: string }> };

/** GET /api/admin/:resource?q=&page=&limit= — paginated list */
export const GET = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { def, model } = getResource((await ctx.params).resource);
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "25", 10) || 25));
  await connectDB();
  const filter = q ? { $or: def.search.map((f) => ({ [f]: new RegExp(escapeRegex(q), "i") })) } : {};
  const [items, total] = await Promise.all([
    model.find(filter).sort(def.sort).skip((page - 1) * limit).limit(limit).lean(),
    model.countDocuments(filter),
  ]);
  return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});

/** POST /api/admin/:resource — create */
export const POST = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const key = (await ctx.params).resource;
  const { def, model } = getResource(key);
  if (def.canCreate === false) return ok({ success: false, error: "Not allowed" }, 405);
  const data = sanitize(def, await req.json());
  if (key === "products" && !data.thumbnail && Array.isArray(data.images) && data.images[0]) data.thumbnail = data.images[0];
  if (key === "coupons" && typeof data.code === "string") data.code = data.code.toUpperCase().replace(/\s+/g, "");
  await connectDB();
  const doc = await model.create(data);
  return ok({ success: true, item: doc.toObject() }, 201);
});
