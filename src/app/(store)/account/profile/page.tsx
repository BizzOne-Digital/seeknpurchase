import { requireCustomerPage } from "@/lib/customer";
import { getDictionary } from "@/lib/i18n/server";
import { ProfileForm } from "@/components/account/ProfileForms";

export default async function ProfilePage() {
  const [c, { t }] = await Promise.all([requireCustomerPage(), getDictionary()]);
  return (
    <section>
      <h2 className="mb-6 text-2xl">{t.account.profile}</h2>
      <ProfileForm initial={{ name: c.name, email: c.email, phone: c.phone }} />
    </section>
  );
}
