import type { Metadata } from "next";
import { ShopPage, type ShopSearchParams } from "@/components/shop/ShopPage";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse every product at SeeknPurchase — accessories, essentials, unique finds and gifts.",
  alternates: { canonical: "/shop" },
};

export default async function Page({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  return <ShopPage searchParams={await searchParams} />;
}
