import { z } from "zod";
import { CUSTOM_TEXT_MAX, WHOLESALE_MAX_QTY } from "./customization";

const str = (max = 200) => z.string().trim().max(max);
export const email = z.string().trim().toLowerCase().email("Please enter a valid email address").max(160);
export const password = z.string().min(8, "Password must be at least 8 characters").max(128);

export const customizationSchema = z.object({
  placement: str(40).min(1),
  method: str(40).min(1),
  text: str(CUSTOM_TEXT_MAX).optional(),
  textColor: str(20).optional(),
  textFont: z.enum(["sans", "serif", "block", "script", "mono"]).optional(),
  textBold: z.boolean().optional(),
  artworkUrl: z.union([z.literal(""), z.string().trim().url("Artwork link must be a valid URL").max(500).refine((u) => /^https?:\/\//i.test(u), "Artwork link must start with http(s)://")]).optional(),
  backArtworkUrl: z.union([z.literal(""), z.string().trim().url("Artwork link must be a valid URL").max(500).refine((u) => /^https?:\/\//i.test(u), "Artwork link must start with http(s)://")]).optional(),
  backText: str(CUSTOM_TEXT_MAX).optional(),
  layout: str(300).optional(),
  notes: str(500).optional(),
});

export const cartLines = z
  .array(
    z.object({
      slug: str(160).min(1),
      quantity: z.coerce.number().int().min(1).max(WHOLESALE_MAX_QTY),
      variant: str(120).optional(),
      wholesale: z.boolean().optional(),
      custom: customizationSchema.optional(),
    }),
  )
  .min(1, "Your cart is empty")
  .max(50);

export const checkoutSchema = z.object({
  customer: z.object({ firstName: str(80).min(1), lastName: str(80).min(1), email, phone: str(40).optional().default("") }),
  shippingAddress: z.object({
    address: str(200).min(1), apartment: str(100).optional().default(""), city: str(100).min(1), state: str(100).min(1),
    zip: str(20).min(1), country: str(80).min(1),
  }),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
  couponCode: str(40).optional(),
  items: cartLines,
});

export const contactSchema = z.object({
  name: str(120).min(1, "Name is required"),
  email,
  phone: str(40).optional().default(""),
  subject: str(200).optional().default(""),
  message: str(5000).min(1, "Message is required"),
  website: z.string().max(0).optional(), // honeypot
});

export const bookingSchema = z.object({
  name: str(120).min(1, "Name is required"),
  email,
  phone: str(40).optional().default(""),
  preferredDate: str(20).optional().default(""),
  preferredTime: str(20).optional().default(""),
  topic: str(120).optional().default(""),
  message: str(5000).optional().default(""),
  website: z.string().max(0).optional(),
});

export const registerSchema = z.object({ name: str(120).min(1, "Name is required"), email, password, phone: str(40).optional() });
export const loginSchema = z.object({ email, password: z.string().min(1).max(128) });

export const addressSchema = z.object({
  label: str(40).optional().default("Home"),
  firstName: str(80).optional().default(""),
  lastName: str(80).optional().default(""),
  address: str(200).min(1, "Address is required"),
  apartment: str(100).optional().default(""),
  city: str(100).min(1, "City is required"),
  state: str(100).min(1, "State is required"),
  zip: str(20).min(1, "ZIP is required"),
  country: str(80).optional().default("United States"),
  phone: str(40).optional().default(""),
  isDefault: z.boolean().optional().default(false),
});
