import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Gem, HeartHandshake, ShieldCheck, Target } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { getHomepage } from "@/lib/data";
import { IMG } from "@/lib/demo-data";
import { PageHero } from "@/components/ui/SectionHeading";
import { SmartImage } from "@/components/ui/SmartImage";

export const metadata: Metadata = {
  title: "About Us",
  description: "SeeknPurchase is your online destination for great products, stylish accessories and everyday essentials. Seek. Shop. Save.",
  alternates: { canonical: "/about" },
};

const copy = {
  en: {
    title: "About SeeknPurchase",
    intro: [
      "Welcome to SeeknPurchase.com, your online destination for discovering great products, stylish accessories, and everyday essentials.",
      "At SeeknPurchase, we believe shopping should be simple, enjoyable, and affordable.",
      "Our goal is to bring customers a variety of products that combine style, value, and convenience, making it easier to find something special for every occasion.",
      "From fashion accessories and unique finds to everyday merchandise, we are committed to offering a convenient online shopping experience with products that fit your lifestyle.",
      "Whether you're looking for something new, shopping for yourself, or finding the perfect gift, SeeknPurchase is here to help you discover more and shop with confidence.",
    ],
    thanks: "Thank you for choosing SeeknPurchase. We're excited to be part of your shopping journey.",
    blocks: [
      { t: "Our Story", d: "SeeknPurchase was created to make online shopping feel simple again — a single, trusted place to discover stylish accessories, everyday essentials and unique finds without endless searching." },
      { t: "Our Mission", d: "To bring customers a curated variety of products that combine style, value and convenience, so finding something special for every occasion is easy." },
      { t: "Why Shop With Us", d: "A carefully selected catalog, clear pricing, secure checkout and a friendly team that is ready to help with any product or order question." },
      { t: "Quality & Value", d: "Every product is chosen with quality and value in mind. We focus on pieces that look great, last, and are priced fairly." },
      { t: "Customer Experience", d: "From browsing to delivery, we aim to make every step smooth — with responsive support, easy returns and honest communication." },
    ],
    shop: "Start Shopping", contact: "Contact Us",
  },
  es: {
    title: "Sobre SeeknPurchase",
    intro: [
      "Bienvenido a SeeknPurchase.com, tu destino en línea para descubrir grandes productos, accesorios con estilo y esenciales diarios.",
      "En SeeknPurchase creemos que comprar debe ser simple, agradable y accesible.",
      "Nuestro objetivo es ofrecer una variedad de productos que combinen estilo, valor y comodidad, para que sea más fácil encontrar algo especial para cada ocasión.",
      "Desde accesorios de moda y hallazgos únicos hasta artículos de uso diario, ofrecemos una experiencia de compra en línea conveniente con productos que se adaptan a tu estilo de vida.",
      "Ya sea que busques algo nuevo, compres para ti o encuentres el regalo perfecto, SeeknPurchase está aquí para ayudarte a descubrir más y comprar con confianza.",
    ],
    thanks: "Gracias por elegir SeeknPurchase. Nos alegra ser parte de tu experiencia de compra.",
    blocks: [
      { t: "Nuestra Historia", d: "SeeknPurchase nació para que comprar en línea vuelva a ser simple: un lugar confiable para descubrir accesorios, esenciales y hallazgos únicos." },
      { t: "Nuestra Misión", d: "Ofrecer una variedad seleccionada de productos que combinen estilo, valor y comodidad para cada ocasión." },
      { t: "Por Qué Comprar Con Nosotros", d: "Un catálogo cuidado, precios claros, pago seguro y un equipo amable listo para ayudarte." },
      { t: "Calidad y Valor", d: "Elegimos cada producto pensando en la calidad y el valor: piezas que lucen bien, duran y tienen un precio justo." },
      { t: "Experiencia del Cliente", d: "Desde la navegación hasta la entrega, buscamos que cada paso sea sencillo, con soporte rápido y devoluciones fáciles." },
    ],
    shop: "Comenzar a Comprar", contact: "Contáctanos",
  },
};

const icons = [BookOpen, Target, HeartHandshake, Gem, ShieldCheck];

export default async function AboutPage() {
  const { locale } = await getDictionary();
  const home = await getHomepage();
  const c = copy[locale];
  return (
    <>
      <PageHero title={c.title} eyebrow="Seek. Shop. Save." image={IMG.store} />
      <section className="container section grid items-center gap-12 lg:grid-cols-2">
        <div className="space-y-4 text-[15.5px] leading-relaxed text-slate-600">
          {c.intro.map((p) => <p key={p}>{p}</p>)}
          <p className="pt-2 font-serif text-3xl font-bold text-gold">Seek. Shop. Save.</p>
          <p>{c.thanks}</p>
          <div className="flex flex-wrap gap-3 pt-4">
            <Link href="/shop" className="btn-primary">{c.shop}</Link>
            <Link href="/contact" className="btn-outline">{c.contact}</Link>
          </div>
        </div>
        <div className="relative grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
            <SmartImage src={home.about.image || IMG.rack} alt="Curated clothing collection" fill sizes="25vw" className="object-cover" />
          </div>
          <div className="relative mt-10 aspect-[3/4] overflow-hidden rounded-xl">
            <SmartImage src={IMG.editorial2} alt="Fashion lifestyle" fill sizes="25vw" className="object-cover" />
          </div>
        </div>
      </section>
      <section className="bg-cream section">
        <div className="container">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {c.blocks.map((b, i) => {
              const Icon = icons[i];
              return (
                <li key={b.t} className="rounded-xl border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-lift">
                  <Icon className="h-8 w-8 text-gold" strokeWidth={1.4} />
                  <h2 className="mt-4 text-xl">{b.t}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{b.d}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </>
  );
}
