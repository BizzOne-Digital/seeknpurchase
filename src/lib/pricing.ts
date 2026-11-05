import "server-only";
import { connectDB } from "./db";
import { Coupon, Product } from "@/models";
import { getSettings } from "./data";
import { HttpError } from "./api";
import {
  DEFAULT_WHOLESALE_MIN, RETAIL_MAX_QTY, TEXT_COLORS, WHOLESALE_MAX_QTY, customizationPrice, customizationSummary, type CustomType, type Customization,
} from "./customization";

export type CartLine = { slug: string; quantity: number; variant?: string; wholesale?: boolean; custom?: Customization };
export type ShippingMethod = "standard" | "express";

const round = (n: number) => Math.round(n * 100) / 100;

export async function evaluateCoupon(code: string | undefined, subtotal: number) {
  if (!code) return { coupon: null, discount: 0 };
  await connectDB();
  const c = await Coupon.findOne({ code: String(code).toUpperCase().trim().slice(0, 40), active: true }).lean();
  const now = new Date();
  if (!c) throw new HttpError(400, "This coupon code is not valid.");
  if (c.startDate && c.startDate > now) throw new HttpError(400, "This coupon is not active yet.");
  if (c.expiryDate && c.expiryDate < now) throw new HttpError(400, "This coupon has expired.");
  if (c.usageLimit != null && (c.usedCount || 0) >= c.usageLimit) throw new HttpError(400, "This coupon has reached its usage limit.");
  if (subtotal < (c.minimumOrder || 0)) throw new HttpError(400, `This coupon requires a minimum order of $${c.minimumOrder}.`);
  let discount = c.type === "percentage" ? (subtotal * c.value) / 100 : c.value;
  if (c.maximumDiscount) discount = Math.min(discount, c.maximumDiscount);
  return { coupon: c, discount: round(Math.min(discount, subtotal)) };
}

/** Prices a cart from the database. Never trusts client-side prices. */
export async function priceCart(lines: CartLine[], opts: { couponCode?: string; shippingMethod?: ShippingMethod } = {}) {
  if (!lines.length) throw new HttpError(400, "Your cart is empty.");
  await connectDB();
  const slugs = [...new Set(lines.map((l) => String(l.slug)))];
  const products = await Product.find({ slug: { $in: slugs }, status: "published" }).lean();

  // Stock is checked against the total quantity of a product across all its cart lines.
  const totals = new Map<string, number>();
  // Wholesale minimums apply to the product total, so buyers can mix sizes/colors.
  const wholesaleTotals = new Map<string, number>();
  for (const l of lines) {
    if (l.wholesale) wholesaleTotals.set(String(l.slug), (wholesaleTotals.get(String(l.slug)) ?? 0) + Math.max(1, Math.floor(Number(l.quantity) || 1)));
  }

  const items = lines.map((l) => {
    const p = products.find((x) => x.slug === l.slug);
    if (!p) throw new HttpError(400, "One of the products in your cart is no longer available.");
    const wholesale = Boolean(l.wholesale);
    const qty = Math.max(1, Math.min(wholesale ? WHOLESALE_MAX_QTY : RETAIL_MAX_QTY, Math.floor(Number(l.quantity) || 1)));
    const used = (totals.get(p.slug) ?? 0) + qty;
    totals.set(p.slug, used);
    if ((p.stock ?? 0) < used) throw new HttpError(409, `Only ${p.stock ?? 0} left in stock for "${p.name}".`);

    let unit = p.price;
    if (wholesale) {
      if (!p.wholesalePrice || p.wholesalePrice <= 0) throw new HttpError(400, `"${p.name}" is no longer available at wholesale pricing.`);
      const min = p.wholesaleMinQty || DEFAULT_WHOLESALE_MIN;
      if ((wholesaleTotals.get(p.slug) ?? 0) < min) throw new HttpError(400, `Wholesale orders for "${p.name}" require at least ${min} units in total.`);
      unit = p.wholesalePrice;
    }

    let customization: (Customization & { unitCharge: number }) | undefined;
    if (l.custom) {
      if (!p.customizable) throw new HttpError(400, `"${p.name}" cannot be customized.`);
      const charge = customizationPrice(l.custom, (p.customType || "apparel") as CustomType);
      if (charge == null) throw new HttpError(400, `Please choose valid customization options for "${p.name}".`);
      if (l.custom.textColor && !TEXT_COLORS.some((c) => c.value === l.custom!.textColor)) throw new HttpError(400, "Please choose a valid text color.");
      customization = { ...l.custom, unitCharge: charge };
      unit += charge;
    }

    const baseVariant = l.variant ? String(l.variant).slice(0, 120) : "";
    const variant = [baseVariant, wholesale ? "Wholesale" : "", customization ? customizationSummary(customization) : ""].filter(Boolean).join(" | ");
    return {
      slug: p.slug,
      name: p.name,
      image: p.thumbnail || p.images?.[0] || "",
      variant: variant || undefined,
      price: round(unit),
      quantity: qty,
      wholesale: wholesale || undefined,
      customization,
    };
  });

  const settings = await getSettings();
  const subtotal = round(items.reduce((n, i) => n + i.price * i.quantity, 0));
  const { coupon, discount } = await evaluateCoupon(opts.couponCode, subtotal);
  const afterDiscount = subtotal - discount;
  const method: ShippingMethod = opts.shippingMethod === "express" ? "express" : "standard";
  const free = settings.store.freeShippingThreshold > 0 && afterDiscount >= settings.store.freeShippingThreshold;
  const shipping = method === "express" ? settings.store.expressShipping : free ? 0 : settings.store.standardShipping;
  const tax = round((afterDiscount * (settings.store.taxRate || 0)) / 100);
  const total = round(afterDiscount + shipping + tax);

  return { items, subtotal, discount, shipping: round(shipping), shippingMethod: method, tax, total, coupon, currency: settings.store.currency };
}
