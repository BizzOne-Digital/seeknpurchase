import { connectDB } from "@/lib/db";
import { StoredUpload } from "@/models";
import { isSafeFilename, isUploadFolder } from "@/lib/uploads";

export const runtime = "nodejs";

function placeholder() {
  // Redirect to the static placeholder so <img>/<Image> still render something sensible.
  return new Response(null, { status: 307, headers: { Location: "/images/placeholder.svg", "Cache-Control": "public, max-age=60" } });
}

export async function GET(_req: Request, ctx: { params: Promise<{ folder: string; filename: string }> }) {
  const { folder, filename: raw } = await ctx.params;
  const filename = decodeURIComponent(raw);

  if (!isUploadFolder(folder)) return new Response("Not found", { status: 404 });
  if (filename.includes("..") || filename.includes("/") || filename.includes("\\") || !isSafeFilename(filename)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    await connectDB();
    const doc = await StoredUpload.findOne({ folder, filename }).lean();
    if (!doc) return placeholder();
    const body = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from((doc.data as unknown as { buffer: ArrayBuffer }).buffer);
    return new Response(new Uint8Array(body), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Length": String(body.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error("[uploads] read failed", (e as Error).message);
    return placeholder();
  }
}
