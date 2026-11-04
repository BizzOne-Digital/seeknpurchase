# TASK: Replace every external/stock image with AI-generated images saved in /public, and wire them into the code.

PROJECT: Next.js 15 + TypeScript + Tailwind eCommerce store "SeeknPurchase" (client: US SALES LLC). Brand look: premium but approachable retail, warm cream (#F8F5EF) backgrounds, navy (#172333) and gold (#B38A46) accents, soft natural light, clean minimal styling.

## STEP 1 — AUDIT (show me the list before generating)
- Find every image URL in the codebase: search for "images.unsplash.com", the `u(` helper and `IMG` object in src/lib/demo-data.ts, and any other http(s) image URLs in src/ (components, pages, metadata/OG images).
- Produce a table: key/location | what it shows | where it is used | target size/aspect ratio.

## STEP 2 — GENERATE
- Generate one image per entry with your image generation tool. If no image tool is available, write a Node script (scripts/generate-images.mjs) that calls the OpenAI Images API (model gpt-image-1) using OPENAI_API_KEY from .env.local, and run it.
- Sizes: hero/banners 1792x1024 (landscape), product images 1024x1024 (square, product centered on light cream background, studio lighting, no text), category cards 1024x1024, blog featured images 1792x1024, OG image 1200x630.
- Products must match their names/descriptions exactly (e.g. "Classic Leather Tote" in cognac leather, "Classic Cotton T-Shirt" plain white crew-neck tee flat-lay). Keep one consistent style across all products.
- NO text, logos, watermarks or brand names inside images. No real people's likeness.
- Testimonial avatars: do NOT generate fake customer faces. Remove avatar images and show the customer's initials in a styled circle instead (update the Testimonials component).

## STEP 3 — SAVE
- Save as optimized .webp (quality ~80, each file under 300KB) in:
  public/images/hero/, public/images/products/, public/images/categories/, public/images/blog/, public/images/site/
- Use kebab-case names matching the slug, e.g. public/images/products/classic-leather-tote-1.webp

## STEP 4 — WIRE UP
- Replace every Unsplash/external URL in src/lib/demo-data.ts (IMG, products, categories, homepage, blog, offers, settings ogImage) and anywhere else with local paths like "/images/products/classic-leather-tote-1.webp".
- Remove the `u()` helper if no longer used.
- Check src/lib/utils.ts normalizeImageUrl and the SmartImage component so local /images/... paths render correctly (must NOT become placeholders). In next.config.ts remove images.unsplash.com from remotePatterns only if nothing uses it anymore.
- Do not change any other functionality, styling, or pricing logic.

## STEP 5 — VERIFY
- Run `npx tsc --noEmit` and `npx next build`; both must pass.
- Confirm zero remaining "unsplash" references in src/.
- Final summary: number of images created, folders, files changed, and anything I must do manually.

NOTE: The live MongoDB still holds old Unsplash URLs for products/categories/blog. Do NOT run the seed script or touch the database. Just list which records need updating.
