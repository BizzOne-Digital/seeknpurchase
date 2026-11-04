import { getHomepage, getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { getCustomerSession } from "@/lib/auth";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, home, { locale, t }, session] = await Promise.all([
    getSettings(),
    getHomepage(),
    getDictionary(),
    getCustomerSession().catch(() => null),
  ]);
  const messages = home.announcements.map((a) => (locale === "es" && a.es ? a.es : a.en)).filter(Boolean);

  return (
    <StoreProvider loggedIn={Boolean(session)} currency={settings.store.currency}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <AnnouncementBar messages={messages} />
      <Header businessName={settings.businessName} logo={settings.logo} />
      <main id="main" className="min-h-[60vh]">{children}</main>
      <Footer s={settings} t={t} />
      <CartDrawer freeShippingThreshold={settings.store.freeShippingThreshold} />
    </StoreProvider>
  );
}
