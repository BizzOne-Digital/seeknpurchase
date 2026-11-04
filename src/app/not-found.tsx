import Link from "next/link";
import { getDictionary } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getDictionary();
  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center bg-cream px-4 text-center">
      <p className="font-serif text-8xl font-bold text-gold/40">404</p>
      <h1 className="mt-4 text-3xl md:text-4xl">{t.errors.notFound}</h1>
      <p className="mt-3 max-w-md text-slate-600">{t.errors.notFoundText}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">{t.common.backHome}</Link>
        <Link href="/shop" className="btn-outline">{t.common.shopNow}</Link>
      </div>
    </main>
  );
}
