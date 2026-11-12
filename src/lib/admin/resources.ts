/**
 * Admin resource definitions — shared by the admin UI (forms/tables) and the generic
 * admin API (which uses them as a field whitelist + type coercion map).
 * Must stay free of server-only imports.
 */

export type UploadFolderName = "products" | "gallery" | "pages" | "misc";

export type FieldType =
  | "text" | "textarea" | "longtext" | "number" | "money" | "boolean" | "select" | "date"
  | "image" | "images" | "tags" | "variants" | "icon" | "slug" | "email";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  folder?: UploadFolderName;
  help?: string;
  half?: boolean;
  group?: string;
  readOnly?: boolean;
  slugFrom?: string;
  default?: unknown;
};

export type ColumnDef = { name: string; label: string; type?: "image" | "money" | "boolean" | "status" | "date" | "rating" | "text" };

export type ResourceDef = {
  key: string;
  title: string;
  singular: string;
  fields: FieldDef[];
  columns: ColumnDef[];
  search: string[];
  sort: Record<string, 1 | -1>;
  sortable?: boolean;
  canCreate?: boolean;
  canDuplicate?: boolean;
  quickToggle?: { field: string; on: unknown; off: unknown; label: string };
  publicPath?: (doc: Record<string, unknown>) => string | null;
};

const STATUS = [{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }];

