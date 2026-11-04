import { customerOrders, requireCustomerPage } from "@/lib/customer";
import { getDictionary } from "@/lib/i18n/server";
import { OrdersTable } from "@/components/account/OrdersTable";

export default async function AccountOrdersPage() {
  const c = await requireCustomerPage();
  const [{ t }, orders] = await Promise.all([getDictionary(), customerOrders(c._id, c.email)]);
  return (
    <section>
      <h2 className="mb-4 text-2xl">{t.account.orders}</h2>
      <OrdersTable orders={orders} t={t} />
    </section>
  );
}
