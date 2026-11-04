import type { Metadata } from "next";
import { requireCustomerPage } from "@/lib/customer";
import { getDictionary } from "@/lib/i18n/server";
import { AccountNav } from "@/components/account/AccountNav";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const [c, { t }] = await Promise.all([requireCustomerPage(), getDictionary()]);
  return (
    <div className="container py-10 md:py-14">
      <div className="mb-8">
        <p className="eyebrow">{t.nav.account}</p>
        <h1 className="mt-2 text-3xl md:text-4xl">{t.account.welcome}, {c.name.split(" ")[0]}</h1>
      </div>
      <div className="grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start"><AccountNav /></aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
