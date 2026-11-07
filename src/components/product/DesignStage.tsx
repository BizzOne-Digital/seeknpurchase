"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { TEXT_COLORS, CUSTOM_TEXT_MAX, type Customization } from "@/lib/customization";
import { SHAPES, isDark, printArea, sidesFor, type MockupKind, type Side } from "@/lib/mockups";
import { cn } from "@/lib/utils";

type Box = { x: number; y: number; size: number };
type SideState = { url: string; art: Box; text: Box };
type Drag = { side: Side; layer: "art" | "text"; mode: "move" | "resize"; id: number };

const MAX_BYTES = 4 * 1024 * 1024;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const fresh = (): SideState => ({ url: "", art: { x: 50, y: 55, size: 70 }, text: { x: 50, y: 15, size: 14 } });
const field = (side: Side): { art: "artworkUrl" | "backArtworkUrl"; text: "text" | "backText" } =>
  side === "front" ? { art: "artworkUrl", text: "text" } : { art: "backArtworkUrl", text: "backText" };

/** Drawn product mockup in the chosen color, with front/back views. Customers upload a design or add text, then drag and resize it. */
export function DesignStage({ kind, color, placement, value, onChange, es }: {
  kind: MockupKind; color: string; placement: string; value: Customization; onChange: (patch: Partial<Customization>) => void; es: boolean;
}) {
  const sides = sidesFor(placement).filter((s) => SHAPES[kind][s]);
  const [side, setSide] = useState<Side>(sides[0] || "front");
  const [state, setState] = useState<Record<Side, SideState>>({ front: fresh(), back: fresh() });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const area = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const drag = useRef<Drag | null>(null);

  const active = sides.includes(side) ? side : sides[0] || "front";
  useEffect(() => { if (active !== side) setSide(active); }, [active, side]);

  const shape = SHAPES[kind][active] || SHAPES[kind].front!;
  const box = printArea(kind, placement, active);
  const cur = state[active];
  const label = (value[field(active).text] as string | undefined)?.trim() || "";
  const textHex = TEXT_COLORS.find((c) => c.value === value.textColor)?.hex ?? "#111111";
  const dark = isDark(color);

  // Save where each design sits so the print team can reproduce it.
  useEffect(() => {
    const r = Math.round;
    const describe = (s: Side) => {
      const st = state[s];
      const txt = (value[field(s).text] as string | undefined)?.trim();
      const parts = [st.url ? `image x${r(st.art.x)}% y${r(st.art.y)}% width ${r(st.art.size)}%` : "", txt ? `text x${r(st.text.x)}% y${r(st.text.y)}% size ${r(st.text.size)}` : ""].filter(Boolean);
      return parts.length ? `${s === "front" ? "Front" : "Back"}: ${parts.join(", ")}` : "";
    };
    onChange({ layout: sides.map(describe).filter(Boolean).join("; ") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, value.text, value.backText, placement]);

  const patchSide = (s: Side, p: Partial<SideState>) => setState((st) => ({ ...st, [s]: { ...st[s], ...p } }));

  const upload = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return setError(es ? "Usa PNG, JPG o WEBP." : "Please use a PNG, JPG or WEBP file.");
    if (file.size > MAX_BYTES) return setError(es ? "El archivo debe pesar menos de 4MB." : "The file must be under 4MB.");
    setUploading(true);
    const target = active;
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/design-upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      patchSide(target, { url: data.url });
      onChange({ [field(target).art]: `${window.location.origin}${data.url}` });
    } catch (e) {
      setError((e as Error).message || (es ? "No se pudo subir el archivo." : "The upload failed."));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const begin = (layer: "art" | "text", mode: "move" | "resize") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { side: active, layer, mode, id: e.pointerId };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current;
    const rect = area.current?.getBoundingClientRect();
    if (!d || !rect || d.id !== e.pointerId) return;
    const px = ((e.clientX - rect.left) / rect.width) * 100;
    const py = ((e.clientY - rect.top) / rect.height) * 100;
    setState((st) => {
      const s = st[d.side];
      const b = s[d.layer];
      const next = d.mode === "move"
        ? { ...b, x: clamp(px, 0, 100), y: clamp(py, 0, 100) }
        : { ...b, size: d.layer === "art" ? clamp(Math.abs(px - b.x) * 2, 10, 200) : clamp(Math.abs(px - b.x) / 2.5, 5, 40) };
      return { ...st, [d.side]: { ...s, [d.layer]: next } };
    });
  };
  const end = () => { drag.current = null; };
  const handlers = (layer: "art" | "text") => ({ onPointerDown: begin(layer, "move"), onPointerMove: move, onPointerUp: end, onPointerCancel: end });
  const handle = (layer: "art" | "text", name: string) => (
    <span
      role="slider"
      aria-label={name}
      aria-valuenow={Math.round(cur[layer].size)}
      onPointerDown={begin(layer, "resize")}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
      className="absolute -bottom-3 -right-3 h-6 w-6 cursor-nwse-resize touch-none rounded-full border-2 border-white bg-gold shadow"
    />
  );
  const sideLabel = (s: Side) => (kind === "tote" ? (s === "front" ? (es ? "Lado A" : "Side A") : es ? "Lado B" : "Side B") : s === "front" ? (es ? "Frente" : "Front") : es ? "Espalda" : "Back");

  return (
    <div className="space-y-3">
      {sides.length > 1 && (
        <div role="tablist" aria-label={es ? "Vista" : "View"} className="mx-auto flex w-fit rounded-md border border-line p-0.5 text-sm font-semibold">
          {sides.map((s) => (
            <button key={s} type="button" role="tab" aria-selected={active === s} onClick={() => setSide(s)} className={cn("min-w-[88px] rounded px-4 py-2 transition", active === s ? "bg-navy text-white" : "text-navy hover:bg-cream")}>
              {sideLabel(s)}
            </button>
          ))}
        </div>
      )}

      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg bg-cream">
        <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <linearGradient id="mk-shade" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#000" stopOpacity="0.12" />
              <stop offset="0.25" stopColor="#000" stopOpacity="0" />
              <stop offset="0.5" stopColor="#fff" stopOpacity="0.04" />
              <stop offset="0.75" stopColor="#000" stopOpacity="0" />
              <stop offset="1" stopColor="#000" stopOpacity="0.12" />
            </linearGradient>
          </defs>
          <path d={shape.body} fill={color} fillRule="evenodd" />
          <path d={shape.body} fill="url(#mk-shade)" fillRule="evenodd" />
          <path d={shape.body} fill="none" stroke={dark ? "#ffffff" : "#000000"} strokeOpacity="0.18" strokeWidth="2" strokeLinejoin="round" />
          <path d={shape.lines} fill="none" stroke={dark ? "#ffffff" : "#000000"} strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
        </svg>

        {box && (
          <div
            ref={area}
            data-testid="print-area"
            className={cn("absolute overflow-visible border border-dashed [container-type:inline-size]", dark ? "border-white/50" : "border-slate-500/60")}
            style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}
          >
            <div className="absolute inset-0 overflow-hidden">
              {cur.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cur.url} alt="" draggable={false} className="pointer-events-none absolute max-w-none select-none"
                  style={{ left: `${cur.art.x}%`, top: `${cur.art.y}%`, width: `${cur.art.size}%`, transform: "translate(-50%, -50%)" }} />
              )}
              {label && (
                <span className="pointer-events-none absolute whitespace-nowrap font-bold select-none"
                  style={{ left: `${cur.text.x}%`, top: `${cur.text.y}%`, fontSize: `${cur.text.size}cqw`, color: textHex, transform: "translate(-50%, -50%)" }}>
                  {label}
                </span>
              )}
            </div>
            {/* Invisible grab boxes sit on top so the design can be moved even when part of it is clipped. */}
            {cur.url && (
              <div {...handlers("art")} aria-label={es ? "Tu diseño" : "Your design"} role="img" className="absolute cursor-move touch-none outline outline-1 outline-gold/60"
                style={{ left: `${cur.art.x}%`, top: `${cur.art.y}%`, width: `${cur.art.size}%`, aspectRatio: "1", transform: "translate(-50%, -50%)" }}>
                {handle("art", es ? "Tamaño del diseño" : "Resize design")}
              </div>
            )}
            {label && (
              <div {...handlers("text")} className="absolute cursor-move touch-none whitespace-nowrap font-bold text-transparent outline outline-1 outline-gold/60"
                style={{ left: `${cur.text.x}%`, top: `${cur.text.y}%`, fontSize: `${cur.text.size}cqw`, transform: "translate(-50%, -50%)" }}>
                {label}
                {handle("text", es ? "Tamaño del texto" : "Resize text")}
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-center text-xs text-slate-500">
        {es ? "Arrastra para mover. Usa el punto dorado para cambiar el tamaño. Fuera de la línea punteada no se imprime." : "Drag to move. Drag the gold dot to resize. Anything outside the dashed line is not printed."}
      </p>

      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={es ? "Subir diseño" : "Upload design"} onChange={(e) => upload(e.target.files?.[0])} />
      <div className="flex gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="btn-primary flex-1">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {cur.url ? (es ? "Cambiar diseño" : "Replace design") : es ? "Subir diseño" : "Upload design"}
          {sides.length > 1 && <span className="font-normal opacity-80">({sideLabel(active)})</span>}
        </button>
        {cur.url && (
          <button type="button" aria-label={es ? "Quitar diseño" : "Remove design"} onClick={() => { patchSide(active, { url: "" }); onChange({ [field(active).art]: "" }); }} className="flex h-11 w-11 items-center justify-center rounded-md border border-line hover:border-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <p className="text-xs text-slate-500">{es ? "PNG, JPG o WEBP, hasta 4MB." : "PNG, JPG or WEBP, up to 4MB. Use a large image for the best print quality."}</p>

      {cur.url && (
        <label className="block text-sm font-medium">
          {es ? "Tamaño del diseño" : "Design size"}
          <input type="range" min={10} max={200} value={Math.round(cur.art.size)} onChange={(e) => patchSide(active, { art: { ...cur.art, size: Number(e.target.value) } })} className="mt-1 w-full accent-[#172333]" />
        </label>
      )}

      <div>
        <label htmlFor={`custom-text-${active}`} className="label">
          {es ? "Texto" : "Text"}{sides.length > 1 ? ` (${sideLabel(active)})` : ""} <span className="font-normal text-slate-500">{es ? "opcional" : "optional"}</span>
        </label>
        <input
          id={`custom-text-${active}`}
          className="input"
          maxLength={CUSTOM_TEXT_MAX}
          value={(value[field(active).text] as string | undefined) || ""}
          onChange={(e) => onChange({ [field(active).text]: e.target.value })}
          placeholder={es ? "Ej. nombre, equipo o frase" : "e.g. name, team or slogan"}
        />
      </div>
      {label && (
        <label className="block text-sm font-medium">
          {es ? "Tamaño del texto" : "Text size"}
          <input type="range" min={5} max={40} value={Math.round(cur.text.size)} onChange={(e) => patchSide(active, { text: { ...cur.text, size: Number(e.target.value) } })} className="mt-1 w-full accent-[#172333]" />
        </label>
      )}
    </div>
  );
}
