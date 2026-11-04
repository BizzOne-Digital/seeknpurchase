/**
 * T-shirt customization options and wholesale helpers.
 * Shared by the browser (to show prices) and the server (to charge them),
 * so the server always recalculates and never trusts client prices.
 * Edit the prices/options here to change what customers can choose.
 */

export type Customization = {
  placement: string; // PLACEMENTS value
  method: string; // METHODS value
  text?: string; // optional custom text printed on the shirt
  textColor?: string; // TEXT_COLORS value
  artworkUrl?: string; // optional link to a logo / design (Google Drive, Dropbox, etc.)
  notes?: string; // instructions for the print team
};

export const PLACEMENTS = [
  { value: "front", en: "Front", es: "Frente", price: 8 },
  { value: "back", en: "Back", es: "Espalda", price: 8 },
  { value: "front-back", en: "Front & Back", es: "Frente y Espalda", price: 14 },
  { value: "left-chest", en: "Left Chest (small logo)", es: "Pecho Izquierdo (logo pequeño)", price: 5 },
] as const;

export const METHODS = [
  { value: "screen-print", en: "Screen Print", es: "Serigrafía", price: 0 },
  { value: "dtf", en: "Full-Color Print (DTF)", es: "Impresión a Todo Color (DTF)", price: 3 },
  { value: "embroidery", en: "Embroidery", es: "Bordado", price: 6 },
] as const;

export const TEXT_COLORS = [
  { value: "black", en: "Black", es: "Negro", hex: "#111111" },
  { value: "white", en: "White", es: "Blanco", hex: "#ffffff" },
  { value: "navy", en: "Navy", es: "Azul Marino", hex: "#1f2a44" },
  { value: "red", en: "Red", es: "Rojo", hex: "#b42318" },
  { value: "gold", en: "Gold", es: "Dorado", hex: "#c9a14a" },
] as const;

export const CUSTOM_TEXT_MAX = 40;

/** Extra cost per shirt for the chosen options. Returns null if an option is invalid. */
export function customizationPrice(c: Customization): number | null {
  const pl = PLACEMENTS.find((p) => p.value === c.placement);
  const me = METHODS.find((m) => m.value === c.method);
  if (!pl || !me) return null;
  return pl.price + me.price;
}

/** Short, human-readable summary saved on the cart line and the order (shown to admin + customer). */
export function customizationSummary(c: Customization): string {
  const pl = PLACEMENTS.find((p) => p.value === c.placement)?.en ?? c.placement;
  const me = METHODS.find((m) => m.value === c.method)?.en ?? c.method;
  const parts = [`Custom: ${pl}, ${me}`];
  if (c.text) parts.push(`Text "${c.text}"${c.textColor ? ` (${TEXT_COLORS.find((t) => t.value === c.textColor)?.en ?? c.textColor})` : ""}`);
  if (c.artworkUrl) parts.push(`Artwork: ${c.artworkUrl}`);
  if (c.notes) parts.push(`Notes: ${c.notes}`);
  return parts.join(" · ");
}

/** Quantity cap per cart line. Wholesale lines allow bulk quantities. */
export const RETAIL_MAX_QTY = 99;
export const WHOLESALE_MAX_QTY = 5000;
export const DEFAULT_WHOLESALE_MIN = 12;
