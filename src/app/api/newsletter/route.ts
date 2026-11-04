import { z } from "zod";
import { handle, ok } from "@/lib/api";
import { email } from "@/lib/validation";
import { connectDB } from "@/lib/db";
import { NewsletterSubscriber } from "@/models";

export const runtime = "nodejs";

export const POST = handle(async (req: Request) => {
  const body = z.object({ email, source: z.string().max(40).optional() }).parse(await req.json());
  await connectDB();
  await NewsletterSubscriber.updateOne(
    { email: body.email },
    { $set: { active: true }, $setOnInsert: { email: body.email, source: body.source || "website" } },
    { upsert: true },
  );
  return ok({ success: true });
});
