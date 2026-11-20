/** Sports shown in the Team Jerseys section. Jersey products use one of these as their subcategory. */
export const JERSEY_CATEGORY = "team-jerseys";

export const SPORTS = [
  { slug: "soccer", en: "Soccer", es: "Fútbol" },
  { slug: "baseball", en: "Baseball", es: "Béisbol" },
  { slug: "basketball", en: "Basketball", es: "Baloncesto" },
  { slug: "football", en: "Football", es: "Fútbol Americano" },
  { slug: "softball", en: "Softball", es: "Sóftbol" },
  { slug: "volleyball", en: "Volleyball", es: "Voleibol" },
  { slug: "hockey", en: "Hockey", es: "Hockey" },
] as const;

export const sportHref = (slug?: string) => `/shop?category=${JERSEY_CATEGORY}${slug ? `&sub=${slug}` : ""}`;
