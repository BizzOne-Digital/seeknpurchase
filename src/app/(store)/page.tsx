import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBlogPosts, getFaqs, getFeaturedProducts, getHomepage, getOffers, getServices, getSettings, getTestimonials, queryProducts, toCard } from "@/lib/data";
import { IMG } from "@/lib/demo-data";
import { LifestyleSection, OffersBanner, ProductRow, TrustBar, homeExtraText } from "@/components/home/ExtraSections";
import { getDictionary } from "@/lib/i18n/server";
import { loc } from "@/lib/i18n/localize";
import { CustomBanner } from "@/components/home/CustomBanner";
import { Hero } from "@/components/home/Hero";
import { CategoryCards } from "@/components/home/CategoryCards";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesGrid } from "@/components/home/ServicesStrip";
import { TestimonialsCarousel } from "@/components/home/Testimonials";
import { PromoBanner } from "@/components/home/PromoBanner";
import { BlogCard } from "@/components/blog/BlogCard";
import { ProductCard } from "@/components/product/ProductCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Accordion } from "@/components/ui/Accordion";

export const revalidate = 300;

export default async function HomePage() {
  const { locale, t } = await getDictionary();
  const home = await getHomepage();
  const [products, services, testimonials, faqs, posts, offers, settings, newest, best] = await Promise.all([
    getFeaturedProducts(home.featuredProductSlugs, 5),
    getServices(),
    getTestimonials(),
    getFaqs(),
    getBlogPosts(3, home.blogSlugs),
    getOffers(),
    getSettings(),
    queryProducts({ flag: "new", sort: "newest", perPage: 4 }),
    queryProducts({ flag: "best", sort: "best-selling", perPage: 4 }),
  ]);
  const x = homeExtraText[locale];
  const homeServices = services.filter((s) => s.showOnHome).slice(0, 4);

  return (
    <>
      <Hero hero={home.hero} locale={locale} />
      <CategoryCards cards={home.categoryCards} locale={locale} cta={t.common.shopNow} />
      <TrustBar locale={locale} freeShippingThreshold={settings.store.freeShippingThreshold} currency={settings.store.currency} />

      <section className="container section" aria-labelledby="featured-heading">
        <SectionHeading title={t.home.featuredProducts} href="/shop" linkLabel={t.common.viewAllProducts} />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {products.map((p, i) => (
            <li key={p.slug}><ProductCard p={toCard(p, locale)} priority={i < 2} /></li>
          ))}
        </ul>
      </section>

      <CustomBanner locale={locale} />
      <OffersBanner offers={offers} locale={locale} />
      <ProductRow title={x.newArrivals} href="/shop?flag=new&sort=newest" products={newest.items} locale={locale} />

      <AboutSection about={home.about} locale={locale} t={t} />

      <ProductRow title={x.bestSellers} href="/shop?flag=best&sort=best-selling" products={best.items} locale={locale} />
      <LifestyleSection locale={locale} images={[IMG.editorial2, IMG.editorial1, IMG.giftAlt]} />

      <section className="container section" aria-labelledby="services-heading">
        <SectionHeading title={t.home.ourServices} href="/services" linkLabel={t.common.viewAll} />
        <ServicesGrid services={homeServices.length ? homeServices : services.slice(0, 4)} locale={locale} />
      </section>

      {testimonials.length > 0 && (
        <section className="bg-cream/60 py-14" aria-label={t.home.whatCustomersSay}>
          <div className="container"><TestimonialsCarousel items={testimonials} /></div>
        </section>
      )}

      <section className="container section grid gap-12 lg:grid-cols-2 lg:gap-10">
        <div>
          <div className="mb-5 flex items-end justify-between">
            <h2 className="text-2xl md:text-3xl">{t.home.faqTitle}</h2>
            <Link href="/faq" className="link-arrow text-xs uppercase tracking-wider">{t.home.viewAllFaq} <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <Accordion compact items={faqs.slice(0, 5).map((f) => ({ q: loc(f, "question", locale), a: loc(f, "answer", locale) }))} />
        </div>
        <div className="lg:border-l lg:border-line lg:pl-10">
          <div className="mb-5 flex items-end justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl md:text-3xl">{t.home.fromBlog}</h2>
              <span aria-hidden className="hidden h-px w-12 bg-gold sm:block" />
            </div>
            <Link href="/blog" className="link-arrow text-xs uppercase tracking-wider">{t.home.viewAllPosts} <ArrowRight className="h-3.5 w-3.5" /></Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <li key={p.slug}><BlogCard post={p} locale={locale} readMore={t.common.readMore} compact /></li>
            ))}
          </ul>
        </div>
      </section>

      <PromoBanner promo={home.promo} locale={locale} t={t} />
    </>
  );
}
