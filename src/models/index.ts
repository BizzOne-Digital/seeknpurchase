import mongoose, { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

const opts = { timestamps: true } as const;

function m<T extends Schema>(name: string, schema: T) {
  return (models[name] as Model<InferSchemaType<T>>) || model(name, schema);
}

/* ---------------- Users ---------------- */
const AdminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["owner", "admin", "editor"], default: "admin" },
    lastLoginAt: Date,
  },
  opts,
);
export const Admin = m("Admin", AdminSchema);

const AddressSchema = new Schema({
  label: { type: String, default: "Home" },
  firstName: String,
  lastName: String,
  address: { type: String, required: true },
  apartment: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  country: { type: String, default: "United States" },
  phone: String,
  isDefault: { type: Boolean, default: false },
});

const CustomerSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true, select: false },
    addresses: [AddressSchema],
    wishlist: [{ type: String }], // product slugs
    lastLoginAt: Date,
  },
  opts,
);
export const Customer = m("Customer", CustomerSchema);

/* ---------------- Catalog ---------------- */
const VariantSchema = new Schema({ name: String, options: [String] }, { _id: false });

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, trim: true },
    category: { type: String, index: true }, // category slug
    subcategory: String,
    shortDescription: String,
    description: String,
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    wholesalePrice: { type: Number, min: 0 }, // blank/0 = not offered on the wholesale page
    wholesaleMinQty: { type: Number, min: 1, default: 12 },
    customizable: { type: Boolean, default: false }, // shows the product customizer
    customType: { type: String, enum: ["apparel", "tote", "cup", "cap"], default: "apparel" },
    cost: { type: Number, min: 0 },
    priceTiers: { type: String, default: "" }, // quantity discounts, e.g. "10=12.99, 25=11.49"
    stock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    featured: { type: Boolean, default: false, index: true },
    newArrival: { type: Boolean, default: false },
    bestSeller: { type: Boolean, default: false },
    onSale: { type: Boolean, default: false },
    status: { type: String, enum: ["published", "draft"], default: "published", index: true },
    images: [String],
    thumbnail: String,
    variants: [VariantSchema],
    tags: [String],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    seoTitle: String,
    seoDescription: String,
    titleEn: String,
    titleEs: String,
    descriptionEn: String,
    descriptionEs: String,
  },
  opts,
);
ProductSchema.index({ name: "text", tags: "text", shortDescription: "text" });
ProductSchema.index({ status: 1, createdAt: -1 });
export const Product = m("Product", ProductSchema);

const CategorySchema = new Schema(
  {
    name: { type: String, required: true },
    nameEs: String,
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    image: String,
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  opts,
);
export const Category = m("Category", CategorySchema);

const ReviewSchema = new Schema(
  {
    product: { type: String, index: true }, // product slug
    name: { type: String, required: true },
    email: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    approved: { type: Boolean, default: false },
  },
  opts,
);
export const Review = m("Review", ReviewSchema);

/* ---------------- Orders ---------------- */
export const ORDER_STATUSES = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"] as const;
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"] as const;
export const FULFILLMENT_STATUSES = ["unfulfilled", "partially_fulfilled", "fulfilled"] as const;

const OrderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: "Customer", index: true },
    customerInfo: { firstName: String, lastName: String, email: { type: String, index: true }, phone: String },
    shippingAddress: { address: String, apartment: String, city: String, state: String, zip: String, country: String },
    items: [
      {
        _id: false,
        slug: String,
        name: String,
        image: String,
        variant: String,
        price: Number,
        quantity: Number,
        wholesale: Boolean,
        customization: {
          placement: String, method: String, text: String, textColor: String, textFont: String, textBold: Boolean, artworkUrl: String, backText: String, backArtworkUrl: String, layout: String, notes: String, unitCharge: Number,
        },
      },
    ],
    subtotal: Number,
    shipping: Number,
    shippingMethod: String,
    discount: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: Number,
    couponCode: String,
    currency: { type: String, default: "USD" },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "pending", index: true },
    status: { type: String, enum: ORDER_STATUSES, default: "Pending", index: true },
    fulfillmentStatus: { type: String, enum: FULFILLMENT_STATUSES, default: "unfulfilled" },
    paymentProvider: { type: String, default: "stripe" },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: String,
    paidAt: Date,
    accessToken: { type: String, select: false }, // allows guest to view their success page
    notes: String,
  },
  opts,
);
export const Order = m("Order", OrderSchema);

/* ---------------- Content ---------------- */
const TestimonialSchema = new Schema(
  {
    name: { type: String, required: true },
    review: { type: String, required: true },
    reviewEs: String,
    rating: { type: Number, default: 5, min: 1, max: 5 },
    avatar: String,
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  opts,
);
export const Testimonial = m("Testimonial", TestimonialSchema);

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true },
    titleEs: String,
    slug: { type: String, required: true, unique: true, lowercase: true },
    excerpt: String,
    excerptEs: String,
    content: String,
    contentEs: String,
    featuredImage: String,
    category: String,
    author: { type: String, default: "SeeknPurchase Team" },
    publishedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["published", "draft"], default: "draft", index: true },
    seoTitle: String,
    seoDescription: String,
  },
  opts,
);
export const BlogPost = m("BlogPost", BlogPostSchema);

