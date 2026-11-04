import { isValidObjectId } from "mongoose";
import { z } from "zod";
import { handle, ok, requireAdmin, HttpError } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { FULFILLMENT_STATUSES, Order, ORDER_STATUSES, PAYMENT_STATUSES } from "@/models";
import { applyInventory } from "@/lib/stripe";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  fulfillmentStatus: z.enum(FULFILLMENT_STATUSES).optional(),
  notes: z.string().max(5000).optional(),
});

export const GET = handle(async (_req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) throw new HttpError(400, "Invalid id");
  await connectDB();
  const o = await Order.findById(id).lean();
  if (!o) throw new HttpError(404, "Order not found");
  return ok({ item: o });
});

export const PATCH = handle(async (req: Request, ctx: Ctx) => {
  await requireAdmin();
  const { id } = await ctx.params;
  if (!isValidObjectId(id)) throw new HttpError(400, "Invalid id");
  const data = schema.parse(await req.json());
  await connectDB();
  const o = await Order.findById(id);
  if (!o) throw new HttpError(404, "Order not found");

  // Stripe orders only become "paid" through verified Stripe confirmation (webhook / session check).
  if (data.paymentStatus === "paid" && o.paymentStatus !== "paid" && o.paymentProvider === "stripe") {
    throw new HttpError(400, "Stripe orders are marked paid automatically after Stripe confirms payment.");
  }
  const becamePaid = data.paymentStatus === "paid" && o.paymentStatus !== "paid";
  o.set(data);
  if (becamePaid) o.paidAt = new Date();
  if (data.status === "Delivered") o.fulfillmentStatus = "fulfilled";
  await o.save();
  // Manual-payment orders: deduct inventory once staff confirm payment.
  if (becamePaid) await applyInventory(o.items, o.couponCode);
  return ok({ success: true, item: o.toObject() });
});
