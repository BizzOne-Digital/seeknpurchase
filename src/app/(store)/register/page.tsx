import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/server";
import { getCustomerSession } from "@/lib/auth";
import { AuthForm } from "@/components/forms/AuthForm";
import { SmartImage } from "@/components/ui/SmartImage";
import { IMG } from "@/lib/demo-data";

export const metadata: Metadata = { title: "Create Account", robots: { index: false } };

export default async function RegisterPage() {
  if (await getCustomerSession().catch(() => null)) redirect("/account");
  const { t } = await getDictionary();
  return (
    <div className="grid min-h-[70vh] lg:grid-cols-2">
      <div className="relative hidden lg:block">
        <SmartImage src={IMG.editorial2} alt="" fill sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy/30" />
      </div>
      <div className="flex items-center justify-center px-4 py-14">
        <div className="w-full max-w-sm">
          <h1 className="text-3xl">{t.account.register}</h1>
          <p className="mb-8 mt-2 text-sm text-slate-500">Seek. Shop. Save.</p>
          <Suspense><AuthForm mode="register" /></Suspense>
        </div>
      </div>
    </div>
  );
}
