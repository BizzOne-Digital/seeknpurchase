import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { getDictionary } from "@/lib/i18n/server";
import { getCustomerSession } from "@/lib/auth";
import { connectDB, hasDb } from "@/lib/db";
import { Customer } from "@/models";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

async function getPrefill() {
  const s = await getCustomerSession().catch(() => null);
  if (!s || !hasDb()) return {};
  try {
    await connectDB();
    const c = await Customer.findById(s.sub).lean();
    if (!c) return {};
    const [firstName, ...rest] = (c.name || "").split(" ");
    const a = c.addresses?.find((x) => x.isDefault) || c.addresses?.[0];
    return {
      firstName, lastName: rest.join(" "), email: c.email, phone: c.phone || "",
      ...(a ? { address: a.address, apartment: a.apartment || "", city: a.city, state: a.state, zip: a.zip, country: a.country || "United States" } : {}),
    };
  } catch {
    return {};
  }
}

export default async function CheckoutPage() {
  const [{ t }, s, prefill] = await Promise.all([getDictionary(), getSettings(), getPrefill()]);
  return (
    <div className="container py-10 md:py-14">
      <h1 className="mb-8 text-3xl md:text-4xl">{t.checkout.title}</h1>
      <CheckoutForm prefill={prefill} store={s.store} stripeEnabled={Boolean(process.env.STRIPE_SECRET_KEY)} />
    </div>
  );
}