export const RESOURCES: Record<string, ResourceDef> = {
  products: {
    key: "products",
    title: "Products",
    singular: "Product",
    search: ["name", "sku", "slug", "tags"],
    sort: { createdAt: -1 },
    canDuplicate: true,
    quickToggle: { field: "status", on: "published", off: "draft", label: "Published" },
    publicPath: (d) => `/products/${d.slug}`,
    columns: [
      { name: "thumbnail", label: "", type: "image" },
      { name: "name", label: "Name" },
      { name: "sku", label: "SKU" },
      { name: "price", label: "Price", type: "money" },
      { name: "stock", label: "Stock" },
      { name: "status", label: "Status", type: "status" },
    ],
    fields: [
      { name: "name", label: "Product name", type: "text", required: true, group: "Basics" },
      { name: "slug", label: "Slug", type: "slug", slugFrom: "name", half: true, group: "Basics", help: "URL: /products/<slug>" },
      { name: "sku", label: "SKU", type: "text", half: true, group: "Basics" },
      { name: "category", label: "Category", type: "select", half: true, group: "Basics", options: [] },
      { name: "subcategory", label: "Subcategory", type: "text", half: true, group: "Basics" },
      { name: "status", label: "Status", type: "select", options: STATUS, default: "published", half: true, group: "Basics" },
      { name: "shortDescription", label: "Short description", type: "textarea", group: "Basics" },
      { name: "description", label: "Full description", type: "longtext", group: "Basics" },
      { name: "price", label: "Price", type: "money", required: true, half: true, group: "Pricing & Inventory" },
      { name: "compareAtPrice", label: "Compare-at price (regular)", type: "money", half: true, group: "Pricing & Inventory", help: "Shown struck-through when higher than price" },
      { name: "cost", label: "Cost per item", type: "money", half: true, group: "Pricing & Inventory" },
      { name: "stock", label: "Stock", type: "number", half: true, default: 0, group: "Pricing & Inventory" },
      { name: "lowStockThreshold", label: "Low-stock threshold", type: "number", half: true, default: 5, group: "Pricing & Inventory" },
      { name: "wholesalePrice", label: "Wholesale price (per unit)", type: "money", half: true, group: "Wholesale & Customization", help: "Leave blank to hide this product from the Wholesale page" },
      { name: "wholesaleMinQty", label: "Wholesale minimum quantity", type: "number", half: true, default: 12, group: "Wholesale & Customization" },
      { name: "customizable", label: "Allow customization", type: "boolean", half: true, group: "Wholesale & Customization", help: "Shows print options on the product page and lists the product on the Custom page" },
      { name: "customType", label: "Customization type", type: "select", half: true, default: "apparel", group: "Wholesale & Customization", options: [{ value: "apparel", label: "Apparel (T-shirt, sweatshirt, hoodie)" }, { value: "tote", label: "Tote bag" }, { value: "cup", label: "Cup / mug" }, { value: "cap", label: "Cap" }] },
      { name: "featured", label: "Featured", type: "boolean", half: true, group: "Flags" },
      { name: "newArrival", label: "New arrival", type: "boolean", half: true, group: "Flags" },
      { name: "bestSeller", label: "Best seller", type: "boolean", half: true, group: "Flags" },
      { name: "onSale", label: "On sale", type: "boolean", half: true, group: "Flags" },
      { name: "thumbnail", label: "Thumbnail", type: "image", folder: "products", group: "Media" },
      { name: "images", label: "Gallery images", type: "images", folder: "products", group: "Media" },
      { name: "variants", label: "Variants", type: "variants", group: "Variants", help: "e.g. Size: S, M, L" },
      { name: "tags", label: "Tags", type: "tags", group: "Variants" },
      { name: "rating", label: "Rating (0–5)", type: "number", half: true, group: "Reviews" },
      { name: "reviewCount", label: "Review count", type: "number", half: true, group: "Reviews" },
      { name: "titleEn", label: "Title (English)", type: "text", half: true, group: "Translations" },
      { name: "titleEs", label: "Title (Spanish)", type: "text", half: true, group: "Translations" },
      { name: "descriptionEn", label: "Description (English)", type: "longtext", group: "Translations" },
      { name: "descriptionEs", label: "Description (Spanish)", type: "longtext", group: "Translations" },
      { name: "seoTitle", label: "SEO title", type: "text", group: "SEO" },
      { name: "seoDescription", label: "SEO description", type: "textarea", group: "SEO" },
    ],
  },
  categories: {
    key: "categories",
    title: "Categories",
    singular: "Category",
    search: ["name", "slug"],
    sort: { sortOrder: 1, name: 1 },
    sortable: true,
    quickToggle: { field: "active", on: true, off: false, label: "Active" },
    publicPath: (d) => `/shop?category=${d.slug}`,
    columns: [{ name: "image", label: "", type: "image" }, { name: "name", label: "Name" }, { name: "slug", label: "Slug" }, { name: "active", label: "Active", type: "boolean" }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true },
      { name: "nameEs", label: "Name (Spanish)", type: "text", half: true },
      { name: "slug", label: "Slug", type: "slug", slugFrom: "name", half: true },
      { name: "sortOrder", label: "Display order", type: "number", half: true, default: 0 },
      { name: "description", label: "Description", type: "textarea" },
      { name: "image", label: "Image", type: "image", folder: "gallery" },
      { name: "active", label: "Enabled", type: "boolean", default: true },
    ],
  },
  reviews: {
    key: "reviews",
    title: "Reviews",
    singular: "Review",
    search: ["name", "product", "comment"],
    sort: { createdAt: -1 },
    quickToggle: { field: "approved", on: true, off: false, label: "Approved" },
    columns: [{ name: "name", label: "Name" }, { name: "product", label: "Product" }, { name: "rating", label: "Rating", type: "rating" }, { name: "approved", label: "Approved", type: "boolean" }, { name: "createdAt", label: "Date", type: "date" }],
    fields: [
      { name: "product", label: "Product slug", type: "text", required: true, half: true },
      { name: "name", label: "Reviewer name", type: "text", required: true, half: true },
      { name: "email", label: "Email", type: "email", half: true },
      { name: "rating", label: "Rating (1–5)", type: "number", required: true, half: true, default: 5 },
      { name: "comment", label: "Comment", type: "textarea" },
      { name: "approved", label: "Approved (visible)", type: "boolean" },
    ],
  },
  testimonials: {
    key: "testimonials",
    title: "Testimonials",
    singular: "Testimonial",
    search: ["name", "review"],
    sort: { sortOrder: 1, createdAt: -1 },
    sortable: true,
    quickToggle: { field: "active", on: true, off: false, label: "Active" },
    columns: [{ name: "avatar", label: "", type: "image" }, { name: "name", label: "Customer" }, { name: "rating", label: "Rating", type: "rating" }, { name: "active", label: "Active", type: "boolean" }],
    fields: [
      { name: "name", label: "Customer name", type: "text", required: true, half: true },
      { name: "rating", label: "Rating (1–5)", type: "number", default: 5, half: true },
      { name: "review", label: "Review (English)", type: "textarea", required: true },
      { name: "reviewEs", label: "Review (Spanish)", type: "textarea" },
      { name: "avatar", label: "Avatar", type: "image", folder: "misc" },
      { name: "sortOrder", label: "Sort order", type: "number", half: true, default: 0 },
      { name: "active", label: "Active", type: "boolean", default: true, half: true },
    ],
  },
  blogs: {
    key: "blogs",
    title: "Blog Posts",
    singular: "Blog Post",
    search: ["title", "slug", "category"],
    sort: { publishedAt: -1 },
    quickToggle: { field: "status", on: "published", off: "draft", label: "Published" },
    publicPath: (d) => `/blog/${d.slug}`,
    columns: [{ name: "featuredImage", label: "", type: "image" }, { name: "title", label: "Title" }, { name: "category", label: "Category" }, { name: "publishedAt", label: "Published", type: "date" }, { name: "status", label: "Status", type: "status" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, group: "Content" },
      { name: "slug", label: "Slug", type: "slug", slugFrom: "title", half: true, group: "Content" },
      { name: "category", label: "Category", type: "text", half: true, group: "Content", help: "e.g. Style Tips, Lifestyle, Gift Guide" },
      { name: "author", label: "Author", type: "text", half: true, default: "SeeknPurchase Team", group: "Content" },
      { name: "publishedAt", label: "Publish date", type: "date", half: true, group: "Content" },
      { name: "status", label: "Status", type: "select", options: STATUS, default: "draft", half: true, group: "Content" },
      { name: "featuredImage", label: "Featured image", type: "image", folder: "pages", group: "Content" },
      { name: "excerpt", label: "Excerpt", type: "textarea", group: "Content" },
      { name: "content", label: "Content", type: "longtext", group: "Content", help: "Blank line = new paragraph. '## ' = heading. '- ' = bullet." },
      { name: "titleEs", label: "Title (Spanish)", type: "text", group: "Spanish" },
      { name: "excerptEs", label: "Excerpt (Spanish)", type: "textarea", group: "Spanish" },
      { name: "contentEs", label: "Content (Spanish)", type: "longtext", group: "Spanish" },
      { name: "seoTitle", label: "SEO title", type: "text", group: "SEO" },
      { name: "seoDescription", label: "SEO description", type: "textarea", group: "SEO" },
    ],
  },
  faqs: {
    key: "faqs",
    title: "FAQs",
    singular: "FAQ",
    search: ["questionEn", "answerEn"],
    sort: { sortOrder: 1, createdAt: 1 },
    sortable: true,
    quickToggle: { field: "active", on: true, off: false, label: "Active" },
    columns: [{ name: "questionEn", label: "Question" }, { name: "active", label: "Active", type: "boolean" }],
    fields: [
      { name: "questionEn", label: "Question (English)", type: "text", required: true },
      { name: "answerEn", label: "Answer (English)", type: "textarea", required: true },
      { name: "questionEs", label: "Question (Spanish)", type: "text" },
      { name: "answerEs", label: "Answer (Spanish)", type: "textarea" },
      { name: "sortOrder", label: "Sort order", type: "number", default: 0, half: true },
      { name: "active", label: "Active", type: "boolean", default: true, half: true },
    ],
  },
  team: {
    key: "team",
    title: "Team",
    singular: "Team Member",
    search: ["name", "role"],
    sort: { sortOrder: 1 },
    sortable: true,
    quickToggle: { field: "active", on: true, off: false, label: "Active" },
    columns: [{ name: "image", label: "", type: "image" }, { name: "name", label: "Name" }, { name: "role", label: "Role" }, { name: "active", label: "Active", type: "boolean" }],
    fields: [
      { name: "name", label: "Name", type: "text", required: true, half: true },
      { name: "role", label: "Role", type: "text", half: true },
      { name: "roleEs", label: "Role (Spanish)", type: "text", half: true },
      { name: "sortOrder", label: "Sort order", type: "number", default: 0, half: true },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "bioEs", label: "Bio (Spanish)", type: "textarea" },
      { name: "image", label: "Photo", type: "image", folder: "gallery" },
      { name: "active", label: "Active", type: "boolean", default: true },
    ],
  },
  services: {
    key: "services",
    title: "Services",
    singular: "Service",
    search: ["titleEn"],
    sort: { sortOrder: 1 },
    sortable: true,
    quickToggle: { field: "active", on: true, off: false, label: "Active" },
    columns: [{ name: "titleEn", label: "Title" }, { name: "icon", label: "Icon" }, { name: "showOnHome", label: "Homepage", type: "boolean" }, { name: "active", label: "Active", type: "boolean" }],
    fields: [
      { name: "titleEn", label: "Title (English)", type: "text", required: true, half: true },
      { name: "titleEs", label: "Title (Spanish)", type: "text", half: true },
      { name: "descriptionEn", label: "Description (English)", type: "textarea" },
      { name: "descriptionEs", label: "Description (Spanish)", type: "textarea" },
      { name: "icon", label: "Icon", type: "icon", half: true, default: "ShoppingBag" },
      { name: "sortOrder", label: "Sort order", type: "number", default: 0, half: true },
      { name: "image", label: "Image (optional)", type: "image", folder: "pages" },
      { name: "showOnHome", label: "Show on homepage", type: "boolean", half: true },
      { name: "active", label: "Active", type: "boolean", default: true, half: true },
    ],
  },
  pages: {
    key: "pages",
    title: "Pages",
    singular: "Page",
    search: ["slug", "titleEn"],
    sort: { slug: 1 },
    publicPath: (d) => `/${d.slug}`,
    columns: [{ name: "slug", label: "Slug" }, { name: "titleEn", label: "Title" }, { name: "updatedAt", label: "Updated", type: "date" }],
    fields: [
      {
        name: "slug", label: "Page", type: "select", required: true,
        options: [
          { value: "privacy-policy", label: "Privacy Policy" }, { value: "terms", label: "Terms of Service" },
          { value: "shipping-policy", label: "Shipping Policy" }, { value: "return-policy", label: "Return Policy" },
        ],
      },
      { name: "titleEn", label: "Title (English)", type: "text", half: true },
      { name: "titleEs", label: "Title (Spanish)", type: "text", half: true },
      { name: "contentEn", label: "Content (English)", type: "longtext", help: "Leave empty to use the default policy text." },
      { name: "contentEs", label: "Content (Spanish)", type: "longtext" },
      { name: "bannerImage", label: "Banner image", type: "image", folder: "pages" },
      { name: "seoTitle", label: "SEO title", type: "text" },
      { name: "seoDescription", label: "SEO description", type: "textarea" },
    ],
  },
  offers: {
    key: "offers",
    title: "Special Offers",
    singular: "Offer",
    search: ["title"],
    sort: { createdAt: -1 },
    quickToggle: { field: "active", on: true, off: false, label: "Active" },
    columns: [{ name: "image", label: "", type: "image" }, { name: "title", label: "Title" }, { name: "discountType", label: "Type" }, { name: "endDate", label: "Ends", type: "date" }, { name: "active", label: "Active", type: "boolean" }],
    fields: [
      { name: "title", label: "Title", type: "text", required: true, half: true },
      { name: "titleEs", label: "Title (Spanish)", type: "text", half: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "descriptionEs", label: "Description (Spanish)", type: "textarea" },
      {
        name: "discountType", label: "Discount type", type: "select", half: true, default: "percentage",
        options: [{ value: "percentage", label: "Percentage" }, { value: "fixed", label: "Fixed amount" }, { value: "bogo", label: "Buy one get one" }, { value: "free_shipping", label: "Free shipping" }],
      },
      { name: "discountValue", label: "Discount value", type: "number", half: true, default: 0 },
      { name: "startDate", label: "Start date", type: "date", half: true },
      { name: "endDate", label: "End date", type: "date", half: true },
      { name: "link", label: "Link", type: "text", default: "/shop?sale=1" },
      { name: "image", label: "Image", type: "image", folder: "pages" },
      { name: "active", label: "Active", type: "boolean", default: true },
    ],
  },
  coupons: {
    key: "coupons",
    title: "Coupons",
    singular: "Coupon",
    search: ["code"],
    sort: { createdAt: -1 },
    quickToggle: { field: "active", on: true, off: false, label: "Active" },
    columns: [{ name: "code", label: "Code" }, { name: "type", label: "Type" }, { name: "value", label: "Value" }, { name: "usedCount", label: "Used" }, { name: "expiryDate", label: "Expires", type: "date" }, { name: "active", label: "Active", type: "boolean" }],
    fields: [
      { name: "code", label: "Code", type: "text", required: true, half: true, help: "Customers enter this at cart" },
      { name: "type", label: "Type", type: "select", half: true, default: "percentage", options: [{ value: "percentage", label: "Percentage (%)" }, { value: "fixed", label: "Fixed amount ($)" }] },
      { name: "value", label: "Value", type: "number", required: true, half: true },
      { name: "minimumOrder", label: "Minimum order ($)", type: "money", half: true, default: 0 },
      { name: "maximumDiscount", label: "Maximum discount ($)", type: "money", half: true },
      { name: "usageLimit", label: "Usage limit", type: "number", half: true },
      { name: "startDate", label: "Start date", type: "date", half: true },
      { name: "expiryDate", label: "Expiry date", type: "date", half: true },
      { name: "usedCount", label: "Times used", type: "number", readOnly: true, half: true },
      { name: "active", label: "Active", type: "boolean", default: true, half: true },
    ],
  },
  bookings: {
    key: "bookings",
    title: "Booking Requests",
    singular: "Booking Request",
    search: ["name", "email", "topic"],
    sort: { createdAt: -1 },
    canCreate: false,
    columns: [{ name: "name", label: "Name" }, { name: "email", label: "Email" }, { name: "topic", label: "Topic" }, { name: "preferredDate", label: "Date" }, { name: "status", label: "Status", type: "status" }, { name: "createdAt", label: "Received", type: "date" }],
    fields: [
      { name: "name", label: "Name", type: "text", readOnly: true, half: true },
      { name: "email", label: "Email", type: "email", readOnly: true, half: true },
      { name: "phone", label: "Phone", type: "text", readOnly: true, half: true },
      { name: "topic", label: "Topic", type: "text", readOnly: true, half: true },
      { name: "preferredDate", label: "Preferred date", type: "text", readOnly: true, half: true },
      { name: "preferredTime", label: "Preferred time", type: "text", readOnly: true, half: true },
      { name: "message", label: "Message", type: "textarea", readOnly: true },
      { name: "attachmentUrl", label: "Attached image / art", type: "image", readOnly: true, help: "Open the image to download the customer's artwork" },
      { name: "status", label: "Status", type: "select", options: ["new", "confirmed", "completed", "cancelled"].map((v) => ({ value: v, label: v })) },
    ],
  },
  contacts: {
    key: "contacts",
    title: "Contact Enquiries",
    singular: "Enquiry",
    search: ["name", "email", "subject", "message"],
    sort: { createdAt: -1 },
    canCreate: false,
    columns: [{ name: "name", label: "Name" }, { name: "email", label: "Email" }, { name: "subject", label: "Subject" }, { name: "status", label: "Status", type: "status" }, { name: "createdAt", label: "Received", type: "date" }],
    fields: [
      { name: "name", label: "Name", type: "text", readOnly: true, half: true },
      { name: "email", label: "Email", type: "email", readOnly: true, half: true },
      { name: "phone", label: "Phone", type: "text", readOnly: true, half: true },
      { name: "subject", label: "Subject", type: "text", readOnly: true, half: true },
      { name: "message", label: "Message", type: "textarea", readOnly: true },
      { name: "status", label: "Status", type: "select", options: ["new", "read", "replied", "archived"].map((v) => ({ value: v, label: v })) },
    ],
  },
  newsletter: {
    key: "newsletter",
    title: "Newsletter Subscribers",
    singular: "Subscriber",
    search: ["email"],
    sort: { createdAt: -1 },
    quickToggle: { field: "active", on: true, off: false, label: "Active" },
    columns: [{ name: "email", label: "Email" }, { name: "source", label: "Source" }, { name: "active", label: "Active", type: "boolean" }, { name: "createdAt", label: "Subscribed", type: "date" }],
    fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "source", label: "Source", type: "text", default: "admin" },
      { name: "active", label: "Subscribed", type: "boolean", default: true },
    ],
  },
};
