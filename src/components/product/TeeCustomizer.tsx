"use client";

import { Paintbrush } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStore } from "@/components/providers/StoreProvider";
import { CUSTOM_TEXT_MAX, METHODS, PLACEMENTS, TEXT_COLORS, customizationPrice, type Customization } from "@/lib/customization";
import { cn } from "@/lib/utils";

export const EMPTY_CUSTOM: Customization = { placement: "front", method: "screen-print", text: "", textColor: "black", artworkUrl: "", notes: "" };

/** Removes empty optional fields so the cart line and order stay clean. */
export function cleanCustomization(c: Customization): Customization {
  return {
    placement: c.placement,
    method: c.method,
    ...(c.text?.trim() ? { text: c.text.trim(), textColor: c.textColor || "black" } : {}),
    ...(c.artworkUrl?.trim() ? { artworkUrl: c.artworkUrl.trim() } : {}),
    ...(c.notes?.trim() ? { notes: c.notes.trim() } : {}),
  };
}

/** Returns an error message, or "" when the customization is valid. */
export function validateCustomization(c: Customization, es: boolean): string {
  const url = c.artworkUrl?.trim();
  if (url && !/^https?:\/\/\S+\.\S+/i.test(url)) return es ? "El enlace del diseño debe comenzar con https://" : "Artwork link must start with https://";
  return "";
}

function TeePreview({ c }: { c: Customization }) {
  const color = TEXT_COLORS.find((x) => x.value === c.textColor)?.hex ?? "#111";
  const showFront = c.placement === "front" || c.placement === "front-back" || c.placement === "left-chest";
  const showBack = c.placement === "back" || c.placement === "front-back";
  const label = c.text?.trim() || "YOUR DESIGN";
  const shirt = (side: "front" | "back", active: boolean, chest: boolean) => (
    <figure className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 120 120" className="h-28 w-28 sm:h-32 sm:w-32" aria-hidden>
        <path
          d="M40 10 L22 18 L6 40 L22 50 L28 44 L28 110 L92 110 L92 44 L98 50 L114 40 L98 18 L80 10 C76 20 66 24 60 24 C54 24 44 20 40 10 Z"
          fill="#f4f1ea"
          stroke="#c9c2b3"
          strokeWidth="1.5"
        />
        {side === "front" && <path d="M48 12 C52 20 68 20 72 12" fill="none" stroke="#c9c2b3" strokeWidth="1.5" />}
        {active &&
          (chest ? (
            <text x="76" y="44" textAnchor="middle" fontSize="6" fontWeight="700" fill={color} stroke={c.textColor === "white" ? "#999" : "none"} strokeWidth="0.3">
              {label.slice(0, 10)}
            </text>
          ) : (
            <>
              <rect x="40" y="42" width="40" height="34" rx="3" fill="none" stroke="#c9a14a" strokeDasharray="3 2" />
              <text x="60" y="62" textAnchor="middle" fontSize={label.length > 12 ? 5 : 7} fontWeight="700" fill={color} stroke={c.textColor === "white" ? "#999" : "none"} strokeWidth="0.3">
                {label.slice(0, 22)}
              </text>
            </>
          ))}
      </svg>
      <figcaption className="text-[11px] uppercase tracking-wider text-slate-500">{side}</figcaption>
    </figure>
  );
  return (
    <div className="flex justify-center gap-4 rounded-lg bg-cream p-3" aria-label="Customization preview">
      {shirt("front", showFront, c.placement === "left-chest")}
      {shirt("back", showBack, false)}
    </div>
  );
}

