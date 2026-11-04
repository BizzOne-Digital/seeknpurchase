import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { handle, ok, requireCustomer, HttpError } from "@/lib/api";
import { addressSchema } from "@/lib/validation";
import { connectDB } from "@/lib/db";
import { Customer } from "@/models";

export const runtime = "nodejs";

async function load(id: string) {
  await connectDB();
  const c = await Customer.findById(id);
  if (!c) throw new HttpError(404, "Account not found");
  return c;
}

export const GET = handle(async () => {
  const s = await requireCustomer();
  const c = await load(s.sub);
  return ok({ addresses: c.addresses });
});

/** POST: add. PUT: { id, ...address } update. DELETE: ?id= */
export const POST = handle(async (req: Request) => {
  const s = await requireCustomer();
  const data = addressSchema.parse(await req.json());
  const c = await load(s.sub);
  if (c.addresses.length >= 10) throw new HttpError(400, "You can save up to 10 addresses.");
  if (data.isDefault || c.addresses.length === 0) {
    c.addresses.forEach((a) => (a.isDefault = false));
    data.isDefault = true;
  }
  c.addresses.push(data);
  await c.save();
  return ok({ addresses: c.addresses }, 201);
});

export const PUT = handle(async (req: Request) => {
  const s = await requireCustomer();
  const body = await req.json();
  const id = z.string().parse(body?.id);
  if (!isValidObjectId(id)) throw new HttpError(400, "Invalid address");
  const data = addressSchema.parse(body);
  const c = await load(s.sub);
  const a = c.addresses.id(id);
  if (!a) throw new HttpError(404, "Address not found");
  if (data.isDefault) c.addresses.forEach((x) => (x.isDefault = false));
  a.set(data);
  await c.save();
  return ok({ addresses: c.addresses });
});

export const DELETE = handle(async (req: Request) => {
  const s = await requireCustomer();
  const id = new URL(req.url).searchParams.get("id") || "";
  if (!isValidObjectId(id)) throw new HttpError(400, "Invalid address");
  const c = await load(s.sub);
  const a = c.addresses.id(id);
  if (!a) throw new HttpError(404, "Address not found");
  const wasDefault = a.isDefault;
  a.deleteOne();
  if (wasDefault && c.addresses[0]) c.addresses[0].isDefault = true;
  await c.save();
  return ok({ addresses: c.addresses });
});
