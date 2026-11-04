import { ProductDetail, productMetadata } from "@/components/product/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

// Same product page as /products/[slug]; canonical URL points at /products/[slug].
export async function generateMetadata({ params }: Props) {
  return productMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <ProductDetail slug={(await params).slug} />;
}
