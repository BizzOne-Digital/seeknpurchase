"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Paintbrush } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useStore } from "@/components/providers/StoreProvider";
import { DesignStage } from "./DesignStage";
import { CUSTOM_TEXT_MAX, ROSTER_NAME_MAX, ROSTER_PRICES, TEXT_COLORS, customizationPrice, hasRoster, methodsFor, placementsFor, type CustomType, type Customization } from "@/lib/customization";
import { cn } from "@/lib/utils";
import { PHOTOS, isDark, sidesFor, type MockupKind } from "@/lib/mockups";

export const defaultCustom = (type: CustomType = "apparel"): Customization => ({
  placement: placementsFor(type)[0].value, method: methodsFor(type)[0].value, text: "", textColor: "black", artworkUrl: "", notes: "",
});

/** Removes empty optional fields so the cart line and order stay clean. */
export function cleanCustomization(c: Customization): Customization {
  const sides = sidesFor(c.placement);
  const emb = c.method === "embroidery"; // embroidery is logo only
  const front = sides.includes("front");
  const back = sides.includes("back");
  return {
    placement: c.placement,
    method: c.method,
    // Keep only the sides this placement prints on.
    ...(!emb && front && c.text?.trim() ? { text: c.text.trim() } : {}),
    ...(front && c.artworkUrl?.trim() ? { artworkUrl: c.artworkUrl.trim() } : {}),
    ...(!emb && back && c.backText?.trim() ? { backText: c.backText.trim() } : {}),
    ...(back && c.backArtworkUrl?.trim() ? { backArtworkUrl: c.backArtworkUrl.trim() } : {}),
    ...(c.teamName?.trim() ? { teamName: c.teamName.trim() } : {}),
    ...(c.frontNumber?.trim() ? { frontNumber: c.frontNumber.trim() } : {}),
    ...(c.backName?.trim() ? { backName: c.backName.trim() } : {}),
    ...(c.backNumber?.trim() ? { backNumber: c.backNumber.trim() } : {}),
    ...((!emb && front && c.text?.trim()) || (!emb && back && c.backText?.trim()) || hasRoster(c) ? { textColor: c.textColor || "black", textFont: c.textFont || "sans", textBold: c.textBold !== false } : {}),
    ...(c.layout ? { layout: c.layout } : {}),
    ...(c.notes?.trim() ? { notes: c.notes.trim() } : {}),
  };
}

/** Returns an error message, or "" when the customization is valid. */
export function validateCustomization(c: Customization, es: boolean): string {
  const bad = [c.artworkUrl, c.backArtworkUrl].some((u) => u?.trim() && !/^https?:\/\/\S+/i.test(u.trim()));
  if (bad) return es ? "El enlace del diseño debe comenzar con https://" : "Artwork link must start with https://";
  return "";
}

