import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = { title: "Shopping Cart", robots: { index: false } };

export default async function CartPage() {
  const [{ t }, s] = await Promise.all([getDictionary(), getSettings()]);
  return (
    <div className="container py-10 md:py-14">
      <h1 className="mb-8 text-3xl md:text-4xl">{t.cart.title}</h1>
      <CartView shippingFlat={s.store.standardShipping} freeThreshold={s.store.freeShippingThreshold} taxRate={s.store.taxRate} />
    </div>
  );
}
