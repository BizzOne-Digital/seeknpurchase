import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import type { SettingsDTO } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Logo } from "@/components/ui/Logo";
import { SocialIcons } from "./SocialIcons";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function Footer({ s, t }: { s: SettingsDTO; t: Dictionary }) {
  const cols = [
    {
      title: t.footer.shop,
      links: [
        ["/shop", t.nav.allProducts], ["/shop?flag=new&sort=newest", t.nav.newArrivals], ["/shop?flag=best&sort=best-selling", t.nav.bestSellers],
        ["/shop?sale=1", t.nav.sale], ["/custom", t.nav.custom], ["/wholesale", t.nav.wholesale], ["/shop?view=collections", t.nav.collections],
      ],
    },
    {
      title: t.footer.company,
      links: [["/about", t.footer.aboutUs], ["/services", t.nav.services], ["/testimonials", t.nav.testimonials], ["/blog", t.nav.blog], ["/contact", t.nav.contact]],
    },
    {
      title: t.footer.help,
      links: [["/faq", t.nav.faq], ["/shipping-policy", t.footer.shipping], ["/return-policy", t.footer.returns], ["/faq#payment", t.footer.payment], ["/faq#sizing", t.footer.sizeGuide]],
    },
  ];
  const tel = s.phone.replace(/[^\d+]/g, "");

  return (
    <footer className="bg-navy text-white/80">
      <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-3">
          <Logo name={s.businessName} logo={s.logo} light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed">{t.footer.about}</p>
          <p className="mt-1 text-sm">{t.footer.tagline}</p>
          <div className="mt-6"><SocialIcons social={s.social} /></div>
        </div>
        {cols.map((c) => (
          <nav key={c.title} aria-label={c.title} className="lg:col-span-2 lg:border-l lg:border-white/10 lg:pl-8 first-of-type:lg:col-span-2">
            <h2 className="mb-4 font-sans text-sm font-semibold text-white">{c.title}</h2>
            <ul className="space-y-2.5 text-sm">
              {c.links.map(([href, label]) => (
                <li key={href}><Link href={href} className="transition hover:text-gold-100">{label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="lg:col-span-3 lg:border-l lg:border-white/10 lg:pl-8">
          <h2 className="mb-4 font-sans text-sm font-semibold text-white">{t.footer.contactUs}</h2>
          <ul className="space-y-3 text-sm">
            <li><a href={`mailto:${s.email}`} className="flex items-center gap-3 hover:text-gold-100"><Mail className="h-4 w-4 shrink-0" strokeWidth={1.6} />{s.email}</a></li>
            <li><a href={`tel:${tel}`} className="flex items-center gap-3 hover:text-gold-100"><Phone className="h-4 w-4 shrink-0" strokeWidth={1.6} />{s.phone}</a></li>
            {s.address && <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.6} /><span className="whitespace-pre-line">{s.address}</span></li>}
          </ul>
          <h2 className="mb-2 mt-7 font-sans text-sm font-semibold text-white">{t.newsletter.title}</h2>
          <p className="mb-3 text-sm">{t.newsletter.text}</p>
          <NewsletterForm />
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-3 py-5 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} {s.businessName}. {t.footer.rights}</p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <li><Link href="/privacy-policy" className="hover:text-white">{t.footer.privacy}</Link></li>
            <li aria-hidden className="text-white/30">|</li>
            <li><Link href="/terms" className="hover:text-white">{t.footer.terms}</Link></li>
            <li aria-hidden className="text-white/30">|</li>
            <li><Link href="/privacy-policy#cookies" className="hover:text-white">{t.footer.cookies}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
