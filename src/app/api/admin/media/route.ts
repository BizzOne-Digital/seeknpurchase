import { handle, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/models";
import { isUploadFolder } from "@/lib/uploads";

export const runtime = "nodejs";

/** Lists StoredUpload metadata only (never the binary data). */
export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const url = new URL(req.url);
  const folder = url.searchParams.get("folder");
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = 48;
  const filter = isUploadFolder(folder) ? { folder } : {};
  await connectDB();
  const [items, total, usage] = await Promise.all([
    StoredUpload.find(filter).select("-data").sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    StoredUpload.countDocuments(filter),
    StoredUpload.aggregate([{ $group: { _id: null, bytes: { $sum: "$size" }, count: { $sum: 1 } } }]),
  ]);
  return ok({
    items: items.map((i) => ({ ...i, url: `/api/uploads/${i.folder}/${i.filename}` })),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    usage: usage[0] ? { bytes: usage[0].bytes, count: usage[0].count } : { bytes: 0, count: 0 },
  });
});
