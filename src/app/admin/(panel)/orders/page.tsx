import { Suspense } from "react";
import { OrdersManager } from "@/components/admin/OrdersManager";

export const metadata = { title: "Orders" };

export default function OrdersAdminPage() {
  return <Suspense><OrdersManager /></Suspense>;
}
