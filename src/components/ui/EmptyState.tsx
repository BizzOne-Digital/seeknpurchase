import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon, title, text, actionHref, actionLabel,
}: { icon: LucideIcon; title: string; text?: string; actionHref?: string; actionLabel?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-cream/50 px-6 py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-gold shadow-soft">
        <Icon className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <h3 className="text-xl">{title}</h3>
      {text && <p className="mt-2 max-w-sm text-sm text-slate-500">{text}</p>}
      {actionHref && actionLabel && (
        <Link href={actionHref} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
