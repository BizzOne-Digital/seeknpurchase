import "server-only";
import { redirect } from "next/navigation";
import { getCustomerSession } from "./auth";
import { connectDB, hasDb, serialize } from "./db";
import { Customer, Order } from "@/models";

export type OrderRow = {
  _id: string; orderNumber: string; createdAt: string; total: number; currency: string; paymentStatus: string; status: string; fulfillmentStatus: string;
  items: { slug: string; name: string; image: string; variant?: string; price: number; quantity: number }[];
  subtotal: number; shipping: number; discount: number; tax: number; shippingMethod?: string;
  customerInfo: { firstName: string; lastName: string; email: string; phone?: string };
  shippingAddress: { address: string; apartment?: string; city: string; state: string; zip: string; country: string };
};

/** Server-side guard for /account pages (middleware also redirects). */
export async function requireCustomerPage() {
  const s = await getCustomerSession();
  if (!s || !hasDb()) redirect("/login?next=/account");
  await connectDB();
  const c = await Customer.findById(s.sub).lean();
  if (!c) redirect("/login");
  return serialize<{ _id: string; name: string; email: string; phone?: string; wishlist: string[]; addresses: unknown[] }>(c);
}

export async function customerOrders(customerId: string, _email?: string) {
  await connectDB();
  // Only orders placed while signed in. Guest orders are NOT matched by email because
  // emails are not verified at registration (prevents viewing someone else's orders).
  const orders = await Order.find({ customer: customerId }).sort({ createdAt: -1 }).lean();
  return serialize<OrderRow[]>(orders);
}
