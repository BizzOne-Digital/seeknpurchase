import bcrypt from "bcryptjs";
import { fail, handle, ok, HttpError } from "@/lib/api";
import { loginSchema, registerSchema } from "@/lib/validation";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models";
import { CUSTOMER_COOKIE, clearSessionCookie, setSessionCookie, signSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Compared against when the email is unknown so response time does not reveal account existence.
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-password", 10);

/** POST { action: "login" | "register", ... } */
export const POST = handle(async (req: Request) => {
  const body = await req.json();
  if (!rateLimit(`cust:${clientIp(req)}`, 10)) return fail("Too many attempts. Please try again in a few minutes.", 429);
  await connectDB();

  if (body?.action === "register") {
    const data = registerSchema.parse(body);
    const exists = await Customer.exists({ email: data.email });
    if (exists) throw new HttpError(409, "An account with this email already exists.");
    const c = await Customer.create({ name: data.name, email: data.email, phone: data.phone, passwordHash: await bcrypt.hash(data.password, 12) });
    await setSessionCookie(CUSTOMER_COOKIE, await signSession({ sub: String(c._id), role: "customer", email: c.email, name: c.name }));
    return ok({ success: true }, 201);
  }

  const data = loginSchema.parse(body);
  const c = await Customer.findOne({ email: data.email }).select("+passwordHash");
  const valid = c ? await bcrypt.compare(data.password, c.passwordHash) : await bcrypt.compare(data.password, DUMMY_HASH);
  if (!c || !valid) throw new HttpError(401, "Invalid email or password.");
  c.lastLoginAt = new Date();
  await c.save();
  await setSessionCookie(CUSTOMER_COOKIE, await signSession({ sub: String(c._id), role: "customer", email: c.email, name: c.name }));
  return ok({ success: true });
});

export const DELETE = handle(async () => {
  await clearSessionCookie(CUSTOMER_COOKIE);
  return ok({ success: true });
});
