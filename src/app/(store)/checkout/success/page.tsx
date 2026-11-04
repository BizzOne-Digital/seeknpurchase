import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Clock, PackageSearch } from "lucide-react";
import { connectDB, hasDb, serialize } from "@/lib/db";
import { Order } from "@/models";
import { getCustomerSession } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/server";
import { confirmStripeSession } from "@/lib/stripe";
import { formatMoney } from "@/lib/utils";
import { SmartImage } from "@/components/ui/SmartImage";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClearCart } from "@/components/checkout/ClearCart";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false } };

type OrderView = {
  _id: string; orderNumber: string; customer?: string; customerInfo: { firstName: string; lastName: string; email: string; phone?: string };
  shippingAddress: { address: string; apartment?: string; city: string; state: string; zip: string; country: string };
  items: { slug: string; name: string; image: string; variant?: string; price: number; quantity: number }[];
  subtotal: number; shipping: number; discount: number; tax: number; total: number; currency: string; paymentStatus: string; accessToken?: string;
};

async function loadOrder(sp: Record<string, string | undefined>): Promise<OrderView | null> {
  if (!hasDb()) return null;
  await connectDB();
  if (sp.session_id) {
    // Validate with Stripe server-side; marks the order paid only if Stripe confirms payment.
    await confirmStripeSession(sp.session_id).catch((e) => console.error("[success] stripe confirm", e));
    const o = await Order.findOne({ stripeSessionId: String(sp.session_id) }).select("+accessToken").lean();
    return o ? serialize<OrderView>(o) : null;
  }
  if (!sp.order) return null;
  const o = await Order.findOne({ orderNumber: String(sp.order) }).select("+accessToken").lean();
  if (!o) return null;
  const session = await getCustomerSession();
  const owns = session && o.customer && String(o.customer) === session.sub;
  if (!owns && (!sp.token || sp.token !== o.accessToken)) return null;
  return serialize<OrderView>(o);
}

export default async function SuccessPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { t } = await getDictionary();
  const order = await loadOrder(sp).catch(() => null);

  if (!order) {
    return (
      <div className="container py-16">
        <EmptyState icon={PackageSearch} title={t.errors.notFound} text={t.errors.notFoundText} actionHref="/shop" actionLabel={t.common.shopNow} />
      </div>
    );
  }
  const money = (n: number) => formatMoney(n, order.currency);
  const paid = order.paymentStatus === "paid";
  const a = order.shippingAddress;

  return (
    <div className="container max-w-3xl py-12 md:py-16">
      <ClearCart />
      <div className="text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-600" strokeWidth={1.4} />
        <h1 className="mt-4 text-3xl md:text-4xl">{t.checkout.successTitle}</h1>
        <p className="mt-2 text-slate-600">{t.checkout.successText}</p>
      </div>

      <div className="mt-10 grid gap-4 rounded-xl border border-line bg-cream p-6 sm:grid-cols-3">
        <div><p className="text-xs uppercase tracking-wider text-slate-500">{t.checkout.orderNumber}</p><p className="mt-1 font-semibold">{order.orderNumber}</p></div>
        <div><p className="text-xs uppercase tracking-wider text-slate-500">{t.checkout.customer}</p><p className="mt-1 font-semibold">{order.customerInfo.firstName} {order.customerInfo.lastName}</p><p className="text-sm text-slate-500">{order.customerInfo.email}</p></div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">{t.account.paymentStatus}</p>
          <p className={`mt-1 inline-flex items-center gap-1.5 font-semibold ${paid ? "text-emerald-700" : "text-amber-700"}`}>
            {paid ? <CheckCircle2 className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
            {paid ? t.checkout.paid : t.checkout.paymentPending}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_240px]">
        <div>
          <h2 className="mb-4 text-xl">{t.cart.summary}</h2>
          <ul className="divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.slug + (i.variant || "")} className="flex items-center gap-4 py-3">
                <div className="relative h-14 w-14 overflow-hidden rounded-md bg-cream"><SmartImage src={i.image} alt={i.name} fill sizes="56px" className="object-cover" /></div>
                <div className="flex-1 text-sm"><p className="font-medium">{i.name}</p>{i.variant && <p className="break-words text-xs text-slate-500">{i.variant}</p>}<p className="text-xs text-slate-500">× {i.quantity}</p></div>
                <span className="text-sm font-semibold">{money(i.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt>{t.cart.subtotal}</dt><dd>{money(order.subtotal)}</dd></div>
            {order.discount > 0 && <div className="flex justify-between text-emerald-700"><dt>{t.cart.discount}</dt><dd>-{money(order.discount)}</dd></div>}
            <div className="flex justify-between"><dt>{t.cart.shipping}</dt><dd>{order.shipping === 0 ? t.cart.free : money(order.shipping)}</dd></div>
            {order.tax > 0 && <div className="flex justify-between"><dt>{t.cart.tax}</dt><dd>{money(order.tax)}</dd></div>}
            <div className="flex justify-between text-base font-bold"><dt>{t.cart.orderTotal}</dt><dd>{money(order.total)}</dd></div>
          </dl>
        </div>
        <div>
          <h2 className="mb-4 text-xl">{t.checkout.shippingAddress}</h2>
          <address className="text-sm not-italic leading-relaxed text-slate-600">
            {order.customerInfo.firstName} {order.customerInfo.lastName}<br />
            {a.address}{a.apartment ? `, ${a.apartment}` : ""}<br />
            {a.city}, {a.state} {a.zip}<br />{a.country}
          </address>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href={order.customer ? `/account/orders/${order.orderNumber}` : `/account/orders`} className="btn-primary">{t.checkout.viewOrder}</Link>
        <Link href="/shop" className="btn-outline">{t.cart.continue}</Link>
      </div>
    </div>
  );
}
