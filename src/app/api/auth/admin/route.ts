import bcrypt from "bcryptjs";
import { fail, handle, ok, HttpError } from "@/lib/api";
import { loginSchema } from "@/lib/validation";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models";
import { ADMIN_COOKIE, clearSessionCookie, setSessionCookie, signSession } from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const ADMIN_SESSION_SECONDS = 60 * 60 * 12;
const DUMMY_HASH = bcrypt.hashSync("timing-equalizer-password", 10);

export const POST = handle(async (req: Request) => {
  if (!rateLimit(`admin:${clientIp(req)}`, 6)) return fail("Too many attempts. Please try again in a few minutes.", 429);
  const data = loginSchema.parse(await req.json());
  await connectDB();
  const a = await Admin.findOne({ email: data.email }).select("+passwordHash");
  const valid = await bcrypt.compare(data.password, a ? a.passwordHash : DUMMY_HASH);
  if (!a || !valid) throw new HttpError(401, "Invalid email or password.");
  a.lastLoginAt = new Date();
  await a.save();
  const token = await signSession({ sub: String(a._id), role: "admin", email: a.email, name: a.name }, ADMIN_SESSION_SECONDS);
  await setSessionCookie(ADMIN_COOKIE, token, ADMIN_SESSION_SECONDS);
  return ok({ success: true });
});

export const DELETE = handle(async () => {
  await clearSessionCookie(ADMIN_COOKIE);
  return ok({ success: true });
});
