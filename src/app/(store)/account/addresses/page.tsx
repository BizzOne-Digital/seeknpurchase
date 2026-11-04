import { requireCustomerPage } from "@/lib/customer";
import { getDictionary } from "@/lib/i18n/server";
import { AddressManager } from "@/components/account/ProfileForms";

export default async function AddressesPage() {
  const [c, { t }] = await Promise.all([requireCustomerPage(), getDictionary()]);
  return (
    <section>
      <h2 className="mb-6 text-2xl">{t.account.addresses}</h2>
      <AddressManager initial={c.addresses as never} />
    </section>
  );
}
