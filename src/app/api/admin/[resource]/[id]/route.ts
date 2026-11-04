import { isValidObjectId } from "mongoose";
import { handle, ok, requireAdmin, HttpError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { getResource, sanitize } from "@/lib/admin/registry";
import { cleanupReplacedUploads, cloneStoredUpload, collectUploadUrls, deleteStoredUploads } from "@/lib/uploads";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ resource: string; id: string }> };

async function load(ctx: Ctx) {
  await requireAdmin();
  const { resource, id } = await ctx.params;
  if (!isValidObjectId(id)) throw new HttpError(400, "Invalid id");
  const r = getResource(resource);
  await connectDB();
  const doc = await r.model.findById(id);
  if (!doc) throw new HttpError(404, "Not found");
  return { ...r, key: resource, doc };
}

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  const { doc } = await load(ctx);
  return ok({ item: doc.toObject() });
});

/** PUT — full update from the edit form. Removed/replaced images are deleted from StoredUpload. */
export const PUT = handle(async (req: Request, ctx: Ctx) => {
  const { def, doc, key } = await load(ctx);
  const before = doc.toObject();
  const data = sanitize(def, await req.json());
  if (key === "products" && !data.thumbnail && Array.isArray(data.images) && data.images[0]) data.thumbnail = data.images[0];
  if (key === "coupons" && typeof data.code === "string") data.code = data.code.toUpperCase().replace(/\s+/g, "");
  doc.set(data);
  await doc.save();
  const after = doc.toObject();
  await cleanupReplacedUploads(before, after);
  return ok({ success: true, item: after });
});

/** PATCH — quick actions: toggle publish/active, change sortOrder, change status. */
export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  const { def, doc } = await load(ctx);
  const body = (await req.json()) as Record<string, unknown>;
  const allowed = new Set([def.quickToggle?.field, def.sortable ? "sortOrder" : undefined, "status"].filter(Boolean) as string[]);
  const partial = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.has(k)));
  doc.set(sanitize(def, partial, true));
  await doc.save();
  return ok({ success: true, item: doc.toObject() });
});

/** DELETE — removes the document and every StoredUpload it referenced. */
export const DELETE = handle(async (_req: Request, ctx: Ctx) => {
  const { doc } = await load(ctx);
  const urls = collectUploadUrls(doc.toObject());
  await doc.deleteOne();
  await deleteStoredUploads(urls);
  return ok({ success: true });
});

/** POST — duplicate (products). Copies image URLs; the copy is created as a draft. */
export const POST = handle(async (_req: Request, ctx: Ctx) => {
  const { def, doc, model } = await load(ctx);
  if (!def.canDuplicate) throw new HttpError(405, "Duplicate is not supported for this resource");
  const src = doc.toObject() as Record<string, unknown>;
  delete src._id;
  delete src.createdAt;
  delete src.updatedAt;
  const base = slugify(String(src.slug || src.name || "copy"));
  let slug = `${base}-copy`;
  for (let i = 2; await model.exists({ slug }); i++) slug = `${base}-copy-${i}`;
  // Clone stored images so each product owns its files (deleting one never breaks the other).
  const images = await Promise.all(((src.images as string[]) || []).map((u) => cloneStoredUpload(u)));
  const thumbIdx = ((src.images as string[]) || []).indexOf(String(src.thumbnail || ""));
  const thumbnail = thumbIdx >= 0 ? images[thumbIdx] : await cloneStoredUpload(String(src.thumbnail || ""));
  const copy = await model.create({
    ...src, name: `${src.name} (Copy)`, slug, sku: src.sku ? `${src.sku}-COPY` : undefined, status: "draft",
    images: images.filter(Boolean), thumbnail, soldCount: 0,
  });
  return ok({ success: true, item: copy.toObject() }, 201);
});
