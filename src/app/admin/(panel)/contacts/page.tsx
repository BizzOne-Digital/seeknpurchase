import { ResourceManager } from "@/components/admin/ResourceManager";

export const metadata = { title: "Admin" };

export default function Page() {
  return <ResourceManager resource="contacts" />;
}
