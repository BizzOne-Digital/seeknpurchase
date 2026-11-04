import type { Locale } from "./dictionaries";

/**
 * Pick the Spanish variant of a DB field when available.
 * Supports both `fieldEn`/`fieldEs` and `field`/`fieldEs` naming.
 */
export function loc(obj: Record<string, unknown> | null | undefined, field: string, locale: Locale): string {
  if (!obj) return "";
  const es = obj[`${field}Es`];
  if (locale === "es" && typeof es === "string" && es.trim()) return es;
  const enVal = obj[`${field}En`];
  if (typeof enVal === "string" && enVal.trim()) return enVal;
  const base = obj[field];
  return typeof base === "string" ? base : "";
}

export function productTitle(p: { name: string; titleEn?: string; titleEs?: string }, locale: Locale) {
  if (locale === "es" && p.titleEs) return p.titleEs;
  return p.titleEn || p.name;
}

export function productDescription(p: { description?: string; descriptionEn?: string; descriptionEs?: string }, locale: Locale) {
  if (locale === "es" && p.descriptionEs) return p.descriptionEs;
  return p.descriptionEn || p.description || "";
}
