import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { customerOrders, requireCustomerPage } from "@/lib/customer";
import { getDictionary } from "@/lib/i18n/server";
import { formatDate, formatMoney } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default async function AccountOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const c = await requireCustomerPage();
  const [{ t }, orders] = await Promise.all([getDictionary(), customerOrders(c._id, c.email)]);
  const o = orders.find((x) => x.orderNumber === id);
  if (!o) notFound();
  const money = (n: number) => formatMoney(n, o.currency);
  const a = o.shippingAddress;
  return (
    <div className="space-y-6">
      <Link href="/account/orders" className="link-arrow text-xs uppercase tracking-wider"><ArrowLeft className="h-3.5 w-3.5" /> {t.account.orders}</Link>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl">{o.orderNumber}</h2>
          <p className="text-sm text-slate-500">{formatDate(o.createdAt)}</p>
        </div>
        <div className="flex gap-2"><StatusBadge value={o.paymentStatus} /><StatusBadge value={o.status} /><StatusBadge value={o.fulfillmentStatus} /></div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl border border-line p-5">
          <ul className="divide-y divide-line">
            {o.items.map((i) => (
              <li key={i.slug + (i.variant || "")} className="flex items-center gap-4 py-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-md bg-cream"><SmartImage src={i.image} alt={i.name} fill sizes="64px" className="object-cover" /></div>
                <div className="flex-1 text-sm">
                  <Link href={`/products/${i.slug}`} className="font-medium hover:text-gold-600">{i.name}</Link>
                  {i.variant && <p className="break-words text-xs text-slate-500">{i.variant}</p>}
                  <p className="text-xs text-slate-500">{money(i.price)} × {i.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{money(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>{t.cart.subtotal}</dt><dd>{money(o.subtotal)}</dd></div>
            {o.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>{t.cart.discount}</dt><dd>-{money(o.discount)}</dd></div>}
            <div className="flex justify-between"><dt>{t.cart.shipping}</dt><dd>{o.shipping === 0 ? t.cart.free : money(o.shipping)}</dd></div>
            {o.tax > 0 && <div className="flex justify-between"><dt>{t.cart.tax}</dt><dd>{money(o.tax)}</dd></div>}
            <div className="flex justify-between text-base font-bold"><dt>{t.cart.orderTotal}</dt><dd>{money(o.total)}</dd></div>
          </dl>
        </div>
        <div className="h-fit rounded-xl border border-line bg-cream p-5 text-sm">
          <h3 className="mb-2 font-sans font-semibold">{t.checkout.shippingAddress}</h3>
          <address className="not-italic leading-relaxed text-slate-600">
            {o.customerInfo.firstName} {o.customerInfo.lastName}<br />{a.address}{a.apartment ? `, ${a.apartment}` : ""}<br />{a.city}, {a.state} {a.zip}<br />{a.country}
          </address>
        </div>
      </div>
    </div>
  );
}
