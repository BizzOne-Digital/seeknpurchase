import type { ServiceDTO } from "@/lib/types";
import type { Locale } from "@/lib/i18n/dictionaries";
import { Icon } from "@/components/ui/Icon";
import { loc } from "@/lib/i18n/localize";

export function ServicesGrid({ services, locale, columns = 4 }: { services: ServiceDTO[]; locale: Locale; columns?: 3 | 4 }) {
  return (
    <ul className={`grid gap-6 sm:grid-cols-2 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
      {services.map((s) => (
        <li key={s.titleEn} className="group flex gap-4 rounded-xl p-2 transition hover:bg-cream">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center text-gold transition group-hover:-translate-y-0.5">
            <Icon name={s.icon} className="h-8 w-8" />
          </span>
          <div>
            <h3 className="font-sans text-[15px] font-semibold">{loc(s, "title", locale)}</h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-500">{loc(s, "description", locale)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
