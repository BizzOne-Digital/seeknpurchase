import "server-only";
import Stripe from "stripe";
import { connectDB } from "./db";
import { Coupon, Order, Product } from "@/models";

let client: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!client) client = new Stripe(key);
  return client;
}

/**
 * Marks an order paid ONLY after Stripe confirms payment server-side.
 * Idempotent: stock/coupon usage are adjusted once, on the pending -> paid transition.
 */
export async function confirmStripeSession(sessionId: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  const session = await stripe.checkout.sessions.retrieve(String(sessionId));
  if (session.payment_status !== "paid") return null;
  await connectDB();
  const order = await Order.findOneAndUpdate(
    { stripeSessionId: session.id, paymentStatus: { $ne: "paid" } },
    {
      $set: {
        paymentStatus: "paid",
        status: "Processing",
        paidAt: new Date(),
        stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id,
      },
    },
    { new: true },
  );
  if (order) await applyInventory(order.items, order.couponCode);
  return order;
}

export async function applyInventory(items: { slug?: string | null; quantity?: number | null }[], couponCode?: string | null) {
  await Promise.all(
    items.map((i) =>
      Product.updateOne({ slug: i.slug }, { $inc: { stock: -(i.quantity || 0), soldCount: i.quantity || 0 } }),
    ),
  );
  if (couponCode) await Coupon.updateOne({ code: couponCode }, { $inc: { usedCount: 1 } });
}
