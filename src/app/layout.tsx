import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { siteUrl } from "@/lib/utils";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";

const serif = Playfair_Display({ subsets: ["latin"], variable: "--font-serif", display: "swap", weight: ["500", "600", "700"] });
const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const title = s.seo.defaultTitle || s.businessName;
  const description = s.seo.defaultDescription;
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: `%s | ${s.businessName}` },
    description,
    alternates: { canonical: "/" },
    icons: s.favicon ? { icon: s.favicon } : undefined,
    openGraph: { type: "website", siteName: s.businessName, title, description, images: s.seo.ogImage ? [s.seo.ogImage] : [] },
    twitter: { card: "summary_large_image", title, description, images: s.seo.ogImage ? [s.seo.ogImage] : [] },
  };
}

export const viewport: Viewport = { themeColor: "#172333", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getDictionary();
  return (
    <html lang={locale} className={`${serif.variable} ${sans.variable}`}>
      <body>
        <I18nProvider locale={locale} dict={t}>
          <ToastProvider>{children}</ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
