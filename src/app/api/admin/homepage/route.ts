import { z } from "zod";
import { handle, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { HomepageContent } from "@/models";
import { getHomepage } from "@/lib/data";
import { cleanupReplacedUploads } from "@/lib/uploads";

export const runtime = "nodejs";

const t = (max = 300) => z.string().trim().max(max).optional().default("");
const img = z.string().trim().max(600).refine((v) => !v || v.startsWith("/") || v.startsWith("https://"), "Invalid image URL").optional().default("");
const link = z.string().trim().max(300).refine((v) => !v || v.startsWith("/") || v.startsWith("https://"), "Links must start with / or https://").optional().default("");

const schema = z.object({
  announcements: z.array(z.object({ en: t(160), es: t(160) })).max(6),
  hero: z.object({
    titleLine1En: t(60), titleLine2En: t(60), titleLine3En: t(60), titleLine1Es: t(60), titleLine2Es: t(60), titleLine3Es: t(60),
    subtitleEn: t(400), subtitleEs: t(400), image: img,
    primaryLabelEn: t(40), primaryLabelEs: t(40), primaryLink: link,
    secondaryLabelEn: t(40), secondaryLabelEs: t(40), secondaryLink: link,
  }),
  categoryCards: z.array(z.object({ titleEn: t(60), titleEs: t(60), image: img, link })).max(8),
  featuredProductSlugs: z.array(z.string().trim().max(160)).max(10),
  about: z.object({ labelEn: t(60), labelEs: t(60), titleEn: t(160), titleEs: t(160), bodyEn: t(3000), bodyEs: t(3000), image: img }),
  blogSlugs: z.array(z.string().trim().max(160)).max(6),
  promo: z.object({ titleEn: t(120), titleEs: t(120), textEn: t(400), textEs: t(400), image: img }),
});

export const GET = handle(async () => {
  await requireAdmin();
  return ok({ item: await getHomepage() });
});

export const PUT = handle(async (req: Request) => {
  await requireAdmin();
  const data = schema.parse(await req.json());
  await connectDB();
  const before = await HomepageContent.findOne({ key: "main" }).lean();
  const after = await HomepageContent.findOneAndUpdate({ key: "main" }, { $set: data }, { upsert: true, new: true }).lean();
  await cleanupReplacedUploads(before, after);
  return ok({ success: true, item: after });
});
