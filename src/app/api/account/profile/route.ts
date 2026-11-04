import bcrypt from "bcryptjs";
import { z } from "zod";
import { handle, ok, requireCustomer, HttpError } from "@/lib/api";
import { email, password } from "@/lib/validation";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models";
import { CUSTOMER_COOKIE, setSessionCookie, signSession } from "@/lib/auth";

export const runtime = "nodejs";

const profileSchema = z.object({ name: z.string().trim().min(1).max(120), email, phone: z.string().trim().max(40).optional().default("") });
const passwordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: password });

export const GET = handle(async () => {
  const s = await requireCustomer();
  await connectDB();
  const c = await Customer.findById(s.sub).lean();
  if (!c) throw new HttpError(404, "Account not found");
  return ok({ name: c.name, email: c.email, phone: c.phone || "" });
});

export const PUT = handle(async (req: Request) => {
  const s = await requireCustomer();
  const body = await req.json();
  await connectDB();

  if (body?.action === "password") {
    const d = passwordSchema.parse(body);
    const c = await Customer.findById(s.sub).select("+passwordHash");
    if (!c || !(await bcrypt.compare(d.currentPassword, c.passwordHash))) throw new HttpError(400, "Current password is incorrect.");
    c.passwordHash = await bcrypt.hash(d.newPassword, 12);
    await c.save();
    return ok({ success: true });
  }

  const d = profileSchema.parse(body);
  const taken = await Customer.exists({ email: d.email, _id: { $ne: s.sub } });
  if (taken) throw new HttpError(409, "This email is already used by another account.");
  const c = await Customer.findByIdAndUpdate(s.sub, { $set: d }, { new: true });
  if (!c) throw new HttpError(404, "Account not found");
  await setSessionCookie(CUSTOMER_COOKIE, await signSession({ sub: String(c._id), role: "customer", email: c.email, name: c.name }));
  return ok({ success: true });
});
