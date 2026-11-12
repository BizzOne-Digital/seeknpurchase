export type ProductDTO = {
  _id?: string;
  name: string;
  slug: string;
  sku?: string;
  category?: string;
  subcategory?: string;
  shortDescription?: string;
  description?: string;
  price: number;
  compareAtPrice?: number;
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  priceTiers?: string;
  cost?: number;
  customizable?: boolean;
  customType?: import("./customization").CustomType;
  stock: number;
  lowStockThreshold?: number;
  featured?: boolean;
  newArrival?: boolean;
  bestSeller?: boolean;
  onSale?: boolean;
  status?: "published" | "draft";
  images: string[];
  thumbnail?: string;
  variants?: { name: string; options: string[] }[];
  tags?: string[];
  rating: number;
  reviewCount: number;
  soldCount?: number;
  seoTitle?: string;
  seoDescription?: string;
  titleEn?: string;
  titleEs?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  createdAt?: string;
};

/** Small, serializable product shape passed to client components. */
export type ProductCardData = {
  slug: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  images: string[];
  rating: number;
  reviewCount: number;
  stock: number;
  lowStockThreshold: number;
  isNew: boolean;
  shortDescription?: string;
  variants?: { name: string; options: string[] }[];
  wholesalePrice?: number;
  wholesaleMinQty?: number;
  tiers?: import("./tiers").Tier[];
  customizable?: boolean;
  customType?: import("./customization").CustomType;
  category?: string;
  sku?: string;
};

export type CategoryDTO = { _id?: string; name: string; nameEs?: string; slug: string; description?: string; image?: string; active?: boolean; sortOrder?: number };
export type TestimonialDTO = { _id?: string; name: string; review: string; reviewEs?: string; rating: number; avatar?: string };
export type FaqDTO = { _id?: string; questionEn: string; answerEn: string; questionEs?: string; answerEs?: string };
export type BlogDTO = {
  _id?: string; title: string; titleEs?: string; slug: string; excerpt?: string; excerptEs?: string; content?: string; contentEs?: string;
  featuredImage?: string; category?: string; author?: string; publishedAt: string; seoTitle?: string; seoDescription?: string;
};
export type ServiceDTO = { _id?: string; titleEn: string; titleEs?: string; descriptionEn?: string; descriptionEs?: string; icon?: string; image?: string; showOnHome?: boolean };
export type TeamDTO = { _id?: string; name: string; role?: string; roleEs?: string; bio?: string; bioEs?: string; image?: string };
export type OfferDTO = { _id?: string; title: string; titleEs?: string; description?: string; descriptionEs?: string; discountType: string; discountValue: number; image?: string; link?: string; endDate?: string };

export type SettingsDTO = {
  businessName: string; tagline: string; logo?: string; favicon?: string; email: string; phone: string; address?: string;
  social: { instagram?: string; facebook?: string; tiktok?: string; pinterest?: string; youtube?: string };
  seo: { defaultTitle?: string; defaultDescription?: string; ogImage?: string };
  store: { currency: string; standardShipping: number; expressShipping: number; freeShippingThreshold: number; taxRate: number };
};

export type HomepageDTO = {
  announcements: { en: string; es?: string }[];
  hero: {
    titleLine1En: string; titleLine2En: string; titleLine3En: string;
    titleLine1Es?: string; titleLine2Es?: string; titleLine3Es?: string;
    subtitleEn: string; subtitleEs?: string; image: string;
    primaryLabelEn: string; primaryLabelEs?: string; primaryLink: string;
    secondaryLabelEn: string; secondaryLabelEs?: string; secondaryLink: string;
  };
  categoryCards: { titleEn: string; titleEs?: string; image: string; link: string }[];
  featuredProductSlugs: string[];
  about: { labelEn?: string; labelEs?: string; titleEn: string; titleEs?: string; bodyEn: string; bodyEs?: string; image: string };
  blogSlugs: string[];
  promo: { titleEn?: string; titleEs?: string; textEn?: string; textEs?: string; image?: string };
};

export type CartItem = {
  slug: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  /** Display text: selected variant plus wholesale/customization summary. Also part of the line identity. */
  variant?: string;
  stock: number;
  /** Variant selection only (sent to the server, which rebuilds the full summary). */
  baseVariant?: string;
  wholesale?: boolean;
  minQty?: number;
  custom?: import("./customization").Customization;
  /** Retail quantity tiers: price is recalculated from basePrice + extra (customization charge) by total quantity. */
  tiers?: import("./tiers").Tier[];
  basePrice?: number;
  extra?: number;
};