/** Plain (not customized) product in the selected color: the white product photo tinted to that color. */
function ColorPreview({ src, color }: { src: string; color: string }) {
  const white = color.toLowerCase() === "#f6f5f2";
  const mask: React.CSSProperties = {
    backgroundColor: color, mixBlendMode: "multiply", WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`,
    WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center",
  };
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#f3f3f1]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="absolute inset-0 h-full w-full object-contain" />
      {!white && <div aria-hidden className="absolute inset-0" style={mask} />}
      {isDark(color) && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" aria-hidden className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-30" style={{ mixBlendMode: "soft-light" }} />
      )}
    </div>
  );
}

export function ProductCustomizer({
  enabled, onToggle, value, onChange, basePrice, kind, color, type = "apparel",
}: {
  enabled: boolean;
  onToggle: (v: boolean) => void;
  value: Customization;
  onChange: (c: Customization) => void;
  basePrice: number;
  kind: MockupKind;
  color: string;
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
  // Keep text readable: switch black/white text when the garment color changes.
  useEffect(() => {
    const t = latest.current.textColor;
    if (isDark(color) && (t === "black" || t === "navy")) set({ textColor: "white" });
    else if (!isDark(color) && t === "white") set({ textColor: "black" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setSlot(document.getElementById("design-slot"));
    // Plain mode also replaces the gallery once a color photo can be shown.
    if (!enabled && !PHOTOS[kind]?.front) return;
    document.documentElement.dataset.designing = "1";
    return () => { delete document.documentElement.dataset.designing; };
  }, [enabled, kind]);
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

      {!enabled && (
        <dl className="mt-4 space-y-1.5 rounded-lg bg-cream p-3 text-sm">
          <div className="flex justify-between"><dt>{es ? "Producto sin diseño" : "Plain item (no print)"}</dt><dd>{money(basePrice)}</dd></div>
          <div className="flex justify-between border-t border-line pt-1.5 font-semibold"><dt>{es ? "Precio por unidad" : "Price per item"}</dt><dd>{money(basePrice)}</dd></div>
        </dl>
      )}
      {!enabled && slot && PHOTOS[kind]?.front && createPortal(<ColorPreview src={PHOTOS[kind]!.front!.src} color={color} />, slot)}
      {enabled && (
        <div className="mt-5 space-y-5 animate-fade-in">
          {slot ? createPortal(<DesignStage kind={kind} color={color} placement={value.placement} value={value} onChange={set} es={es} />, slot) : <DesignStage kind={kind} color={color} placement={value.placement} value={value} onChange={set} es={es} />}

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
                <button key={m.value} type="button" aria-pressed={value.method === m.value} onClick={() => set(m.value === "embroidery" ? { method: m.value, text: "", backText: "" } : { method: m.value })} className={cn(opt, value.method === m.value ? on : off)}>
                  <span className="block font-medium">{es ? m.es : m.en}</span>
                  <span className={cn("text-xs", value.method === m.value ? "text-white/80" : "text-slate-500")}>
                    {m.price ? `+${money(m.price)}` : es ? "Incluido" : "Included"}{m.value === "embroidery" && (es ? " · solo logo" : " · logo only")}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          {kind === "jersey" && (
            <fieldset>
              <legend className="mb-1 text-sm font-semibold">{es ? "Nombres y números" : "Team Names & Numbers"}</legend>
              <p className="mb-3 text-xs text-slate-500">{es ? "Opcional. Para un pedido de equipo, agrega cada jugador como un artículo aparte." : "Optional. For a team order, add each player to the cart as a separate item."}</p>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["teamName", es ? "Nombre del equipo (frente)" : "Front - Team Name", ROSTER_PRICES.teamName, "text"],
                  ["frontNumber", es ? "Número (frente)" : "Front - Number", ROSTER_PRICES.frontNumber, "num"],
                  ["backName", es ? "Nombre del jugador (espalda)" : "Back - Player Name", ROSTER_PRICES.back, "text"],
                  ["backNumber", es ? "Número (espalda)" : "Back - Number", 0, "num"],
                ] as const).map(([k, label, price, t]) => (
                  <div key={k}>
                    <label htmlFor={`r-${k}`} className="label">{label}{price ? <span className="font-normal text-slate-500"> +{money(price)}</span> : null}</label>
                    <input id={`r-${k}`} className="input" value={(value[k] as string) || ""}
                      inputMode={t === "num" ? "numeric" : undefined} maxLength={t === "num" ? 3 : ROSTER_NAME_MAX}
                      placeholder={t === "num" ? "10" : k === "teamName" ? (es ? "LEONES" : "TIGERS") : (es ? "GARCÍA" : "SMITH")}
                      onChange={(e) => set({ [k]: t === "num" ? e.target.value.replace(/\D/g, "").slice(0, 3) : e.target.value.toUpperCase() })} />
                  </div>
                ))}
              </div>
              {(value.backName || value.backNumber) && <p className="mt-2 text-xs text-slate-500">{es ? "Nombre y número de espalda: +" : "Back name & number: +"}{money(ROSTER_PRICES.back)} {es ? "en total" : "total"}</p>}
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
