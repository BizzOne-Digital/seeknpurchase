/**
 * Quantity price tiers ("buy more, save more"), stored on a product as text like "10=12.99, 25=11.49":
 * at 10+ units each costs $12.99, at 25+ units $11.49. Shared by the server (pricing) and the browser.
 */
export type Tier = { min: number; price: number };

export function parseTiers(text?: string | null, basePrice = Infinity): Tier[] {
  const all: Tier[] = [];
  for (const part of String(text || "").split(/[,;\n]+/)) {
    const m = part.match(/^\s*(\d+)\s*\+?\s*[=:]\s*\$?\s*(\d+(?:\.\d+)?)\s*$/);
    if (!m) continue;
    const min = parseInt(m[1], 10);
    const price = Math.round(Number(m[2]) * 100) / 100;
    if (min >= 2 && price > 0 && price < basePrice) all.push({ min, price });
  }
  all.sort((a, b) => a.min - b.min);
  // One price per quantity, and each higher tier must be cheaper than every tier before it.
  const out: Tier[] = [];
  for (const t of all) {
    const prev = out[out.length - 1];
    if (prev && (t.min === prev.min || t.price >= prev.price)) continue;
    out.push(t);
  }
  return out;
}

export const formatTiers = (tiers: Tier[]) => tiers.map((t) => `${t.min}=${t.price.toFixed(2)}`).join(", ");

/** Unit price for a total quantity of the product. */
export function tierUnit(base: number, tiers: Tier[] | undefined, qty: number) {
  let unit = base;
  for (const t of tiers || []) if (qty >= t.min) unit = t.price;
  return unit;
}

/** Profit and margin % for a selling price and cost. */
export function margin(price: number, cost?: number) {
  if (!cost || cost <= 0 || !price) return null;
  const profit = Math.round((price - cost) * 100) / 100;
  return { profit, pct: Math.round((profit / price) * 1000) / 10 };
}
