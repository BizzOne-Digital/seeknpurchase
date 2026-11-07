/**
 * Drawn product mockups for the designer. Drawn (not photos) so the garment can take any color
 * and show a back side. All coordinates use a 400x400 box; print areas are percentages of it.
 */

export type MockupKind = "tee" | "sweatshirt" | "hoodie" | "tote" | "cup" | "cap";
export type Side = "front" | "back";
export type Area = { x: number; y: number; w: number; h: number };

export function mockupKind(slug: string, customType?: string): MockupKind {
  if (customType === "tote") return "tote";
  if (customType === "cup") return "cup";
  if (customType === "cap") return "cap";
  if (slug.includes("hoodie")) return "hoodie";
  if (slug.includes("sweatshirt") || slug.includes("crewneck")) return "sweatshirt";
  return "tee";
}

/** Garment outline and detail lines for each side. */
export const SHAPES: Record<MockupKind, Partial<Record<Side, { body: string; lines: string }>>> = {
  tee: {
    front: {
      body: "M140 52 L72 82 L28 152 L82 182 L104 152 L104 360 L296 360 L296 152 L318 182 L372 152 L328 82 L260 52 C246 82 154 82 140 52Z",
      lines: "M140 52 C154 92 246 92 260 52 M104 152 L104 160 M296 152 L296 160 M82 182 L104 152 M318 182 L296 152",
    },
    back: {
      body: "M140 52 L72 82 L28 152 L82 182 L104 152 L104 360 L296 360 L296 152 L318 182 L372 152 L328 82 L260 52 C240 64 160 64 140 52Z",
      lines: "M140 52 C160 66 240 66 260 52 M82 182 L104 152 M318 182 L296 152",
    },
  },
  sweatshirt: {
    front: {
      body: "M142 54 L84 76 L36 300 L80 312 L112 176 L112 352 L288 352 L288 176 L320 312 L364 300 L316 76 L258 54 C244 82 156 82 142 54Z",
      lines: "M142 54 C156 92 244 92 258 54 M112 334 L288 334 M42 278 L84 290 M358 278 L316 290",
    },
    back: {
      body: "M142 54 L84 76 L36 300 L80 312 L112 176 L112 352 L288 352 L288 176 L320 312 L364 300 L316 76 L258 54 C240 66 160 66 142 54Z",
      lines: "M142 54 C160 68 240 68 258 54 M112 334 L288 334 M42 278 L84 290 M358 278 L316 290",
    },
  },
  hoodie: {
    front: {
      body: "M142 70 L84 90 L36 304 L80 316 L112 186 L112 356 L288 356 L288 186 L320 316 L364 304 L316 90 L258 70 C266 20 134 20 142 70Z",
      lines: "M142 70 C162 112 238 112 258 70 M184 104 L180 150 M216 104 L220 146 M148 266 L252 266 L268 330 L132 330Z M112 338 L288 338",
    },
    back: {
      body: "M142 70 L84 90 L36 304 L80 316 L112 186 L112 356 L288 356 L288 186 L320 316 L364 304 L316 90 L258 70 C266 20 134 20 142 70Z",
      lines: "M150 66 C170 40 230 40 250 66 M112 338 L288 338",
    },
  },
  tote: {
    front: { body: "M86 150 L314 150 L330 360 L70 360Z", lines: "M140 150 C140 40 260 40 260 150 M152 150 C152 58 248 58 248 150" },
    back: { body: "M86 150 L314 150 L330 360 L70 360Z", lines: "M140 150 C140 40 260 40 260 150 M152 150 C152 58 248 58 248 150" },
  },
  cup: {
    front: { body: "M96 96 L276 96 L276 320 C276 344 258 356 236 356 L136 356 C114 356 96 344 96 320Z M276 140 C336 140 336 270 276 270 L276 248 C310 248 310 162 276 162Z", lines: "M96 108 L276 108" },
  },
  cap: {
    front: { body: "M70 252 C70 96 330 96 330 252Z M110 252 C150 286 250 286 290 252 L330 252 C320 300 80 300 70 252Z", lines: "M200 112 L200 252 M136 130 C160 180 166 220 168 252 M264 130 C240 180 234 220 232 252" },
  },
};

/** Where the design can go for each placement value (sides and print area per side). */
export const PRINT_AREAS: Record<string, Partial<Record<Side, Area>>> = {
  front: { front: { x: 33, y: 27, w: 34, h: 46 } },
  back: { back: { x: 32, y: 22, w: 36, h: 50 } },
  "front-back": { front: { x: 33, y: 27, w: 34, h: 46 }, back: { x: 32, y: 22, w: 36, h: 50 } },
  "left-chest": { front: { x: 56, y: 27, w: 13, h: 12 } },
  "one-side": { front: { x: 30, y: 46, w: 40, h: 40 } },
  "both-sides": { front: { x: 30, y: 46, w: 40, h: 40 }, back: { x: 30, y: 46, w: 40, h: 40 } },
  "cup-one-side": { front: { x: 32, y: 34, w: 30, h: 44 } },
  "cup-wrap": { front: { x: 26, y: 32, w: 42, h: 48 } },
  "cap-front": { front: { x: 37, y: 36, w: 26, h: 20 } },
  "cap-side": { front: { x: 21, y: 44, w: 16, h: 14 } },
};

/** Hoodie front has the pocket and drawstrings, so its front print sits higher. */
export function printArea(kind: MockupKind, placement: string, side: Side): Area | undefined {
  const a = PRINT_AREAS[placement]?.[side];
  if (a && kind === "hoodie" && side === "front" && placement !== "left-chest") return { x: 34, y: 33, w: 32, h: 30 };
  if (a && kind === "hoodie" && side === "back") return { x: 32, y: 28, w: 36, h: 46 };
  return a;
}

export const sidesFor = (placement: string): Side[] => (Object.keys(PRINT_AREAS[placement] || { front: 1 }) as Side[]);

const COLORS: Record<string, string> = {
  white: "#f6f5f2", black: "#1d1d1f", navy: "#1f2a44", "heather gray": "#b8babd", gray: "#9a9ca0", grey: "#9a9ca0",
  natural: "#e8ddc6", cream: "#efe6d4", red: "#b42318", royal: "#2350a8", "royal blue": "#2350a8", blue: "#3567b5",
  green: "#2f6b45", "forest green": "#244c34", maroon: "#6d1f2c", pink: "#e8a3b5", yellow: "#f2c94c", orange: "#e07a2f",
  purple: "#5b3f8c", brown: "#6b4a33", tan: "#c8a97e", sand: "#d8c6a3", oat: "#dccfb4", charcoal: "#3b3d40",
};

/** Garment color from a variant name like "Navy"; falls back to white. */
export function colorHex(name?: string): string {
  if (!name) return COLORS.white;
  return COLORS[name.trim().toLowerCase()] || COLORS.white;
}

export const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 < 110;
};
