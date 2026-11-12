import "server-only";
import type { Model } from "mongoose";
import {
  BlogPost, BookingRequest, Category, ContactSubmission, Coupon, FAQ, NewsletterSubscriber, Page, Product, Review, Service,
  SpecialOffer, TeamMember, Testimonial,
} from "@/models";
import { RESOURCES, type ResourceDef } from "./resources";
import { HttpError } from "@/lib/api";
import { slugify } from "@/lib/utils";
import { formatTiers, parseTiers } from "@/lib/tiers";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MODELS: Record<string, Model<any>> = {
  products: Product, categories: Category, reviews: Review, testimonials: Testimonial, blogs: BlogPost, faqs: FAQ, team: TeamMember,
  services: Service, pages: Page, offers: SpecialOffer, coupons: Coupon, bookings: BookingRequest, contacts: ContactSubmission,
  newsletter: NewsletterSubscriber,
};

export function getResource(key: string): { def: ResourceDef; model: Model<any> } { // eslint-disable-line @typescript-eslint/no-explicit-any
  const def = RESOURCES[key];
  const model = MODELS[key];
  if (!def || !model) throw new HttpError(404, "Unknown resource");
  return { def, model };
}

const URL_OK = (s: string) => s.startsWith("/") || /^https:\/\//.test(s);

/** Whitelists and coerces incoming admin data according to the resource field definitions. */
export function sanitize(def: ResourceDef, input: Record<string, unknown>, partial = false) {
  const out: Record<string, unknown> = {};
  for (const f of def.fields) {
    if (f.readOnly) continue;
    if (!(f.name in input)) {
      if (!partial && f.default !== undefined) out[f.name] = f.default;
      continue;
    }
    const v = input[f.name];
    switch (f.type) {
      case "number":
      case "money": {
        if (v === "" || v === null || v === undefined) {
          out[f.name] = undefined;
          break;
        }
        const n = Number(v);
        if (!Number.isFinite(n)) throw new HttpError(422, `${f.label} must be a number`);
        out[f.name] = f.type === "money" ? Math.round(n * 100) / 100 : n;
        break;
      }
      case "boolean":
        out[f.name] = v === true || v === "true" || v === "on" || v === 1;
        break;
      case "date":
        out[f.name] = v ? new Date(String(v)) : null;
        if (out[f.name] instanceof Date && isNaN((out[f.name] as Date).getTime())) throw new HttpError(422, `${f.label} is not a valid date`);
        break;
      case "image":
        out[f.name] = typeof v === "string" && v && URL_OK(v) ? v.slice(0, 600) : "";
        break;
      case "images":
        out[f.name] = Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && URL_OK(x)).slice(0, 20) : [];
        break;
      case "tags":
        out[f.name] = (Array.isArray(v) ? v : String(v || "").split(","))
          .map((x) => String(x).trim())
          .filter(Boolean)
          .slice(0, 30);
        break;
      case "variants":
        out[f.name] = Array.isArray(v)
          ? v
              .map((x) => ({
                name: String((x as { name?: unknown })?.name || "").trim().slice(0, 40),
                options: (Array.isArray((x as { options?: unknown })?.options) ? ((x as { options: unknown[] }).options) : [])
                  .map((o) => String(o).trim())
                  .filter(Boolean)
                  .slice(0, 30),
              }))
              .filter((x) => x.name && x.options.length)
              .slice(0, 5)
          : [];
        break;
      case "select":
        if (f.options?.length && v && !f.options.some((o) => o.value === v)) {
          // category options are loaded dynamically; accept any slug-like value
          if (f.name !== "category") throw new HttpError(422, `${f.label} has an invalid value`);
        }
        out[f.name] = v === "" ? undefined : String(v).slice(0, 200);
        break;
      default:
        out[f.name] = v === null || v === undefined ? "" : String(v).slice(0, f.type === "longtext" ? 50000 : f.type === "textarea" ? 5000 : 300);
    }
    if (f.required && !partial && (out[f.name] === undefined || out[f.name] === "")) {
      throw new HttpError(422, `${f.label} is required`);
    }
  }
  // Slugs: generate from the source field when empty, always normalize.
  for (const f of def.fields.filter((x) => x.type === "slug")) {
    if (partial && !(f.name in out)) continue;
    const raw = (out[f.name] as string) || (f.slugFrom ? String(out[f.slugFrom] || input[f.slugFrom] || "") : "");
    const s = slugify(raw);
    if (!s) throw new HttpError(422, `${f.label} is required`);
    out[f.name] = s;
  }
  if (typeof out.priceTiers === "string") out.priceTiers = formatTiers(parseTiers(out.priceTiers));
  return out;
}
