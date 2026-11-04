import { handle, ok } from "@/lib/api";
import { contactSchema } from "@/lib/validation";
import { connectDB } from "@/lib/db";
import { ContactSubmission } from "@/models";
import { notifyTeam } from "@/lib/notify";

export const runtime = "nodejs";

export const POST = handle(async (req: Request) => {
  const { website, ...data } = contactSchema.parse(await req.json());
  if (website) return ok({ success: true }); // bot honeypot
  await connectDB();
  const doc = await ContactSubmission.create(data);
  await notifyTeam("contact", { id: String(doc._id), ...data });
  return ok({ success: true }, 201);
});
