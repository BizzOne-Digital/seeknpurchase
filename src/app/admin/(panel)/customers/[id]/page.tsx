import Link from "next/link";
import { notFound } from "next/navigation";
import { isValidObjectId } from "mongoose";
import { ArrowLeft } from "lucide-react";
import { connectDB, serialize } from "@/lib/db";
import { Customer, Order } from "@/models";
import { formatDate, formatMoney } from "@/lib/utils";
import { AdminPageHeader } from "@/components/admin/AdminShell";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const metadata = { title: "Customer" };

type C = { _id: string; name: string; email: string; phone?: string; createdAt: string; lastLoginAt?: string; wishlist: string[]; addresses: { _id: string; label?: string; address: string; city: string; state: string; zip: string; country?: string; isDefault?: boolean }[] };
type O = { _id: string; orderNumber: string; createdAt: string; total: number; currency: string; paymentStatus: string; status: string };

export default async function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isValidObjectId(id)) notFound();
  await connectDB();
  const c = serialize<C | null>(await Customer.findById(id).lean());
  if (!c) notFound();
  const orders = serialize<O[]>(await Order.find({ customer: id }).sort({ createdAt: -1 }).lean());
  const spend = orders.filter((o) => o.paymentStatus === "paid").reduce((n, o) => n + o.total, 0);

  return (
    <>
      <Link href="/admin/customers" className="link-arrow mb-4 text-xs"><ArrowLeft className="h-3.5 w-3.5" /> Customers</Link>
      <AdminPageHeader title={c.name} description={`${c.email}${c.phone ? ` · ${c.phone}` : ""} · joined ${formatDate(c.createdAt)}`} />
      <ul className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {[["Orders", orders.length], ["Total spend", formatMoney(spend)], ["Wishlist items", c.wishlist?.length || 0], ["Last sign-in", c.lastLoginAt ? formatDate(c.lastLoginAt) : "—"]].map(([l, v]) => (
          <li key={String(l)} className="rounded-xl border border-line bg-white p-4"><p className="text-xs text-slate-500">{l}</p><p className="mt-1 text-xl font-bold">{v}</p></li>
        ))}
      </ul>
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-line bg-white p-5 lg:col-span-2">
          <h2 className="mb-3 font-sans text-base font-semibold">Order history</h2>
          {orders.length === 0 ? <p className="text-sm text-slate-500">No orders yet.</p> : (
            <table className="w-full text-sm"><tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="py-2 font-semibold"><Link className="hover:text-gold-600" href={`/admin/orders?q=${o.orderNumber}`}>{o.orderNumber}</Link></td>
                  <td>{formatDate(o.createdAt)}</td><td><StatusBadge value={o.paymentStatus} /></td><td><StatusBadge value={o.status} /></td>
                  <td className="text-right font-semibold">{formatMoney(o.total, o.currency)}</td>
                </tr>
              ))}
            </tbody></table>
          )}
        </section>
        <section className="rounded-xl border border-line bg-white p-5">
          <h2 className="mb-3 font-sans text-base font-semibold">Addresses</h2>
          {c.addresses?.length ? (
            <ul className="space-y-3 text-sm">
              {c.addresses.map((a) => (
                <li key={a._id} className="text-slate-600"><p className="font-semibold text-navy">{a.label}{a.isDefault && " (default)"}</p>{a.address}, {a.city}, {a.state} {a.zip}</li>
              ))}
            </ul>
          ) : <p className="text-sm text-slate-500">No saved addresses.</p>}
        </section>
      </div>
    </>
  );
}
