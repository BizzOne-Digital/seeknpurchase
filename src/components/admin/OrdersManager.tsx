"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, Inbox, Loader2, Search, X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminPageHeader } from "./AdminShell";
import { formatDate, formatMoney, normalizeImageUrl } from "@/lib/utils";

const STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];
const PAYMENTS = ["pending", "paid", "failed", "refunded"];
const FULFILL = ["unfulfilled", "partially_fulfilled", "fulfilled"];

type Order = {
  _id: string; orderNumber: string; createdAt: string; total: number; subtotal: number; shipping: number; discount: number; tax: number; currency: string;
  status: string; paymentStatus: string; fulfillmentStatus: string; paymentProvider: string; shippingMethod?: string; couponCode?: string; notes?: string;
  customerInfo: { firstName: string; lastName: string; email: string; phone?: string };
  shippingAddress: { address: string; apartment?: string; city: string; state: string; zip: string; country: string };
  items: { slug: string; name: string; image: string; variant?: string; price: number; quantity: number }[];
};

function OrderDetail({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [f, setF] = useState({ status: order.status, paymentStatus: order.paymentStatus, fulfillmentStatus: order.fulfillmentStatus, notes: order.notes || "" });
  const [saving, setSaving] = useState(false);
  const money = (n: number) => formatMoney(n, order.currency);
  const a = order.shippingAddress;
  const save = async () => {
    setSaving(true);
    try {
      const r = await fetch(`/api/admin/orders/${order._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast("Order updated");
      onSaved();
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`Order ${order.orderNumber}`}>
      <div className="absolute inset-0 bg-navy/50" onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-2xl animate-slide-in-right flex-col bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div><h2 className="text-xl">{order.orderNumber}</h2><p className="text-xs text-slate-500">{formatDate(order.createdAt)} · {order.paymentProvider}</p></div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-cream" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-6 overflow-y-auto p-6 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><h3 className="mb-1 font-sans font-semibold">Customer</h3><p>{order.customerInfo.firstName} {order.customerInfo.lastName}</p><p className="text-slate-500">{order.customerInfo.email}</p>{order.customerInfo.phone && <p className="text-slate-500">{order.customerInfo.phone}</p>}</div>
            <div><h3 className="mb-1 font-sans font-semibold">Ship to ({order.shippingMethod || "standard"})</h3><address className="not-italic text-slate-600">{a.address}{a.apartment ? `, ${a.apartment}` : ""}<br />{a.city}, {a.state} {a.zip}<br />{a.country}</address></div>
          </div>
          <ul className="divide-y divide-line rounded-lg border border-line">
            {order.items.map((i) => (
              <li key={i.slug + (i.variant || "")} className="flex items-center gap-3 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={normalizeImageUrl(i.image)} alt="" className="h-12 w-12 rounded bg-cream object-cover" />
                <div className="flex-1"><p className="font-medium">{i.name}</p>{i.variant && <p className="text-xs text-slate-500">{i.variant}</p>}<p className="text-xs text-slate-500">{money(i.price)} × {i.quantity}</p></div>
                <span className="font-semibold">{money(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>Discount {order.couponCode && `(${order.couponCode})`}</dt><dd>-{money(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd>{money(order.shipping)}</dd></div>
            {order.tax > 0 && <div className="flex justify-between"><dt>Tax</dt><dd>{money(order.tax)}</dd></div>}
            <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{money(order.total)}</dd></div>
          </dl>
          <div className="grid gap-4 sm:grid-cols-3">
            <div><label htmlFor="o-status" className="label">Order status</label><select id="o-status" className="input" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div>
              <label htmlFor="o-pay" className="label">Payment</label>
              <select id="o-pay" className="input capitalize" value={f.paymentStatus} onChange={(e) => setF({ ...f, paymentStatus: e.target.value })}>{PAYMENTS.map((s) => <option key={s}>{s}</option>)}</select>
              {order.paymentProvider === "stripe" && <p className="mt-1 text-[11px] text-slate-500">Set to paid automatically by Stripe.</p>}
            </div>
            <div><label htmlFor="o-ful" className="label">Fulfillment</label><select id="o-ful" className="input" value={f.fulfillmentStatus} onChange={(e) => setF({ ...f, fulfillmentStatus: e.target.value })}>{FULFILL.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
          </div>
          <div><label htmlFor="o-notes" className="label">Internal notes</label><textarea id="o-notes" rows={3} className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-cream px-6 py-4">
          <button onClick={onClose} className="btn-ghost">Close</button>
          <button onClick={save} disabled={saving} className="btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save changes</button>
        </div>
      </div>
    </div>
  );
}

export function OrdersManager() {
  const sp = useSearchParams();
  const { toast } = useToast();
  const [items, setItems] = useState<Order[] | null>(null);
  const [q, setQ] = useState(sp.get("q") || "");
  const [filters, setFilters] = useState({ q: sp.get("q") || "", status: sp.get("status") || "", payment: "" });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [open, setOpen] = useState<Order | null>(null);

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams({ ...filters, page: String(page) });
      const r = await fetch(`/api/admin/orders?${p}`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setItems(d.items);
      setPages(d.pages);
      setTotal(d.total);
    } catch (e) {
      toast((e as Error).message, "error");
      setItems([]);
    }
  }, [filters, page, toast]);
  useEffect(() => { load(); }, [load]);

  return (
    <>
      <AdminPageHeader title="Orders" description={`${total} orders`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setFilters({ ...filters, q }); }} className="relative" role="search">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label htmlFor="o-q" className="sr-only">Search orders</label>
          <input id="o-q" className="input w-64 pl-9" placeholder="Order #, name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        </form>
        <label className="sr-only" htmlFor="o-fs">Status</label>
        <select id="o-fs" className="input w-auto" value={filters.status} onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }}>
          <option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <label className="sr-only" htmlFor="o-fp">Payment</label>
        <select id="o-fp" className="input w-auto capitalize" value={filters.payment} onChange={(e) => { setPage(1); setFilters({ ...filters, payment: e.target.value }); }}>
          <option value="">All payments</option>{PAYMENTS.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-line bg-cream/70 text-xs uppercase tracking-wider text-slate-500">
            <tr>{["Order ID", "Customer", "Email", "Date", "Items", "Total", "Payment", "Order", "Fulfillment", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items === null && <tr><td colSpan={10} className="p-4"><div className="skeleton h-24" /></td></tr>}
            {items?.length === 0 && <tr><td colSpan={10} className="py-14 text-center"><Inbox className="mx-auto h-8 w-8 text-gold" strokeWidth={1.4} /><p className="mt-2">No orders found</p></td></tr>}
            {items?.map((o) => (
              <tr key={o._id} className="hover:bg-cream/40">
                <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                <td className="px-4 py-3">{o.customerInfo.firstName} {o.customerInfo.lastName}</td>
                <td className="px-4 py-3">{o.customerInfo.email}</td>
                <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
                <td className="px-4 py-3">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                <td className="px-4 py-3 font-semibold">{formatMoney(o.total, o.currency)}</td>
                <td className="px-4 py-3"><StatusBadge value={o.paymentStatus} /></td>
                <td className="px-4 py-3"><StatusBadge value={o.status} /></td>
                <td className="px-4 py-3"><StatusBadge value={o.fulfillmentStatus} /></td>
                <td className="px-4 py-3 text-right"><button onClick={() => setOpen(o)} className="rounded-md p-2 text-slate-500 hover:bg-cream hover:text-navy" aria-label={`View ${o.orderNumber}`}><Eye className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 && (
        <div className="mt-4 flex justify-end gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline btn-sm">Previous</button>
          <span className="self-center">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="btn-outline btn-sm">Next</button>
        </div>
      )}
      {open && <OrderDetail order={open} onClose={() => setOpen(null)} onSaved={() => { setOpen(null); load(); }} />}
    </>
  );
}
