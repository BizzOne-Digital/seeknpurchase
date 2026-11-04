import { CheckCircle2, Clock, Heart, Package } from "lucide-react";
import { customerOrders, requireCustomerPage } from "@/lib/customer";
import { getDictionary } from "@/lib/i18n/server";
import { OrdersTable } from "@/components/account/OrdersTable";

export default async function AccountDashboard() {
  const c = await requireCustomerPage();
  const [{ t }, orders] = await Promise.all([getDictionary(), customerOrders(c._id, c.email)]);
  const pending = orders.filter((o) => ["Pending", "Processing", "Shipped"].includes(o.status)).length;
  const completed = orders.filter((o) => o.status === "Delivered").length;
  const cards = [
    { label: t.account.totalOrders, value: orders.length, Icon: Package },
    { label: t.account.pendingOrders, value: pending, Icon: Clock },
    { label: t.account.completedOrders, value: completed, Icon: CheckCircle2 },
    { label: t.account.wishlistItems, value: c.wishlist?.length || 0, Icon: Heart },
  ];
  return (
    <div className="space-y-10">
      <ul className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map(({ label, value, Icon }) => (
          <li key={label} className="rounded-xl border border-line bg-white p-5">
            <Icon className="h-5 w-5 text-gold" strokeWidth={1.6} />
            <p className="mt-3 font-serif text-3xl font-bold">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </li>
        ))}
      </ul>
      <section>
        <h2 className="mb-4 text-2xl">{t.account.orders}</h2>
        <OrdersTable orders={orders.slice(0, 5)} t={t} />
      </section>
    </div>
  );
}
