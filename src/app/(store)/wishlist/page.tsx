import type { Metadata } from "next";
import { getDictionary } from "@/lib/i18n/server";
import { WishlistGrid } from "@/components/account/WishlistGrid";

export const metadata: Metadata = { title: "Wishlist", robots: { index: false } };

export default async function WishlistPage() {
  const { t } = await getDictionary();
  return (
    <div className="container py-10 md:py-14">
      <h1 className="mb-8 text-3xl md:text-4xl">{t.account.wishlist}</h1>
      <WishlistGrid />
    </div>
  );
}
