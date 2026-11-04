import Link from "next/link";
import { AlertTriangle, Clock, DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import { connectDB, serialize } from "@/lib/db";
import { Customer, Order, Product } from "@/models";
import { formatDate, formatMoney } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  await connectDB();
  const since = new Date(Date.now() - 29 * 86400000);
  since.setHours(0, 0, 0, 0);
  const [rev, totalOrders, totalCustomers, totalProducts, pending, lowStock, recentOrders, recentCustomers, daily, byStatus] = await Promise.all([
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, sum: { $sum: "$total" } } }]),
    Order.countDocuments(),
    Customer.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments({ status: { $in: ["Pending", "Processing"] } }),
    Product.find({ $expr: { $lte: ["$stock", "$lowStockThreshold"] } }).sort({ stock: 1 }).limit(8).select("name slug stock lowStockThreshold").lean(),
    Order.find().sort({ createdAt: -1 }).limit(6).lean(),
    Customer.find().sort({ createdAt: -1 }).limit(6).select("name email createdAt").lean(),
    Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: since } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
    Order.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
  ]);

  const series = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000).toISOString().slice(0, 10);
    const hit = daily.find((x) => x._id === d);
    return { date: d, revenue: Math.round((hit?.revenue || 0) * 100) / 100, orders: hit?.orders || 0 };
  });
  const orders = serialize<{ _id: string; orderNumber: string; customerInfo: { firstName: string; lastName: string }; total: number; status: string; paymentStatus: string; createdAt: string }[]>(recentOrders);
  const customers = serialize<{ _id: string; name: string; email: string; createdAt: string }[]>(recentCustomers);
  const maxStatus = Math.max(1, ...byStatus.map((s) => s.n));

  const kpis = [
    { label: "Total Revenue", value: formatMoney(rev[0]?.sum || 0), Icon: DollarSign, href: "/admin/orders" },
    { label: "Total Orders", value: totalOrders, Icon: ShoppingCart, href: "/admin/orders" },
    { label: "Total Customers", value: totalCustomers, Icon: Users, href: "/admin/customers" },
    { label: "Total Products", value: totalProducts, Icon: Package, href: "/admin/products" },
    { label: "Pending Orders", value: pending, Icon: Clock, href: "/admin/orders?status=Pending", warn: pending > 0 },
    { label: "Low Stock Products", value: lowStock.length, Icon: AlertTriangle, href: "/admin/products", warn: lowStock.length > 0 },
  ];

  return (
    <>
      <AdminPageHeader title="Dashboard" description="Store performance at a glance. Revenue counts paid orders only." />
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map(({ label, value, Icon, href, warn }) => (
          <li key={label}>
            <Link href={href} className={`block rounded-xl border bg-white p-5 transition hover:shadow-soft ${warn ? "border-amber-300" : "border-line"}`}>
              <Icon className={`h-5 w-5 ${warn ? "text-amber-600" : "text-gold"}`} strokeWidth={1.6} />
              <p className="mt-3 text-2xl font-bold">{value}</p>
              <p className="text-xs text-slate-500">{label}{warn && " · needs attention"}</p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-line bg-white p-5 xl:col-span-2">
          <h2 className="font-sans text-base font-semibold">Paid revenue — last 30 days</h2>
          <RevenueChart data={series} />
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="mb-4 font-sans text-base font-semibold">Orders by status</h2>
          {byStatus.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : (
            <ul className="space-y-3">
              {byStatus.sort((a, b) => b.n - a.n).map((s) => (
                <li key={s._id} className="text-sm">
                  <div className="mb-1 flex justify-between"><span>{s._id}</span><span className="font-semibold">{s.n}</span></div>
                  <div className="h-2 rounded-full bg-cream-200"><div className="h-2 rounded-full bg-navy" style={{ width: `${(s.n / maxStatus) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <section className="rounded-xl border border-line bg-white p-5 xl:col-span-2">
          <div className="mb-3 flex justify-between"><h2 className="font-sans text-base font-semibold">Recent orders</h2><Link href="/admin/orders" className="link-arrow text-xs">View all</Link></div>
          {orders.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-sm">
                <tbody className="divide-y divide-line">
                  {orders.map((o) => (
                    <tr key={o._id}>
                      <td className="py-2 font-semibold"><Link href={`/admin/orders?q=${o.orderNumber}`} className="hover:text-gold-600">{o.orderNumber}</Link></td>
                      <td>{o.customerInfo?.firstName} {o.customerInfo?.lastName}</td>
                      <td>{formatDate(o.createdAt)}</td>
                      <td><StatusBadge value={o.paymentStatus} /></td>
                      <td><StatusBadge value={o.status} /></td>
                      <td className="text-right font-semibold">{formatMoney(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-white p-5">
            <h2 className="mb-3 font-sans text-base font-semibold">Low stock</h2>
            {lowStock.length === 0 ? <p className="text-sm text-slate-500">All products are well stocked.</p> : (
              <ul className="space-y-2 text-sm">
                {lowStock.map((p) => (
                  <li key={String(p._id)} className="flex justify-between gap-2">
                    <span className="truncate">{p.name}</span>
                    <span className={`flex items-center gap-1 font-semibold ${p.stock <= 0 ? "text-red-600" : "text-amber-700"}`}>
                      <AlertTriangle className="h-3.5 w-3.5" />{p.stock <= 0 ? "Out" : `${p.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-xl border border-line bg-white p-5">
            <div className="mb-3 flex justify-between"><h2 className="font-sans text-base font-semibold">Recent customers</h2><Link href="/admin/customers" className="link-arrow text-xs">View all</Link></div>
            {customers.length === 0 ? <p className="text-sm text-slate-500">No customers yet.</p> : (
              <ul className="space-y-2 text-sm">
                {customers.map((c) => (
                  <li key={c._id}><Link href={`/admin/customers/${c._id}`} className="font-medium hover:text-gold-600">{c.name}</Link><p className="text-xs text-slate-500">{c.email} · {formatDate(c.createdAt)}</p></li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
