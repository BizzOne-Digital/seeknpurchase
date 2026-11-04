# SeeknPurchase — eCommerce Platform

Next.js 15 (App Router) · TypeScript · Tailwind CSS · MongoDB Atlas / Mongoose · Stripe-ready · EN/ES.
Client: US SALES LLC.

## Quick start

```bash
npm install
cp .env.example .env.local     # fill in MONGODB_URI, AUTH_SECRET (32+ chars), ADMIN_EMAIL, ADMIN_PASSWORD (12+ chars)
npm run seed                   # starter catalog/content + first admin account (safe to re-run)
npm run dev                    # http://localhost:3000  ·  admin: /admin/login
```

If `MONGODB_URI` is not set, the storefront still renders with built-in demo content so the design can be previewed. Checkout, accounts and admin require the database.

## Environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `AUTH_SECRET` | Signs admin/customer session cookies (min 32 chars) |
| `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` | Stripe. Leave blank to run in **manual payment** mode, where orders are saved as pending and staff mark them paid. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, Stripe redirects |
| `NOTIFY_WEBHOOK_URL` | Optional. Contact/booking notifications are POSTed here (Zapier/Make/GHL/email relay). |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Used only by `npm run seed` |

## Stripe setup
1. Add the keys to your Vercel project's environment variables.
2. Create a webhook pointing to `https://<domain>/api/stripe/webhook` with the events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `checkout.session.expired` and `charge.refunded`.
3. An order is marked **paid** only after Stripe confirms it, either through a signature-verified webhook or a server-side session check. Inventory and coupon usage are adjusted once, at that point.

## Image uploads (Vercel-safe)
- Uploaded files are never written to disk. `POST /api/upload` (admin only) validates the folder (`products|gallery|pages|misc`), MIME type, magic bytes and the 8MB limit, then stores the binary in the `StoredUpload` collection. The collection has a unique `{folder, filename}` index.
- Images are served by `GET /api/uploads/[folder]/[filename]` with immutable caching. A missing file falls back to a placeholder.
- Content documents store only the URL. Images that are replaced or removed are deleted on save. Deleting a document deletes its images. Uploads abandoned in an unsaved form are deleted when the form is cancelled.
- Legacy `/uploads/...` paths are rendered as a placeholder (see `normalizeImageUrl`).
- Admin → Media lists, filters, copies and deletes stored images.

## Structure
```
src/app/(store)/      storefront + customer portal (/account/*)
src/app/admin/        admin login + (panel)/* protected pages
src/app/api/          public, account, admin, upload and Stripe routes
src/lib/admin/        resource config (fields/columns) + server registry
src/lib/i18n/         EN/ES dictionaries; DB fields use *En / *Es
src/models/           all Mongoose models
scripts/seed.ts       seed data + first admin
```
Adding a manageable content type means adding one entry in `src/lib/admin/resources.ts`, a model in `registry.ts`, and a one-line admin page.

## Security notes
- Admin pages and APIs are checked server-side in the layout and in each handler. Middleware is only the first gate.
- Passwords are hashed with bcrypt. Sessions are HTTP-only signed JWT cookies (admin: 12h, customer: 7d).
- Inputs are validated with zod or the resource whitelist. Login attempts are rate-limited (per instance; use Vercel Firewall for global limits).
- Product images: replace the Unsplash demo URLs with real product photos from Admin → Products.
