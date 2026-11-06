"use client";

import { useRef } from "react";
import { Paintbrush } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStore } from "@/components/providers/StoreProvider";
import { DesignStage } from "./DesignStage";
import { CUSTOM_TEXT_MAX, TEXT_COLORS, customizationPrice, methodsFor, placementsFor, type CustomType, type Customization } from "@/lib/customization";
import { cn } from "@/lib/utils";

export const defaultCustom = (type: CustomType = "apparel"): Customization => ({
  placement: placementsFor(type)[0].value, method: methodsFor(type)[0].value, text: "", textColor: "black", artworkUrl: "", notes: "",
});

/** Removes empty optional fields so the cart line and order stay clean. */
export function cleanCustomization(c: Customization): Customization {
  return {
    placement: c.placement,
    method: c.method,
    ...(c.text?.trim() ? { text: c.text.trim(), textColor: c.textColor || "black" } : {}),
    ...(c.artworkUrl?.trim() ? { artworkUrl: c.artworkUrl.trim() } : {}),
    ...(c.layout ? { layout: c.layout } : {}),
    ...(c.notes?.trim() ? { notes: c.notes.trim() } : {}),
  };
}

/** Returns an error message, or "" when the customization is valid. */
export function validateCustomization(c: Customization, es: boolean): string {
  const url = c.artworkUrl?.trim();
  if (url && !/^https?:\/\/\S+\.\S+/i.test(url)) return es ? "El enlace del diseño debe comenzar con https://" : "Artwork link must start with https://";
  return "";
}

export function ProductCustomizer({
  enabled, onToggle, value, onChange, basePrice, image, type = "apparel",
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  value: Customization;
  onChange: (c: Customization) => void;
  basePrice: number;
  image: string;
  type?: CustomType;
}) {
  const { locale } = useI18n();
  const { money } = useStore();
  const es = locale === "es";
  const latest = useRef(value);
  latest.current = value;
  const set = (patch: Partial<Customization>) => {
    latest.current = { ...latest.current, ...patch };
    onChange(latest.current);
  };
  const extra = customizationPrice(value, type) ?? 0;
  const opt = "rounded-md border px-3 py-2.5 text-left text-sm transition min-h-[44px]";
  const on = "border-navy bg-navy text-white";
  const off = "border-line bg-white hover:border-navy";

  return (
    <section className="rounded-xl border border-line p-4 sm:p-5" aria-labelledby="customize-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="customize-heading" className="flex items-center gap-2 font-sans text-base font-semibold">
          <Paintbrush className="h-4 w-4 text-gold" strokeWidth={1.75} /> {es ? "Personaliza este producto" : "Customize this item"}
        </h2>
        <div role="group" aria-label={es ? "Tipo de producto" : "Item type"} className="inline-flex rounded-md border border-line p-0.5 text-xs font-semibold">
          {[false, true].map((v) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={enabled === v}
              onClick={() => onToggle(v)}
              className={cn("rounded px-3 py-1.5 transition", enabled === v ? "bg-navy text-white" : "text-navy hover:bg-cream")}
            >
              {v ? (es ? "Personalizado" : "Custom") : es ? "Sin diseño" : "Plain"}
            </button>
          ))}
        </div>
      </div>

      {enabled && (
        <div className="mt-5 space-y-5 animate-fade-in">
          <DesignStage image={image} value={value} onChange={set} es={es} />

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{es ? "Ubicación del diseño" : "Design placement"}</legend>
            <div className="grid grid-cols-2 gap-2">
              {placementsFor(type).map((p) => (
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
              {methodsFor(type).map((m) => (
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
            <label htmlFor="custom-notes" className="label">{es ? "Instrucciones (opcional)" : "Instructions (optional)"}</label>
            <textarea id="custom-notes" className="input min-h-[72px]" maxLength={500} value={value.notes || ""} onChange={(e) => set({ notes: e.target.value })} />
          </div>

          <dl className="space-y-1.5 rounded-lg bg-cream p-3 text-sm">
            <div className="flex justify-between"><dt>{es ? "Producto" : "Item"}</dt><dd>{money(basePrice)}</dd></div>
            <div className="flex justify-between"><dt>{es ? "Personalización" : "Customization"}</dt><dd>+{money(extra)}</dd></div>
            <div className="flex justify-between border-t border-line pt-1.5 font-semibold"><dt>{es ? "Precio por unidad" : "Price per item"}</dt><dd>{money(basePrice + extra)}</dd></div>
          </dl>
        </div>
      )}
    </section>
  );
}
