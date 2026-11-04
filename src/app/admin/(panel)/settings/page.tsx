"use client";

import { SingletonEditor, type SSection } from "@/components/admin/SingletonEditor";

const sections: SSection[] = [
  {
    title: "General",
    fields: [
      { path: "businessName", label: "Business name", half: true },
      { path: "tagline", label: "Tagline", half: true },
      { path: "email", label: "Contact email", half: true },
      { path: "phone", label: "Phone", half: true },
      { path: "address", label: "Physical address (optional)", type: "textarea", help: "Leave empty to hide the address on the site." },
      { path: "logo", label: "Logo", type: "image", folder: "misc", half: true },
      { path: "favicon", label: "Favicon", type: "image", folder: "misc", half: true },
    ],
  },
  {
    title: "Social media",
    fields: ["instagram", "facebook", "tiktok", "pinterest", "youtube"].map((k) => ({ path: `social.${k}`, label: k[0].toUpperCase() + k.slice(1), half: true, help: "Full https:// URL" })),
  },
  {
    title: "SEO",
    fields: [
      { path: "seo.defaultTitle", label: "Default title" },
      { path: "seo.defaultDescription", label: "Default description", type: "textarea" },
      { path: "seo.ogImage", label: "Open Graph image", type: "image", folder: "misc" },
    ],
  },
  {
    title: "Store",
    fields: [
      { path: "store.currency", label: "Currency (ISO code)", half: true, help: "e.g. USD" },
      { path: "store.taxRate", label: "Tax rate (%)", type: "number", half: true, help: "0 disables tax" },
      { path: "store.standardShipping", label: "Standard shipping ($)", type: "number", half: true },
      { path: "store.expressShipping", label: "Express shipping ($)", type: "number", half: true },
      { path: "store.freeShippingThreshold", label: "Free shipping threshold ($)", type: "number", half: true, help: "0 disables free shipping" },
    ],
  },
];

export default function SettingsPage() {
  return <SingletonEditor title="Settings" description="Business details, social links, SEO defaults and store configuration." endpoint="/api/admin/settings" sections={sections} />;
}
