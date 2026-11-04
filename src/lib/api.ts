import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getAdminSession, getCustomerSession } from "./auth";

export function ok(data: unknown = { success: true }, status = 200) {
  return NextResponse.json(data, { status });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status });
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/** Wrap a route handler: converts thrown errors into safe JSON responses (no stack traces). */
export function handle<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A): Promise<Response> => {
    try {
      return await fn(...args);
    } catch (e) {
      if (e instanceof ZodError) {
        const first = e.issues[0];
        return fail(first ? `${first.path.join(".") || "Field"}: ${first.message}` : "Validation failed", 422, {
          issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
        });
      }
      if (e instanceof HttpError) return fail(e.message, e.status);
      const err = e as { code?: number; name?: string };
      if (err?.code === 11000) return fail("A record with this value already exists", 409);
      if (err?.name === "CastError") return fail("Invalid identifier", 400);
      if (err?.name === "ValidationError") return fail("Some fields are invalid", 422);
      console.error("[api]", e);
      return fail("Something went wrong. Please try again.", 500);
    }
  };
}

export async function requireAdmin() {
  const s = await getAdminSession();
  if (!s) throw new HttpError(401, "Unauthorized");
  return s;
}

export async function requireCustomer() {
  const s = await getCustomerSession();
  if (!s) throw new HttpError(401, "Please sign in");
  return s;
}
