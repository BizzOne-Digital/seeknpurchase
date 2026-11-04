import { randomBytes } from "crypto";
import { handle, ok } from "@/lib/api";
import { checkoutSchema } from "@/lib/validation";
import { priceCart } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe";
import { getCustomerSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Order } from "@/models";
import { siteUrl } from "@/lib/utils";

export const runtime = "nodejs";

function orderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear().toString().slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `SP-${ymd}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

const absolute = (url: string) => (url.startsWith("http") ? url : `${siteUrl()}${url}`);

export const POST = handle(async (req: Request) => {
  const body = checkoutSchema.parse(await req.json());
  const priced = await priceCart(body.items, { couponCode: body.couponCode, shippingMethod: body.shippingMethod });
  await connectDB();
  const session = await getCustomerSession();
  const accessToken = randomBytes(24).toString("hex");

  const order = await Order.create({
    orderNumber: orderNumber(),
    customer: session?.sub,
    customerInfo: body.customer,
    shippingAddress: body.shippingAddress,
    items: priced.items,
    subtotal: priced.subtotal,
    shipping: priced.shipping,
    shippingMethod: priced.shippingMethod,
    discount: priced.discount,
    tax: priced.tax,
    total: priced.total,
    couponCode: priced.coupon?.code,
    currency: priced.currency,
    paymentStatus: "pending",
    status: "Pending",
    paymentProvider: getStripe() ? "stripe" : "manual",
    accessToken,
  });

  const stripe = getStripe();
  if (!stripe) {
    // Manual-payment mode: order is recorded as pending; staff completes payment offline.
    return ok({ success: true, orderNumber: order.orderNumber, token: accessToken });
  }

  const cur = priced.currency.toLowerCase();
  const line_items = priced.items.map((i) => ({
    quantity: i.quantity,
    price_data: {
      currency: cur,
      unit_amount: Math.round(i.price * 100),
      product_data: { name: (i.variant ? `${i.name} (${i.variant})` : i.name).slice(0, 250), ...(i.image ? { images: [absolute(i.image)] } : {}) },
    },
  }));
  if (priced.shipping > 0) {
    line_items.push({ quantity: 1, price_data: { currency: cur, unit_amount: Math.round(priced.shipping * 100), product_data: { name: `Shipping (${priced.shippingMethod})` } } });
  }
  if (priced.tax > 0) {
    line_items.push({ quantity: 1, price_data: { currency: cur, unit_amount: Math.round(priced.tax * 100), product_data: { name: "Tax" } } });
  }

  let discounts: { coupon: string }[] | undefined;
  if (priced.discount > 0) {
    const c = await stripe.coupons.create({ amount_off: Math.round(priced.discount * 100), currency: cur, duration: "once", name: priced.coupon?.code || "Discount" });
    discounts = [{ coupon: c.id }];
  }

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: body.customer.email,
    line_items,
    discounts,
    client_reference_id: order.orderNumber,
    metadata: { orderId: String(order._id), orderNumber: order.orderNumber },
    success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/checkout?canceled=1`,
  });

  order.stripeSessionId = checkout.id;
  await order.save();
  return ok({ success: true, url: checkout.url });
});
