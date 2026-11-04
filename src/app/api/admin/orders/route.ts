import { handle, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Order, ORDER_STATUSES, PAYMENT_STATUSES } from "@/models";
import { escapeRegex } from "@/lib/utils";

export const runtime = "nodejs";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
  const status = url.searchParams.get("status") || "";
  const payment = url.searchParams.get("payment") || "";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = 25;
  const filter: Record<string, unknown> = {};
  if (q) {
    const r = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ orderNumber: r }, { "customerInfo.email": r }, { "customerInfo.firstName": r }, { "customerInfo.lastName": r }];
  }
  if ((ORDER_STATUSES as readonly string[]).includes(status)) filter.status = status;
  if ((PAYMENT_STATUSES as readonly string[]).includes(payment)) filter.paymentStatus = payment;
  await connectDB();
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
