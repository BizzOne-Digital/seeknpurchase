"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgePercent, BookOpen, CalendarCheck, FileText, FolderTree, Gift, HelpCircle, Home, Image as ImageIcon, LayoutDashboard, LogOut,
  Mail, Menu, MessageSquareQuote, Newspaper, Package, Settings, ShoppingCart, Sparkles, Star, Users, UsersRound, X, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { group: "Overview", items: [{ href: "/admin", label: "Dashboard", Icon: LayoutDashboard }] },
  {
    group: "Commerce",
    items: [
      { href: "/admin/products", label: "Products", Icon: Package },
      { href: "/admin/categories", label: "Categories", Icon: FolderTree },
      { href: "/admin/orders", label: "Orders", Icon: ShoppingCart },
      { href: "/admin/customers", label: "Customers", Icon: Users },
      { href: "/admin/reviews", label: "Reviews", Icon: Star },
      { href: "/admin/offers", label: "Offers", Icon: Gift },
      { href: "/admin/coupons", label: "Coupons", Icon: BadgePercent },
    ],
  },
  {
    group: "Content",
    items: [
      { href: "/admin/homepage", label: "Hero / Homepage", Icon: Home },
      { href: "/admin/testimonials", label: "Testimonials", Icon: MessageSquareQuote },
      { href: "/admin/blogs", label: "Blogs", Icon: Newspaper },
      { href: "/admin/faqs", label: "FAQs", Icon: HelpCircle },
      { href: "/admin/team", label: "Team", Icon: UsersRound },
      { href: "/admin/services", label: "Services", Icon: Sparkles },
      { href: "/admin/pages", label: "Pages", Icon: FileText },
      { href: "/admin/media", label: "Media", Icon: ImageIcon },
    ],
  },
  {
    group: "Inbox",
    items: [
      { href: "/admin/bookings", label: "Booking Requests", Icon: CalendarCheck },
      { href: "/admin/contacts", label: "Contact Enquiries", Icon: Mail },
      { href: "/admin/newsletter", label: "Newsletter", Icon: BookOpen },
    ],
  },
  { group: "System", items: [{ href: "/admin/settings", label: "Settings", Icon: Settings }] },
];

export function AdminShell({ name, email, children }: { name: string; email: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const logout = async () => {
    await fetch("/api/auth/admin", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-5">
        <Link href="/admin" className="font-serif text-xl font-bold text-white">SeeknPurchase</Link>
        <span className="rounded bg-gold/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-100">Admin</span>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5" aria-label="Admin">
        {NAV.map((g) => (
          <div key={g.group}>
            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{g.group}</p>
            <ul className="space-y-0.5">
              {g.items.map(({ href, label, Icon }) => {
                const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm transition", active ? "bg-white/10 font-semibold text-white" : "text-white/70 hover:bg-white/5 hover:text-white")}
                    >
                      <Icon className={cn("h-4 w-4", active && "text-gold-100")} strokeWidth={1.6} /> {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm font-semibold text-white">{name}</p>
        <p className="truncate text-xs text-white/50">{email}</p>
        <button onClick={logout} className="mt-3 flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white">
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F6F4F0]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-navy lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Admin menu">
          <div className="absolute inset-0 bg-navy/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-slide-in bg-navy">{sidebar}</aside>
          <button onClick={() => setOpen(false)} className="absolute right-4 top-4 rounded-full bg-white p-2" aria-label="Close menu"><X className="h-5 w-5" /></button>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-line bg-white/95 px-4 backdrop-blur md:px-8">
          <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-cream lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
          <div className="hidden text-sm text-slate-500 lg:block">US SALES LLC · Store administration</div>
          <Link href="/" target="_blank" className="btn-ghost btn-sm"><ExternalLink className="h-4 w-4" /> View store</Link>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function AdminPageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl md:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
