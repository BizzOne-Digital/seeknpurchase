import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  fulfilled: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  shipped: "bg-sky-50 text-sky-700 ring-sky-200",
  processing: "bg-sky-50 text-sky-700 ring-sky-200",
  partially_fulfilled: "bg-sky-50 text-sky-700 ring-sky-200",
  replied: "bg-sky-50 text-sky-700 ring-sky-200",
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  new: "bg-amber-50 text-amber-700 ring-amber-200",
  unfulfilled: "bg-amber-50 text-amber-700 ring-amber-200",
  draft: "bg-slate-100 text-slate-600 ring-slate-200",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
  read: "bg-slate-100 text-slate-600 ring-slate-200",
  failed: "bg-red-50 text-red-700 ring-red-200",
  cancelled: "bg-red-50 text-red-700 ring-red-200",
  refunded: "bg-violet-50 text-violet-700 ring-violet-200",
};

export function StatusBadge({ value }: { value?: string }) {
  const v = (value || "").toLowerCase();
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1", tone[v] || "bg-slate-100 text-slate-600 ring-slate-200")}>
      {(value || "—").replace(/_/g, " ")}
    </span>
  );
}
