import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | SeeknPurchase Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  // Server-side authorization (middleware is only the first gate).
  const session = await getAdminSession().catch(() => null);
  if (!session) redirect("/admin/login");
  return <AdminShell name={session.name} email={session.email}>{children}</AdminShell>;
}
