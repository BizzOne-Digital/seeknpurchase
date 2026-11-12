import type { Metadata } from "next";
import Link from "next/link";
import { Ruler } from "lucide-react";
import { getDictionary } from "@/lib/i18n/server";
import { PageHero } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Size Guide",
  description: "Standard size charts for adult and kids apparel (T-shirts, sweatshirts, hoodies) and hats.",
  alternates: { canonical: "/size-guide" },
};

const ADULT = [
  ["S", "34–36", "86–91", "28", "71"],
  ["M", "38–40", "97–102", "29", "74"],
  ["L", "42–44", "107–112", "30", "76"],
  ["XL", "46–48", "117–122", "31", "79"],
  ["2XL", "50–52", "127–132", "32", "81"],
  ["3XL", "54–56", "137–142", "33", "84"],
];
const KIDS = [
  ["XS", "4–5", "24–25", "61–64", "40–44", "102–112"],
  ["S", "6–7", "26–27", "66–69", "45–50", "114–127"],
  ["M", "8–9", "28–29", "71–74", "51–54", "130–137"],
  ["L", "10–12", "30–31", "76–79", "55–59", "140–150"],
  ["XL", "14–16", "32–34", "81–86", "60–64", "152–163"],
];
const HATS = [
  ["Kids", "6 1/4 – 6 1/2", "20 – 20 1/2", "51 – 52"],
  ["S", "6 5/8 – 6 3/4", "21 – 21 1/4", "53 – 54"],
  ["M", "6 7/8 – 7", "21 5/8 – 22", "55 – 56"],
  ["L", "7 1/8 – 7 1/4", "22 3/8 – 22 3/4", "57 – 58"],
  ["XL", "7 3/8 – 7 1/2", "23 1/8 – 23 1/2", "59 – 60"],
  ["2XL", "7 5/8 – 7 3/4", "23 7/8 – 24 1/4", "61 – 62"],
];

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[480px] text-sm">
        <thead className="bg-cream text-left">
          <tr>{head.map((h) => <th key={h} scope="col" className="px-4 py-3 font-semibold text-navy">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => (
            <tr key={r[0]}>
              {r.map((c, i) => (i === 0 ? <th key={i} scope="row" className="px-4 py-3 text-left font-semibold">{c}</th> : <td key={i} className="px-4 py-3 text-slate-600">{c}</td>))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function SizeGuidePage() {
  const { locale } = await getDictionary();
  const es = locale === "es";
  return (
    <>
      <PageHero eyebrow={es ? "Guía de tallas" : "Size Guide"} title={es ? "Encuentra tu talla" : "Find Your Fit"}
        subtitle={es ? "Tablas de tallas estándar para ropa y sombreros. Si estás entre dos tallas, elige la más grande." : "Standard size charts for apparel and hats. If you're between two sizes, we recommend the larger one."} />
      <div className="container section space-y-14">
        <nav aria-label={es ? "Secciones" : "Sections"} className="flex flex-wrap gap-2">
          {[["#apparel", es ? "Ropa adulto" : "Adult Apparel"], ["#kids", es ? "Ropa niños" : "Kids Apparel"], ["#hats", es ? "Sombreros" : "Hats"], ["#measure", es ? "Cómo medir" : "How to Measure"]].map(([h, l]) => (
            <a key={h} href={h} className="rounded-full border border-line px-4 py-2 text-sm font-medium hover:border-navy">{l}</a>
          ))}
        </nav>

        <section id="apparel" className="scroll-mt-28">
          <h2 className="h-section mb-2">{es ? "Ropa adulto (unisex)" : "Adult Apparel (Unisex)"}</h2>
          <p className="mb-5 text-sm text-slate-600">{es ? "Camisetas, sudaderas y hoodies. Medidas del cuerpo." : "T-shirts, sweatshirts and hoodies. Body measurements."}</p>
          <Table head={[es ? "Talla" : "Size", es ? "Pecho (in)" : "Chest (in)", es ? "Pecho (cm)" : "Chest (cm)", es ? "Largo (in)" : "Length (in)", es ? "Largo (cm)" : "Length (cm)"]} rows={ADULT} />
        </section>

        <section id="kids" className="scroll-mt-28">
          <h2 className="h-section mb-2">{es ? "Ropa niños" : "Kids Apparel"}</h2>
          <p className="mb-5 text-sm text-slate-600">{es ? "Guía por edad; verifica con la medida del pecho." : "Age is a guide; check against the chest measurement."}</p>
          <Table head={[es ? "Talla" : "Size", es ? "Edad" : "Age", es ? "Pecho (in)" : "Chest (in)", es ? "Pecho (cm)" : "Chest (cm)", es ? "Estatura (in)" : "Height (in)", es ? "Estatura (cm)" : "Height (cm)"]} rows={KIDS} />
        </section>

        <section id="hats" className="scroll-mt-28">
          <h2 className="h-section mb-2">{es ? "Sombreros y gorras" : "Hats & Caps"}</h2>
          <p className="mb-5 text-sm text-slate-600">{es ? "Medida de la circunferencia de la cabeza. Las gorras ajustables son talla única (aprox. 55–60 cm)." : "Measured around the head. Adjustable caps are one size (fits approx. 21 5/8 – 23 1/2 in)."}</p>
          <Table head={[es ? "Talla" : "Size", es ? "Talla de sombrero" : "Hat Size", es ? "Cabeza (in)" : "Head (in)", es ? "Cabeza (cm)" : "Head (cm)"]} rows={HATS} />
        </section>

        <section id="measure" className="scroll-mt-28 grid gap-4 md:grid-cols-3">
          {[
            [es ? "Pecho" : "Chest", es ? "Mide alrededor de la parte más ancha del pecho, bajo las axilas, con la cinta horizontal." : "Measure around the fullest part of your chest, under the arms, keeping the tape level."],
            [es ? "Largo" : "Length", es ? "Desde el punto más alto del hombro hasta el borde inferior de la prenda." : "From the highest point of the shoulder down to the bottom hem."],
            [es ? "Cabeza" : "Head", es ? "Mide alrededor de la cabeza, 1 cm sobre las cejas y orejas, donde se apoya el sombrero." : "Measure around your head about 1/2 in above the eyebrows and ears, where the hat sits."],
          ].map(([t, d]) => (
            <div key={t} className="card flex gap-3 p-5">
              <Ruler className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <div><p className="font-semibold">{t}</p><p className="mt-1 text-sm text-slate-600">{d}</p></div>
            </div>
          ))}
        </section>

        <p className="text-sm text-slate-600">
          {es ? "¿Dudas con tu talla? " : "Not sure about your size? "}
          <Link href="/contact" className="font-semibold underline hover:text-gold-600">{es ? "Contáctanos" : "Contact us"}</Link>
        </p>
      </div>
    </>
  );
}
