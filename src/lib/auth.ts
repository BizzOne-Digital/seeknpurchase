import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "sp_admin";
export const CUSTOMER_COOKIE = "sp_customer";

export type Session = { sub: string; role: "admin" | "customer"; email: string; name: string };

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set (min 32 characters)");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: Session, maxAgeSec = 60 * 60 * 24 * 7) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSec}s`)
    .sign(secret());
}

export async function verifySession(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function setSessionCookie(name: string, token: string, maxAgeSec = 60 * 60 * 24 * 7) {
  (await cookies()).set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export async function clearSessionCookie(name: string) {
  (await cookies()).delete(name);
}

export async function getAdminSession() {
  const s = await verifySession((await cookies()).get(ADMIN_COOKIE)?.value);
  return s?.role === "admin" ? s : null;
}

export async function getCustomerSession() {
  const s = await verifySession((await cookies()).get(CUSTOMER_COOKIE)?.value);
  return s?.role === "customer" ? s : null;
}
