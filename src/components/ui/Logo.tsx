import Link from "next/link";
import { SmartImage } from "./SmartImage";
import { cn } from "@/lib/utils";

/** Logo-ready wordmark: renders the admin-uploaded logo when present, otherwise the serif wordmark. */
export function Logo({ name = "SeeknPurchase", logo, light, className }: { name?: string; logo?: string; light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label={`${name} home`} className={cn("inline-flex items-center", className)}>
      {logo ? (
        <SmartImage src={logo} alt={name} width={180} height={44} className="h-9 w-auto object-contain" priority />
      ) : (
        <span className={cn("font-serif text-2xl font-bold tracking-tight md:text-[1.7rem]", light ? "text-white" : "text-navy")}>{name}</span>
      )}
    </Link>
  );
}
