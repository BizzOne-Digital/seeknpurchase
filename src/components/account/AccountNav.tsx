"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, ShieldCheck, User } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { cn } from "@/lib/utils";

export function AccountNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const links = [
    { href: "/account", label: t.account.dashboard, Icon: LayoutDashboard },
    { href: "/account/orders", label: t.account.orders, Icon: Package },
    { href: "/account/profile", label: t.account.profile, Icon: User },
    { href: "/account/addresses", label: t.account.addresses, Icon: MapPin },
    { href: "/account/wishlist", label: t.account.wishlist, Icon: Heart },
    { href: "/account/security", label: t.account.security, Icon: ShieldCheck },
  ];
  const logout = async () => {
    await fetch("/api/auth/customer", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };
  return (
    <nav aria-label="Account" className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:px-0">
      {links.map(({ href, label, Icon }) => {
        const active = href === "/account" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn("flex shrink-0 items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium transition", active ? "bg-navy text-white" : "hover:bg-cream")}
          >
            <Icon className="h-4 w-4" strokeWidth={1.6} /> {label}
          </Link>
        );
      })}
      <button onClick={logout} className="flex shrink-0 items-center gap-3 rounded-md px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
        <LogOut className="h-4 w-4" strokeWidth={1.6} /> {t.account.signOut}
      </button>
    </nav>
  );
}
