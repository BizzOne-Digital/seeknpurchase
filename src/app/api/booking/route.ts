import { handle, ok } from "@/lib/api";
import { bookingSchema } from "@/lib/validation";
import { connectDB } from "@/lib/db";
import { BookingRequest } from "@/models";
import { notifyTeam } from "@/lib/notify";

export const runtime = "nodejs";

export const POST = handle(async (req: Request) => {
  const { website, ...data } = bookingSchema.parse(await req.json());
  if (website) return ok({ success: true });
  await connectDB();
  const doc = await BookingRequest.create(data);
  await notifyTeam("booking", { id: String(doc._id), ...data });
  return ok({ success: true }, 201);
});
