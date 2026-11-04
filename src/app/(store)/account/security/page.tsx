import { getDictionary } from "@/lib/i18n/server";
import { PasswordForm } from "@/components/account/ProfileForms";

export default async function SecurityPage() {
  const { t } = await getDictionary();
  return (
    <section>
      <h2 className="mb-6 text-2xl">{t.account.security}</h2>
      <PasswordForm />
    </section>
  );
}
