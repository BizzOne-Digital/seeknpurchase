import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata: Metadata = { title: "Admin Sign In", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  if (await getAdminSession().catch(() => null)) redirect("/admin");
  return (
    <main className="flex min-h-screen items-center justify-center bg-navy px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lift">
        <p className="font-serif text-2xl font-bold">SeeknPurchase</p>
        <p className="mb-8 mt-1 text-sm text-slate-500">Admin portal · authorized staff only</p>
        <Suspense><AdminLoginForm /></Suspense>
      </div>
    </main>
  );
}
