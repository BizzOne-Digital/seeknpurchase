import { handle, ok, requireAdmin } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Customer, Order } from "@/models";
import { escapeRegex } from "@/lib/utils";

export const runtime = "nodejs";

export const GET = handle(async (req: Request) => {
  await requireAdmin();
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim().slice(0, 80);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10) || 1);
  const limit = 25;
  const filter = q ? { $or: [{ name: new RegExp(escapeRegex(q), "i") }, { email: new RegExp(escapeRegex(q), "i") }] } : {};
  await connectDB();
  const [customers, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Customer.countDocuments(filter),
  ]);
  const stats = await Order.aggregate([
    { $match: { customer: { $in: customers.map((c) => c._id) } } },
    { $group: { _id: "$customer", orders: { $sum: 1 }, spend: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] } } } },
  ]);
  const items = customers.map((c) => {
    const s = stats.find((x) => String(x._id) === String(c._id));
    return { _id: c._id, name: c.name, email: c.email, phone: c.phone, createdAt: c.createdAt, totalOrders: s?.orders || 0, totalSpend: s?.spend || 0 };
  });
  return ok({ items, total, page, pages: Math.max(1, Math.ceil(total / limit)) });
});
