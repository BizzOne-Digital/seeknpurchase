import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Return Policy", alternates: { canonical: "/return-policy" } };

export default function Page() {
  return <LegalPage slug="return-policy" />;
}
