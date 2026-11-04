import type { Metadata } from "next";
import { ShopPage, type ShopSearchParams } from "@/components/shop/ShopPage";

export const metadata: Metadata = {
  title: "Shop",
  description: "Shop curated fashion accessories, everyday essentials, unique finds and gifts at SeeknPurchase.",
  alternates: { canonical: "/shop" },
};

export default async function Page({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  return <ShopPage searchParams={await searchParams} />;
}
