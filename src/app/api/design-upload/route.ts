import { randomBytes } from "crypto";
import { fail, handle, ok } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/models";
import { ALLOWED_MIME, sniffImage } from "@/lib/uploads";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const MAX_BYTES = 4 * 1024 * 1024; // stays under Vercel's 4.5MB request limit
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Public upload for customer designs. Raster images only, so no scripts can be stored (no SVG). */
export const POST = handle(async (req: Request) => {
  if (!rateLimit(`design:${clientIp(req)}`, 15, 60 * 60 * 1000)) return fail("Too many uploads. Please try again later.", 429);
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES + 64 * 1024) return fail("The file must be under 4MB.", 413);

  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || file.size <= 0) return fail("No file provided.", 400);
  if (!ALLOWED.includes(file.type)) return fail("Please use a PNG, JPG or WEBP file.", 415);
  if (file.size > MAX_BYTES) return fail("The file must be under 4MB.", 413);

  const data = Buffer.from(await file.arrayBuffer());
  if (sniffImage(data) !== file.type) return fail("This file is not a valid image.", 415);

  const filename = `${Date.now()}-${randomBytes(8).toString("hex")}.${ALLOWED_MIME[file.type]}`;
  await connectDB();
  await StoredUpload.create({ folder: "designs", filename, mimeType: file.type, size: data.length, data });
  return ok({ success: true, url: `/api/uploads/designs/${filename}` });
});