export function TeeCustomizer({
  enabled, onToggle, value, onChange, basePrice,
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  value: Customization;
  onChange: (c: Customization) => void;
  basePrice: number;
}) {
  const { locale } = useI18n();
  const { money } = useStore();
  const es = locale === "es";
  const set = (patch: Partial<Customization>) => onChange({ ...value, ...patch });
  const extra = customizationPrice(value) ?? 0;
  const opt = "rounded-md border px-3 py-2.5 text-left text-sm transition min-h-[44px]";
  const on = "border-navy bg-navy text-white";
  const off = "border-line bg-white hover:border-navy";

  return (
    <section className="rounded-xl border border-line p-4 sm:p-5" aria-labelledby="customize-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="customize-heading" className="flex items-center gap-2 font-sans text-base font-semibold">
          <Paintbrush className="h-4 w-4 text-gold" strokeWidth={1.75} /> {es ? "Personaliza tu camiseta" : "Customize this T-shirt"}
        </h2>
        <div role="group" aria-label={es ? "Tipo de camiseta" : "Shirt type"} className="inline-flex rounded-md border border-line p-0.5 text-xs font-semibold">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={enabled === v}
              onClick={() => onToggle(v)}
              className={cn("rounded px-3 py-1.5 transition", enabled === v ? "bg-navy text-white" : "text-navy hover:bg-cream")}
            >
              {v ? (es ? "Personalizada" : "Custom") : es ? "Lisa" : "Plain"}
            </button>
          ))}
        </div>
      </div>

      {enabled && (
        <div className="mt-5 space-y-5 animate-fade-in">
          <TeePreview c={value} />

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{es ? "Ubicación de impresión" : "Print placement"}</legend>
            <div className="grid grid-cols-2 gap-2">
              {PLACEMENTS.map((p) => (
                <button key={p.value} type="button" aria-pressed={value.placement === p.value} onClick={() => set({ placement: p.value })} className={cn(opt, value.placement === p.value ? on : off)}>
                  <span className="block font-medium">{es ? p.es : p.en}</span>
                  <span className={cn("text-xs", value.placement === p.value ? "text-white/80" : "text-slate-500")}>+{money(p.price)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{es ? "Método de impresión" : "Print method"}</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {METHODS.map((m) => (
                <button key={m.value} type="button" aria-pressed={value.method === m.value} onClick={() => set({ method: m.value })} className={cn(opt, value.method === m.value ? on : off)}>
                  <span className="block font-medium">{es ? m.es : m.en}</span>
                  <span className={cn("text-xs", value.method === m.value ? "text-white/80" : "text-slate-500")}>
                    {m.price ? `+${money(m.price)}` : es ? "Incluido" : "Included"}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="custom-text" className="label">
              {es ? "Texto personalizado (opcional)" : "Custom text (optional)"}
            </label>
            <input
              id="custom-text"
              className="input"
              maxLength={CUSTOM_TEXT_MAX}
              value={value.text || ""}
              onChange={(e) => set({ text: e.target.value })}
              placeholder={es ? "Ej. nombre, equipo o frase" : "e.g. name, team or slogan"}
            />
            <p className="mt-1 text-right text-xs text-slate-400">{(value.text || "").length}/{CUSTOM_TEXT_MAX}</p>
          </div>

          {value.text?.trim() && (
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">{es ? "Color del texto" : "Text color"}</legend>
              <div className="flex flex-wrap gap-2">
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    aria-pressed={value.textColor === c.value}
                    aria-label={es ? c.es : c.en}
                    title={es ? c.es : c.en}
                    onClick={() => set({ textColor: c.value })}
                    className={cn("h-10 w-10 rounded-full border-2 transition", value.textColor === c.value ? "border-gold ring-2 ring-gold/30" : "border-line")}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </fieldset>
          )}

          <div>
            <label htmlFor="artwork-url" className="label">{es ? "Enlace a tu logo o diseño (opcional)" : "Link to your logo or design (optional)"}</label>
            <input
              id="artwork-url"
              type="url"
              inputMode="url"
              className="input"
              value={value.artworkUrl || ""}
              onChange={(e) => set({ artworkUrl: e.target.value })}
              placeholder="https://drive.google.com/..."
            />
            <p className="mt-1 text-xs text-slate-500">
              {es
                ? "Comparte un enlace de Google Drive, Dropbox o similar. Si no tienes uno, te contactaremos por correo después del pedido."
                : "Share a Google Drive, Dropbox or similar link. No link? We'll email you to collect your artwork after you order."}
            </p>
          </div>

          <div>
            <label htmlFor="custom-notes" className="label">{es ? "Instrucciones (opcional)" : "Instructions (optional)"}</label>
            <textarea id="custom-notes" className="input min-h-[72px]" maxLength={500} value={value.notes || ""} onChange={(e) => set({ notes: e.target.value })} />
          </div>

          <dl className="space-y-1.5 rounded-lg bg-cream p-3 text-sm">
            <div className="flex justify-between"><dt>{es ? "Camiseta" : "Shirt"}</dt><dd>{money(basePrice)}</dd></div>
            <div className="flex justify-between"><dt>{es ? "Personalización" : "Customization"}</dt><dd>+{money(extra)}</dd></div>
            <div className="flex justify-between border-t border-line pt-1.5 font-semibold"><dt>{es ? "Precio por unidad" : "Price per shirt"}</dt><dd>{money(basePrice + extra)}</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
