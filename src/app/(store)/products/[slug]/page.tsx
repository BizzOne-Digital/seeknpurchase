import { ProductDetail, productMetadata } from "@/components/product/ProductDetail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  return productMetadata((await params).slug);
}

export default async function Page({ params }: Props) {
  return <ProductDetail slug={(await params).slug} />;
}
