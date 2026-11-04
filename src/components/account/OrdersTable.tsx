import Link from "next/link";
import { Package } from "lucide-react";
import type { OrderRow } from "@/lib/customer";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { formatDate, formatMoney } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function OrdersTable({ orders, t }: { orders: OrderRow[]; t: Dictionary }) {
  if (!orders.length) return <EmptyState icon={Package} title={t.account.noOrders} text={t.account.noOrdersText} actionHref="/shop" actionLabel={t.common.shopNow} />;
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">{t.account.orderId}</th>
            <th className="px-4 py-3 font-semibold">{t.account.date}</th>
            <th className="px-4 py-3 font-semibold">{t.cart.total}</th>
            <th className="px-4 py-3 font-semibold">{t.account.paymentStatus}</th>
            <th className="px-4 py-3 font-semibold">{t.account.fulfillment}</th>
            <th className="px-4 py-3"><span className="sr-only">{t.common.viewDetails}</span></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => (
            <tr key={o._id} className="hover:bg-cream/50">
              <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
              <td className="px-4 py-3">{formatDate(o.createdAt)}</td>
              <td className="px-4 py-3">{formatMoney(o.total, o.currency)}</td>
              <td className="px-4 py-3"><StatusBadge value={o.paymentStatus} /></td>
              <td className="px-4 py-3"><StatusBadge value={o.status} /></td>
              <td className="px-4 py-3 text-right"><Link href={`/account/orders/${o.orderNumber}`} className="link-arrow text-xs">{t.common.viewDetails}</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
