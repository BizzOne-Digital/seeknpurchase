import { ResourceManager } from "@/components/admin/ResourceManager";
import { ProductCsvImport } from "@/components/admin/ProductCsvImport";
import { connectDB } from "@/lib/db";
import { Category } from "@/models";

export const metadata = { title: "Products" };

export default async function ProductsAdminPage() {
  await connectDB();
  const cats = await Category.find().sort({ sortOrder: 1, name: 1 }).select("name slug").lean();
  return (
    <ResourceManager
      resource="products"
      description="Create, edit, duplicate and publish products. Click a status badge to publish/unpublish."
      extraActions={<ProductCsvImport />}
      dynamicOptions={{ category: cats.map((c) => ({ value: c.slug, label: c.name })) }}
    />
  );
}
