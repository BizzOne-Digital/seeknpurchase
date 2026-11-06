import "server-only";
import { connectDB } from "./db";
import { StoredUpload } from "@/models";

export const UPLOAD_FOLDERS = ["products", "gallery", "pages", "misc", "designs"] as const;
export type UploadFolder = (typeof UPLOAD_FOLDERS)[number];
export const ALLOWED_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const EXT_MIME: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" };
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const FILENAME_RE = /^[0-9]{10,16}-[a-f0-9]{8,32}\.(jpg|png|webp|gif)$/;

/** Checks the file's leading bytes so a renamed non-image can't pass as an image. */
export function sniffImage(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  const gif = buf.subarray(0, 6).toString("ascii");
  if (gif === "GIF87a" || gif === "GIF89a") return "image/gif";
  return null;
}

export function isUploadFolder(f: unknown): f is UploadFolder {
  return typeof f === "string" && (UPLOAD_FOLDERS as readonly string[]).includes(f);
}

export function isSafeFilename(name: string) {
  if (!name || name.includes("..") || name.includes("/") || name.includes("\\")) return false;
  return FILENAME_RE.test(name);
}

export function parseUploadUrl(url?: string | null): { folder: UploadFolder; filename: string } | null {
  if (!url || !url.startsWith("/api/uploads/")) return null;
  const parts = url.slice("/api/uploads/".length).split("?")[0].split("/");
  if (parts.length !== 2) return null;
  const [folder, filename] = parts;
  if (!isUploadFolder(folder) || !isSafeFilename(filename)) return null;
  return { folder, filename };
}

/** Deletes the StoredUpload behind an /api/uploads/... URL. No-op for any other URL. */
export async function deleteStoredUpload(url?: string | null) {
  const parsed = parseUploadUrl(url);
  if (!parsed) return false;
  await connectDB();
  const r = await StoredUpload.deleteOne({ folder: parsed.folder, filename: parsed.filename });
  return r.deletedCount > 0;
}

export async function deleteStoredUploads(urls: (string | null | undefined)[]) {
  const unique = [...new Set(urls.filter((u): u is string => Boolean(u)))];
  await Promise.all(unique.map((u) => deleteStoredUpload(u)));
}

/** Copies a stored upload to a new filename and returns the new URL (external URLs are returned as-is). */
export async function cloneStoredUpload(url?: string | null): Promise<string> {
  const parsed = parseUploadUrl(url);
  if (!parsed) return url || "";
  await connectDB();
  const src = await StoredUpload.findOne({ folder: parsed.folder, filename: parsed.filename }).lean();
  if (!src) return "";
  const { randomBytes } = await import("crypto");
  const ext = parsed.filename.split(".").pop();
  const filename = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  await StoredUpload.create({ folder: parsed.folder, filename, mimeType: src.mimeType, size: src.size, data: src.data });
  return `/api/uploads/${parsed.folder}/${filename}`;
}

/** Collect /api/uploads URLs from any nested value (strings, arrays, objects). */
export function collectUploadUrls(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    if (value.startsWith("/api/uploads/")) out.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => collectUploadUrls(v, out));
  } else if (value && typeof value === "object" && !(value instanceof Date)) {
    Object.values(value as Record<string, unknown>).forEach((v) => collectUploadUrls(v, out));
  }
  return out;
}

/** Delete uploads referenced in `before` that are no longer referenced in `after` (replace/remove). */
export async function cleanupReplacedUploads(before: unknown, after: unknown) {
  const keep = new Set(collectUploadUrls(after));
  await deleteStoredUploads(collectUploadUrls(before).filter((u) => !keep.has(u)));
}
