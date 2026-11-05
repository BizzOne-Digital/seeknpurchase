"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStore } from "@/components/providers/StoreProvider";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/dictionaries";

function LangSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  return (
    <div className={cn("flex items-center text-xs font-semibold", className)} role="group" aria-label={t.nav.language}>
      {(["en", "es"] as Locale[]).map((l, i) => (
        <span key={l} className="flex items-center">
          {i > 0 && <span className="mx-1.5 text-slate-300" aria-hidden>|</span>}
          <button
            type="button"
            onClick={() => setLocale(l)}
            aria-pressed={locale === l}
            className={cn("uppercase transition", locale === l ? "text-navy" : "text-slate-400 hover:text-navy")}
          >
            {l}
          </button>
        </span>
      ))}
    </div>
  );
}

export function Header({ businessName, logo }: { businessName: string; logo?: string }) {
  const { t } = useI18n();
  const { count, ready, setCartOpen, wishlist } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const nav = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/shop", label: t.nav.shop, dropdown: true },
    { href: "/custom", label: t.nav.custom },
    { href: "/wholesale", label: t.nav.wholesale },
    { href: "/services", label: t.nav.services },
    { href: "/testimonials", label: t.nav.testimonials },
    { href: "/faq", label: t.nav.faq },
    { href: "/blog", label: t.nav.blog },
    { href: "/contact", label: t.nav.contact },
  ];
  const shopLinks = [
    { href: "/shop", label: t.nav.allProducts },
    { href: "/shop?flag=new&sort=newest", label: t.nav.newArrivals },
    { href: "/shop?flag=best&sort=best-selling", label: t.nav.bestSellers },
    { href: "/shop?category=fashion-accessories", label: t.nav.fashionAccessories },
    { href: "/shop?category=everyday-essentials", label: t.nav.everydayEssentials },
    { href: "/shop?category=gifts", label: t.nav.gifts },
    { href: "/shop?sale=1", label: t.nav.sale },
    { href: "/custom", label: t.nav.custom },
    { href: "/wholesale", label: t.nav.wholesale },
  ];

  useEffect(() => {
    setMobile(false);
    setShopOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobile(false);
        setSearchOpen(false);
        setShopOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobile]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const iconBtn = "relative flex h-10 w-10 items-center justify-center rounded-full text-navy transition hover:bg-cream-100";

  return (
    <header className={cn("sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-shadow", scrolled ? "border-line shadow-soft" : "border-transparent")}>
      <div className="container flex h-16 items-center justify-between gap-4 lg:h-[72px]">
        <div className="flex items-center gap-2">
          <button className={cn(iconBtn, "lg:hidden -ml-2")} onClick={() => setMobile(true)} aria-label={t.nav.menu} aria-expanded={mobile}>
            <Menu className="h-5 w-5" strokeWidth={1.6} />
          </button>
          <Logo name={businessName} logo={logo} />
        </div>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center xl:gap-2">
            {nav.map((n) =>
              n.dropdown ? (
                <li key={n.href} className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
                  <button
                    type="button"
                    aria-expanded={shopOpen}
                    aria-haspopup="true"
                    onClick={() => setShopOpen((v) => !v)}
                    className={cn("flex items-center gap-1 px-1.5 py-2 text-[13px] font-medium xl:px-2 xl:text-[14px] transition hover:text-gold-600", isActive(n.href) && "text-gold-600")}
                  >
                    {n.label} <ChevronDown className={cn("h-3.5 w-3.5 transition", shopOpen && "rotate-180")} />
                  </button>
                  <div className={cn("absolute left-1/2 top-full w-60 -translate-x-1/2 pt-2 transition-all", shopOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0")}>
                    <ul className="rounded-xl border border-line bg-white p-2 shadow-lift">
                      {shopLinks.map((s) => (
                        <li key={s.href}>
                          <Link href={s.href} className="block rounded-md px-3 py-2 text-sm text-navy hover:bg-cream hover:text-gold-600">
                            {s.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={isActive(n.href) ? "page" : undefined}
                    className={cn(
                      "relative px-1.5 py-2 text-[13px] font-medium xl:px-2 xl:text-[14px] transition hover:text-gold-600",
                      isActive(n.href) && "text-gold-600 after:absolute after:inset-x-2 after:-bottom-0.5 after:h-0.5 after:rounded after:bg-gold",
                    )}
                  >
                    {n.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-0.5 sm:gap-1">
          <LangSwitch className="mr-2 hidden sm:flex" />
          <button className={iconBtn} onClick={() => setSearchOpen((v) => !v)} aria-label={t.nav.search} aria-expanded={searchOpen}>
            <Search className="h-5 w-5" strokeWidth={1.6} />
          </button>
          <Link href="/account" className={cn(iconBtn, "hidden sm:flex")} aria-label={t.nav.account}>
            <User className="h-5 w-5" strokeWidth={1.6} />
          </Link>
          <Link href="/wishlist" className={cn(iconBtn, "hidden sm:flex")} aria-label={t.nav.wishlist}>
            <Heart className="h-5 w-5" strokeWidth={1.6} />
            {ready && wishlist.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-gold" aria-hidden />}
          </Link>
          <button className={iconBtn} onClick={() => setCartOpen(true)} aria-label={`${t.nav.cart} (${ready ? count : 0})`}>
            <ShoppingCart className="h-5 w-5" strokeWidth={1.6} />
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold px-1 text-[10px] font-bold text-white">
              {ready ? count : 0}
            </span>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className={cn("overflow-hidden border-t border-line bg-white transition-all duration-300", searchOpen ? "max-h-24 opacity-100" : "max-h-0 border-transparent opacity-0")}>
        <form onSubmit={submitSearch} className="container flex items-center gap-3 py-3" role="search">
          <Search className="h-5 w-5 text-slate-400" strokeWidth={1.6} />
          <label htmlFor="site-search" className="sr-only">{t.nav.search}</label>
          <input
            id="site-search"
            ref={searchRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.common.searchPlaceholder}
            className="flex-1 bg-transparent py-1.5 text-base focus:outline-none"
            tabIndex={searchOpen ? 0 : -1}
          />
          <button type="submit" className="btn-primary btn-sm" tabIndex={searchOpen ? 0 : -1}>{t.nav.search}</button>
        </form>
      </div>

      {/* Mobile drawer */}
      {mobile && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label={t.nav.menu}>
          <div className="absolute inset-0 animate-fade-in bg-navy/50 backdrop-blur-sm" onClick={() => setMobile(false)} />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm animate-slide-in flex-col bg-white shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo name={businessName} logo={logo} />
              <button onClick={() => setMobile(false)} className={iconBtn} aria-label={t.nav.close}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Mobile">
              <ul className="space-y-0.5">
                {nav.map((n) =>
                  n.dropdown ? (
                    <li key={n.href}>
                      <button
                        type="button"
                        onClick={() => setShopOpen((v) => !v)}
                        aria-expanded={shopOpen}
                        className="flex w-full items-center justify-between rounded-md px-3 py-3 text-[15px] font-medium hover:bg-cream"
                      >
                        {n.label} <ChevronDown className={cn("h-4 w-4 transition", shopOpen && "rotate-180")} />
                      </button>
                      {shopOpen && (
                        <ul className="mb-2 ml-3 animate-fade-in border-l border-line pl-3">
                          {shopLinks.map((s) => (
                            <li key={s.href}>
                              <Link href={s.href} onClick={() => setMobile(false)} className="block rounded-md px-3 py-2 text-sm text-slate-600 hover:bg-cream hover:text-navy">
                                {s.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ) : (
                    <li key={n.href}>
                      <Link
                        href={n.href}
                        onClick={() => setMobile(false)}
                        className={cn("block rounded-md px-3 py-3 text-[15px] font-medium hover:bg-cream", isActive(n.href) && "bg-cream text-gold-600")}
                      >
                        {n.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
              <div className="my-4 border-t border-line" />
              <ul className="space-y-0.5">
                <li><Link href="/account" onClick={() => setMobile(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-[15px] hover:bg-cream"><User className="h-4 w-4" strokeWidth={1.6} />{t.nav.account}</Link></li>
                <li><Link href="/wishlist" onClick={() => setMobile(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-[15px] hover:bg-cream"><Heart className="h-4 w-4" strokeWidth={1.6} />{t.nav.wishlist}</Link></li>
                <li><Link href="/cart" onClick={() => setMobile(false)} className="flex items-center gap-3 rounded-md px-3 py-3 text-[15px] hover:bg-cream"><ShoppingCart className="h-4 w-4" strokeWidth={1.6} />{t.nav.cart}</Link></li>
              </ul>
            </nav>
            <div className="flex items-center justify-between border-t border-line px-5 py-4">
              <span className="text-xs uppercase tracking-wider text-slate-500">{t.nav.language}</span>
              <LangSwitch />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
