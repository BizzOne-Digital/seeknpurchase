import Link from "next/link";
import { Users } from "lucide-react";
import { connectDB, serialize } from "@/lib/db";
import { Customer, Order } from "@/models";
import { escapeRegex, formatDate, formatMoney } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminShell";

export const metadata = { title: "Customers" };

type Row = { _id: string; name: string; email: string; phone?: string; createdAt: string };

export default async function CustomersAdminPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const q = (sp.q || "").slice(0, 80);
  const page = Math.max(1, parseInt(sp.page || "1", 10) || 1);
  await connectDB();
  const filter = q ? { $or: [{ name: new RegExp(escapeRegex(q), "i") }, { email: new RegExp(escapeRegex(q), "i") }] } : {};
  const [list, total] = await Promise.all([Customer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * 25).limit(25).lean(), Customer.countDocuments(filter)]);
  const stats = await Order.aggregate([
    { $match: { customer: { $in: list.map((c) => c._id) } } },
    { $group: { _id: "$customer", orders: { $sum: 1 }, spend: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$total", 0] } } } },
  ]);
  const rows = serialize<Row[]>(list);
  const pages = Math.max(1, Math.ceil(total / 25));

  return (
    <>
      <AdminPageHeader title="Customers" description={`${total} registered customers`} />
      <form className="mb-4 flex max-w-md gap-2" role="search">
        <label htmlFor="c-q" className="sr-only">Search customers</label>
        <input id="c-q" name="q" defaultValue={q} className="input" placeholder="Search name or email" />
        <button className="btn-outline btn-sm">Search</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-cream/70 text-xs uppercase tracking-wider text-slate-500">
            <tr>{["Name", "Email", "Phone", "Total Orders", "Total Spend", "Registered"].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.length === 0 && <tr><td colSpan={6} className="py-14 text-center"><Users className="mx-auto h-8 w-8 text-gold" strokeWidth={1.4} /><p className="mt-2">No customers found</p></td></tr>}
            {rows.map((c) => {
              const s = stats.find((x) => String(x._id) === c._id);
              return (
                <tr key={c._id} className="hover:bg-cream/40">
                  <td className="px-4 py-3 font-semibold"><Link href={`/admin/customers/${c._id}`} className="hover:text-gold-600">{c.name}</Link></td>
                  <td className="px-4 py-3">{c.email}</td>
                  <td className="px-4 py-3">{c.phone || "—"}</td>
                  <td className="px-4 py-3">{s?.orders || 0}</td>
                  <td className="px-4 py-3">{formatMoney(s?.spend || 0)}</td>
                  <td className="px-4 py-3">{formatDate(c.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex justify-end gap-2 text-sm">
          {page > 1 && <Link className="btn-outline btn-sm" href={`?q=${encodeURIComponent(q)}&page=${page - 1}`}>Previous</Link>}
          <span className="self-center">Page {page} of {pages}</span>
          {page < pages && <Link className="btn-outline btn-sm" href={`?q=${encodeURIComponent(q)}&page=${page + 1}`}>Next</Link>}
        </div>
      )}
    </>
  );
}
