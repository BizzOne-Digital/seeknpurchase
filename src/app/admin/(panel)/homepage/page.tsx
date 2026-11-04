"use client";

import { SingletonEditor, type SSection } from "@/components/admin/SingletonEditor";

const sections: SSection[] = [
  {
    title: "Announcement bar",
    list: { path: "announcements", addLabel: "Add announcement", max: 6, item: [{ path: "en", label: "English", half: true }, { path: "es", label: "Spanish", half: true }] },
  },
  {
    title: "Hero",
    fields: [
      { path: "hero.titleLine1En", label: "Title line 1 (EN)", half: true }, { path: "hero.titleLine1Es", label: "Title line 1 (ES)", half: true },
      { path: "hero.titleLine2En", label: "Title line 2 (EN)", half: true }, { path: "hero.titleLine2Es", label: "Title line 2 (ES)", half: true },
      { path: "hero.titleLine3En", label: "Title line 3 — gold (EN)", half: true }, { path: "hero.titleLine3Es", label: "Title line 3 — gold (ES)", half: true },
      { path: "hero.subtitleEn", label: "Subtitle (EN)", type: "textarea", half: true }, { path: "hero.subtitleEs", label: "Subtitle (ES)", type: "textarea", half: true },
      { path: "hero.primaryLabelEn", label: "Primary button (EN)", half: true }, { path: "hero.primaryLabelEs", label: "Primary button (ES)", half: true },
      { path: "hero.primaryLink", label: "Primary button link", half: true }, { path: "hero.secondaryLink", label: "Secondary button link", half: true },
      { path: "hero.secondaryLabelEn", label: "Secondary button (EN)", half: true }, { path: "hero.secondaryLabelEs", label: "Secondary button (ES)", half: true },
      { path: "hero.image", label: "Hero image", type: "image", folder: "pages" },
    ],
  },
  {
    title: "Category cards",
    list: {
      path: "categoryCards", addLabel: "Add card", max: 8,
      item: [{ path: "titleEn", label: "Title (EN)", half: true }, { path: "titleEs", label: "Title (ES)", half: true }, { path: "link", label: "Link", help: "e.g. /shop?category=gifts" }, { path: "image", label: "Image", type: "image", folder: "pages" }],
    },
  },
  {
    title: "Featured products & blog selection",
    fields: [
      { path: "featuredProductSlugs", label: "Featured product slugs (comma separated)", help: "Leave empty to show products marked Featured." },
      { path: "blogSlugs", label: "Blog post slugs (comma separated)", help: "Leave empty to show the latest 3 posts." },
    ],
  },
  {
    title: "About section",
    fields: [
      { path: "about.labelEn", label: "Label (EN)", half: true }, { path: "about.labelEs", label: "Label (ES)", half: true },
      { path: "about.titleEn", label: "Heading (EN)", half: true }, { path: "about.titleEs", label: "Heading (ES)", half: true },
      { path: "about.bodyEn", label: "Body (EN)", type: "textarea", half: true }, { path: "about.bodyEs", label: "Body (ES)", type: "textarea", half: true },
      { path: "about.image", label: "Image", type: "image", folder: "pages" },
    ],
  },
  {
    title: "Promotional banner",
    fields: [
      { path: "promo.titleEn", label: "Heading (EN)", half: true }, { path: "promo.titleEs", label: "Heading (ES)", half: true },
      { path: "promo.textEn", label: "Text (EN)", type: "textarea", half: true }, { path: "promo.textEs", label: "Text (ES)", type: "textarea", half: true },
      { path: "promo.image", label: "Image", type: "image", folder: "pages" },
    ],
  },
];

const toList = (v: unknown) => (Array.isArray(v) ? v : String(v || "").split(",")).map((s) => String(s).trim()).filter(Boolean);

export default function HomepageAdmin() {
  return (
    <SingletonEditor
      title="Hero / Homepage"
      description="Everything on the homepage. Services and testimonials are managed in their own sections."
      endpoint="/api/admin/homepage"
      sections={sections}
      transform={(o) => ({ ...o, featuredProductSlugs: toList(o.featuredProductSlugs), blogSlugs: toList(o.blogSlugs) })}
    />
  );
}
