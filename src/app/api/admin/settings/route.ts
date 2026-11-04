import { z } from "zod";
import { handle, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { SiteSettings } from "@/models";
import { getSettings } from "@/lib/data";
import { cleanupReplacedUploads } from "@/lib/uploads";

export const runtime = "nodejs";

const s = (max = 300) => z.string().trim().max(max).optional().default("");
const url = z.string().trim().max(600).refine((v) => !v || v.startsWith("/") || v.startsWith("https://"), "Must be a site path or https URL").optional().default("");
const num = z.coerce.number().min(0).max(100000);

const schema = z.object({
  businessName: z.string().trim().min(1).max(80),
  tagline: s(120),
  logo: url,
  favicon: url,
  email: z.string().trim().email().max(160),
  phone: s(40),
  address: s(400),
  social: z.object({ instagram: url, facebook: url, tiktok: url, pinterest: url, youtube: url }),
  seo: z.object({ defaultTitle: s(160), defaultDescription: s(400), ogImage: url }),
  store: z.object({
    currency: z.string().trim().length(3).toUpperCase(),
    standardShipping: num,
    expressShipping: num,
    freeShippingThreshold: num,
    taxRate: z.coerce.number().min(0).max(30),
  }),
});

export const GET = handle(async () => {
  await requireAdmin();
  return ok({ item: await getSettings() });
});

export const PUT = handle(async (req: Request) => {
  await requireAdmin();
  const data = schema.parse(await req.json());
  await connectDB();
  const before = await SiteSettings.findOne({ key: "main" }).lean();
  const after = await SiteSettings.findOneAndUpdate({ key: "main" }, { $set: data }, { upsert: true, new: true }).lean();
  await cleanupReplacedUploads(before, after);
  return ok({ success: true, item: after });
});
