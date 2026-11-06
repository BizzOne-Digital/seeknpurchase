import { randomBytes } from "crypto";
import { fail, handle, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/models";
import { ALLOWED_MIME, MAX_UPLOAD_BYTES, deleteStoredUpload, isUploadFolder, sniffImage } from "@/lib/uploads";

export const runtime = "nodejs";

export const POST = handle(async (req: Request) => {
  // 1–2. Admin only; never trust client-side role checks.
  await requireAdmin();

  const len = Number(req.headers.get("content-length") || 0);
  if (len > MAX_UPLOAD_BYTES + 1024 * 64) return fail("File is too large. Maximum size is 8MB.", 413);

  const form = await req.formData();
  const file = form.get("file");
  const folder = form.get("folder");

  // 3. Folder whitelist.
  if (!isUploadFolder(folder) || folder === "designs") return fail("Invalid folder. Allowed: products, gallery, pages, misc.", 400);
  if (!(file instanceof File)) return fail("No file provided.", 400);

  // 4–5. MIME + size validation.
  const ext = ALLOWED_MIME[file.type];
  if (!ext) return fail("Unsupported file type. Use PNG, JPEG, WEBP or GIF.", 415);
  if (file.size <= 0) return fail("The file is empty.", 400);
  if (file.size > MAX_UPLOAD_BYTES) return fail("File is too large. Maximum size is 8MB.", 413);

  // 6. Buffer + content sniffing.
  const data = Buffer.from(await file.arrayBuffer());
  const real = sniffImage(data);
  if (!real || real !== file.type) return fail("The file content does not match a supported image format.", 415);

  // 7. Secure unique filename: `${Date.now()}-${randomHex}.${ext}`
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;

  // 8. Persist binary in MongoDB (never on disk).
  await connectDB();
  await StoredUpload.create({ folder, filename, mimeType: real, size: data.length, data });

  // 9. Respond with the public URL.
  return ok({ success: true, url: `/api/uploads/${folder}/${filename}`, filename, size: data.length, folder });
});

/** DELETE /api/upload?url=/api/uploads/<folder>/<filename> — admin only. */
export const DELETE = handle(async (req: Request) => {
  await requireAdmin();
  const url = new URL(req.url).searchParams.get("url");
  const deleted = await deleteStoredUpload(url);
  return ok({ success: true, deleted });
});