const FAQSchema = new Schema(
  {
    questionEn: { type: String, required: true },
    answerEn: { type: String, required: true },
    questionEs: String,
    answerEs: String,
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  opts,
);
export const FAQ = m("FAQ", FAQSchema);

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    role: String,
    roleEs: String,
    bio: String,
    bioEs: String,
    image: String,
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  opts,
);
export const TeamMember = m("TeamMember", TeamMemberSchema);

const ServiceSchema = new Schema(
  {
    titleEn: { type: String, required: true },
    titleEs: String,
    descriptionEn: String,
    descriptionEs: String,
    icon: { type: String, default: "ShoppingBag" },
    image: String,
    showOnHome: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  opts,
);
export const Service = m("Service", ServiceSchema);

const PageSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true },
    titleEn: String,
    titleEs: String,
    contentEn: String,
    contentEs: String,
    bannerImage: String,
    seoTitle: String,
    seoDescription: String,
  },
  opts,
);
export const Page = m("Page", PageSchema);

/* ---------------- Submissions ---------------- */
const ContactSubmissionSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    subject: String,
    message: { type: String, required: true },
    attachmentUrl: String, // customer artwork uploaded with the request
    status: { type: String, enum: ["new", "read", "replied", "archived"], default: "new" },
  },
  opts,
);
export const ContactSubmission = m("ContactSubmission", ContactSubmissionSchema);

const BookingRequestSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    preferredDate: String,
    preferredTime: String,
    topic: String,
    message: String,
    status: { type: String, enum: ["new", "confirmed", "completed", "cancelled"], default: "new" },
  },
  opts,
);
export const BookingRequest = m("BookingRequest", BookingRequestSchema);

const NewsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: String,
    active: { type: Boolean, default: true },
  },
  opts,
);
export const NewsletterSubscriber = m("NewsletterSubscriber", NewsletterSubscriberSchema);

/* ---------------- Promotions ---------------- */
const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    value: { type: Number, required: true, min: 0 },
    minimumOrder: { type: Number, default: 0 },
    maximumDiscount: Number,
    startDate: Date,
    expiryDate: Date,
    usageLimit: Number,
    usedCount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  opts,
);
export const Coupon = m("Coupon", CouponSchema);

const SpecialOfferSchema = new Schema(
  {
    title: { type: String, required: true },
    titleEs: String,
    description: String,
    descriptionEs: String,
    discountType: { type: String, enum: ["percentage", "fixed", "bogo", "free_shipping"], default: "percentage" },
    discountValue: { type: Number, default: 0 },
    startDate: Date,
    endDate: Date,
    active: { type: Boolean, default: true },
    image: String,
    link: { type: String, default: "/shop?sale=1" },
  },
  opts,
);
export const SpecialOffer = m("SpecialOffer", SpecialOfferSchema);

/* ---------------- Singletons ---------------- */
const SiteSettingsSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    businessName: { type: String, default: "SeeknPurchase" },
    tagline: { type: String, default: "Seek. Shop. Save." },
    logo: String,
    favicon: String,
    email: { type: String, default: "info@seeknpurchase.com" },
    phone: { type: String, default: "213-259-3140" },
    address: String,
    social: { instagram: String, facebook: String, tiktok: String, pinterest: String, youtube: String },
    seo: { defaultTitle: String, defaultDescription: String, ogImage: String },
    store: {
      currency: { type: String, default: "USD" },
      standardShipping: { type: Number, default: 6.99 },
      expressShipping: { type: Number, default: 14.99 },
      freeShippingThreshold: { type: Number, default: 75 },
      taxRate: { type: Number, default: 0 }, // percent
    },
  },
  opts,
);
export const SiteSettings = m("SiteSettings", SiteSettingsSchema);

const HomepageContentSchema = new Schema(
  {
    key: { type: String, default: "main", unique: true },
    announcements: [{ _id: false, en: String, es: String }],
    hero: {
      titleLine1En: String, titleLine2En: String, titleLine3En: String,
      titleLine1Es: String, titleLine2Es: String, titleLine3Es: String,
      subtitleEn: String, subtitleEs: String,
      image: String,
      primaryLabelEn: String, primaryLabelEs: String, primaryLink: String,
      secondaryLabelEn: String, secondaryLabelEs: String, secondaryLink: String,
    },
    categoryCards: [{ _id: false, titleEn: String, titleEs: String, image: String, link: String }],
    featuredProductSlugs: [String],
    about: { labelEn: String, labelEs: String, titleEn: String, titleEs: String, bodyEn: String, bodyEs: String, image: String },
    blogSlugs: [String],
    promo: { titleEn: String, titleEs: String, textEn: String, textEs: String, image: String },
  },
  opts,
);
export const HomepageContent = m("HomepageContent", HomepageContentSchema);

/* ---------------- Uploads (binary lives ONLY here) ---------------- */
const StoredUploadSchema = new Schema(
  {
    folder: { type: String, required: true, enum: ["products", "gallery", "pages", "misc", "designs"] },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  opts,
);
StoredUploadSchema.index({ folder: 1, filename: 1 }, { unique: true });
export const StoredUpload = m("StoredUpload", StoredUploadSchema);

export { mongoose };
