import type Stripe from "stripe";
import { getStripe, confirmStripeSession } from "@/lib/stripe";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return new Response("Stripe is not configured", { status: 503 });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    // Raw body is required for signature verification.
    event = stripe.webhooks.constructEvent(await req.text(), sig, secret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await confirmStripeSession((event.data.object as Stripe.Checkout.Session).id);
        break;
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        await connectDB();
        const s = event.data.object as Stripe.Checkout.Session;
        await Order.updateOne(
          { stripeSessionId: s.id, paymentStatus: "pending" },
          { $set: { paymentStatus: "failed", ...(event.type === "checkout.session.expired" ? { status: "Cancelled" } : {}) } },
        );
        break;
      }
      case "charge.refunded": {
        await connectDB();
        const c = event.data.object as Stripe.Charge;
        const pi = typeof c.payment_intent === "string" ? c.payment_intent : c.payment_intent?.id;
        if (pi && c.refunded) await Order.updateOne({ stripePaymentIntentId: pi }, { $set: { paymentStatus: "refunded", status: "Refunded" } });
        break;
      }
    }
  } catch (e) {
    console.error("[stripe webhook]", e);
    return new Response("Webhook handler error", { status: 500 });
  }
  return Response.json({ received: true });
}
