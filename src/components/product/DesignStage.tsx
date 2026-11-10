"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { webglAvailable, type Face3D } from "./Product3D";
import { ArrowDownToLine, ArrowUpToLine, Box as Cube, Crosshair, ImagePlus, Loader2, Trash2, Type } from "lucide-react";
import { FONTS, TEXT_COLORS, CUSTOM_TEXT_MAX, type Customization } from "@/lib/customization";
import { PHOTOS, SHAPES, isDark, photoFor, printArea, sidesFor, type MockupKind, type Side } from "@/lib/mockups";
import { cn } from "@/lib/utils";

type Box = { x: number; y: number; size: number };
type Layer = "art" | "text";
type SideState = { url: string; ratio: number; art: Box; text: Box; top: Layer };
type Drag = { side: Side; layer: Layer; mode: "move" | "resize"; id: number };

// three.js only loads when the 3D view is opened.
const Product3D = dynamic(() => import("./Product3D"), { ssr: false, loading: () => <div className="absolute inset-0 animate-pulse" /> });

const MAX_BYTES = 4 * 1024 * 1024;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const fresh = (): SideState => ({ url: "", ratio: 1, art: { x: 50, y: 50, size: 70 }, text: { x: 50, y: 15, size: 14 }, top: "text" });
const field = (side: Side): { art: "artworkUrl" | "backArtworkUrl"; text: "text" | "backText" } =>
  side === "front" ? { art: "artworkUrl", text: "text" } : { art: "backArtworkUrl", text: "backText" };

/**
 * Product designer: real product photo tinted to the chosen color (drawn mockup when no photo exists),
 * front/back views, upload + text layers that can be moved, resized, centered and reordered.
 */
export function DesignStage({ kind, color, placement, value, onChange, es }: {
  kind: MockupKind; color: string; placement: string; value: Customization; onChange: (patch: Partial<Customization>) => void; es: boolean;
}) {
  const sides = sidesFor(placement).filter((s) => SHAPES[kind][s] || photoFor(kind, placement, s));
  const [side, setSide] = useState<Side>(sides[0] || "front");
  const [state, setState] = useState<Record<Side, SideState>>({ front: fresh(), back: fresh() });
  const [selected, setSelected] = useState<Layer | null>(null);
  const [view3d, setView3d] = useState(false);
  const [angle, setAngle] = useState(-28);
  const spin = useRef<{ x: number; a: number; id: number } | null>(null);
  const [gpu, setGpu] = useState(false);
  useEffect(() => { setGpu(webglAvailable()); }, []);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const area = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const textInput = useRef<HTMLInputElement>(null);
  const drag = useRef<Drag | null>(null);

  const active = sides.includes(side) ? side : sides[0] || "front";
  useEffect(() => { if (active !== side) setSide(active); }, [active, side]);

  const photo = photoFor(kind, placement, active);
  const shape = SHAPES[kind][active] || SHAPES[kind].front;
  const box = photo?.area ?? printArea(kind, placement, active);
  const cur = state[active];
  const label = (value[field(active).text] as string | undefined)?.trim() || "";
  const textHex = TEXT_COLORS.find((c) => c.value === value.textColor)?.hex ?? "#111111";
  const font = FONTS.find((f) => f.value === value.textFont) ?? FONTS[0];
  const dark = isDark(color);
  const white = color.toLowerCase() === "#f6f5f2";

  // Save where each design sits so the print team can reproduce it.
  useEffect(() => {
    const r = Math.round;
    const describe = (s: Side) => {
      const st = state[s];
      const txt = (value[field(s).text] as string | undefined)?.trim();
      const parts = [st.url ? `image x${r(st.art.x)}% y${r(st.art.y)}% width ${r(st.art.size)}%` : "", txt ? `text x${r(st.text.x)}% y${r(st.text.y)}% size ${r(st.text.size)}` : ""].filter(Boolean);
      if (st.url && txt) parts.push(st.top === "text" ? "text on top" : "image on top");
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
      patchSide(target, { url: data.url, art: { x: 50, y: 50, size: 70 } });
      onChange({ [field(target).art]: `${window.location.origin}${data.url}` });
      setSelected("art");
    } catch (e) {
      setError((e as Error).message || (es ? "No se pudo subir el archivo." : "The upload failed."));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const begin = (layer: Layer, mode: "move" | "resize") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { side: active, layer, mode, id: e.pointerId };
    setSelected(layer);
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
  const grab = (layer: Layer) => ({ onPointerDown: begin(layer, "move"), onPointerMove: move, onPointerUp: end, onPointerCancel: end });
  const handle = (layer: Layer, name: string) => (
    <span role="slider" aria-label={name} aria-valuenow={Math.round(cur[layer].size)} onPointerDown={begin(layer, "resize")} onPointerMove={move} onPointerUp={end} onPointerCancel={end}
      className="absolute -bottom-3 -right-3 h-6 w-6 cursor-nwse-resize touch-none rounded-full border-2 border-white bg-gold shadow" />
  );
  const sideLabel = (s: Side) => (kind === "tote" || kind === "cup" ? (s === "front" ? (es ? "Lado A" : "Side A") : es ? "Lado B" : "Side B") : s === "front" ? (es ? "Frente" : "Front") : es ? "Espalda" : "Back");
  const hasArt = (s: Side) => Boolean(state[s].url || (value[field(s).text] as string | undefined)?.trim());

  const sel = selected === "art" && !cur.url ? null : selected === "text" && !label ? null : selected;
  const center = () => sel && patchSide(active, { [sel]: { ...cur[sel], x: 50, y: 50 } });
  const remove = () => {
    if (sel === "art") { patchSide(active, { url: "" }); onChange({ [field(active).art]: "" }); }
    if (sel === "text") onChange({ [field(active).text]: "" });
    setSelected(null);
  };
  const tool = "inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-xs font-semibold text-navy transition hover:border-navy disabled:opacity-40";

  // One side of the product as it would look printed: photo, color tint and design layers (no editing controls).
  const blend = !dark ? "multiply" : "normal";
  const maskStyle = (src: string): React.CSSProperties => ({
    backgroundColor: color, mixBlendMode: "multiply", WebkitMaskImage: `url(${src})`, maskImage: `url(${src})`,
    WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center",
  });
  const designLayers = (s: Side) => {
    const st = state[s];
    const txt = (value[field(s).text] as string | undefined)?.trim();
    const art = st.url && (
      // eslint-disable-next-line @next/next/no-img-element
      <img key="art" src={st.url} alt="" draggable={false}
        onLoad={(e) => { const i = e.currentTarget; if (i.naturalWidth && Math.abs(i.naturalWidth / i.naturalHeight - st.ratio) > 0.01) patchSide(s, { ratio: i.naturalWidth / i.naturalHeight }); }}
        className="pointer-events-none absolute max-w-none select-none"
        style={{ left: `${st.art.x}%`, top: `${st.art.y}%`, width: `${st.art.size}%`, transform: "translate(-50%, -50%)", mixBlendMode: blend }} />
    );
    const tx = txt && (
      <span key="text" className="pointer-events-none absolute whitespace-nowrap select-none"
        style={{ left: `${st.text.x}%`, top: `${st.text.y}%`, fontSize: `${st.text.size}cqw`, color: textHex, fontFamily: font.css, fontWeight: value.textBold === false ? 400 : 700, transform: "translate(-50%, -50%)" }}>
        {txt}
      </span>
    );
    return st.top === "text" ? [art, tx] : [tx, art];
  };
  const face = (s: Side) => {
    const ph = PHOTOS[kind]?.[s];
    if (!ph) return null;
    const a = photoFor(kind, placement, s)?.area;
    return (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ph.src} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full select-none object-contain" />
        {!white && <div aria-hidden className="pointer-events-none absolute inset-0" style={maskStyle(ph.src)} />}
        {dark && (
          // Bring back the folds that a dark multiply flattens.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={ph.src} alt="" aria-hidden draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain opacity-30" style={{ mixBlendMode: "soft-light" }} />
        )}
        {a && (
          <div className="pointer-events-none absolute [container-type:inline-size]" style={{ left: `${a.x}%`, top: `${a.y}%`, width: `${a.w}%`, height: `${a.h}%` }}>
            <div className="absolute inset-0 overflow-hidden">{designLayers(s)}</div>
          </div>
        )}
      </>
    );
  };

  const PH = PHOTOS[kind];
  const has3d = gpu && Boolean(PH?.front && PH?.back);
  const hanger = kind === "tee" || kind === "sweatshirt" || kind === "hoodie";
  const shade = Math.min(0.45, Math.abs(Math.sin((angle * Math.PI) / 180)) * 0.22);
  const tabs = [...sides.map((s) => ({ key: s as string, label: sideLabel(s), dot: hasArt(s) })), ...(has3d ? [{ key: "3d", label: "3D", dot: false }] : [])];
  const current = view3d ? "3d" : active;
  const faces3d = (): Record<Side, Face3D> => {
    const one = (s: Side): Face3D => {
      const st = state[s];
      const txt = (value[field(s).text] as string | undefined)?.trim();
      return {
        photo: PH![s]!.src,
        area: photoFor(kind, placement, s)?.area,
        art: st.url ? { url: st.url, x: st.art.x, y: st.art.y, size: st.art.size, ratio: st.ratio } : undefined,
        text: txt ? { label: txt, x: st.text.x, y: st.text.y, size: st.text.size } : undefined,
        top: st.top,
      };
    };
    return { front: one("front"), back: one("back") };
  };

  return (
    <div className="space-y-4">
      {tabs.length > 1 && (
        <div role="tablist" aria-label={es ? "Vista" : "View"} className="mx-auto flex w-fit rounded-lg bg-cream p-1 text-sm font-semibold">
          {tabs.map((t) => (
            <button key={t.key} type="button" role="tab" aria-selected={current === t.key}
              onClick={() => { if (t.key === "3d") { setView3d(true); setAngle(-28); } else { setView3d(false); setSide(t.key as Side); } setSelected(null); }}
              className={cn("flex min-w-[84px] items-center justify-center gap-1.5 rounded-md px-4 py-2 transition", current === t.key ? (t.key === "3d" ? "bg-navy text-white shadow-sm" : "bg-white text-navy shadow-sm") : "text-slate-500 hover:text-navy")}>
              {t.key === "3d" && <Cube className="h-4 w-4" />}
              {t.label}
              {t.dot && <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-label={es ? "con diseño" : "has design"} />}
            </button>
          ))}
        </div>
      )}

      {view3d && has3d ? (
        <div className="relative mx-auto aspect-square w-full cursor-grab touch-none select-none overflow-hidden rounded-xl bg-gradient-to-b from-[#f6f6f4] to-[#e9e9e6] active:cursor-grabbing"
          role="img" aria-label={es ? "Vista 3D: arrastra para girar el producto" : "3D view: drag to turn the product"}
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); spin.current = { x: e.clientX, a: angle, id: e.pointerId }; }}
          onPointerMove={(e) => { const sp = spin.current; if (sp && sp.id === e.pointerId) setAngle(sp.a + (e.clientX - sp.x) * 0.6); }}
          onPointerUp={() => { spin.current = null; }} onPointerCancel={() => { spin.current = null; }}>
          {hanger && (
            <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="rail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2f2f2" /><stop offset="0.5" stopColor="#b9b9b9" /><stop offset="1" stopColor="#8c8c8c" /></linearGradient>
              </defs>
              <rect x="10" y="6.4" width="80" height="1.6" rx="0.8" fill="url(#rail)" />
              <circle cx="10" cy="7.2" r="1.6" fill="#bdbdbd" /><circle cx="90" cy="7.2" r="1.6" fill="#bdbdbd" />
              <path d="M17 7.7 L21 12.2 M83 7.7 L79 12.2" stroke="#9a9a9a" strokeWidth="0.9" strokeLinecap="round" />
            </svg>
          )}
          {/* Floor shadow that narrows as the product turns side-on. */}
          <div aria-hidden className="pointer-events-none absolute bottom-[4%] left-1/2 h-[5%] -translate-x-1/2 rounded-[50%] bg-black/15 blur-md"
            style={{ width: `${30 + 30 * Math.abs(Math.cos((angle * Math.PI) / 180))}%` }} />
          <Product3D kind={kind} color={color} white={white} dark={dark} faces={faces3d()} ink={textHex} font={font.css} bold={value.textBold !== false} angle={angle} />
          <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-xs text-slate-500">{es ? "Arrastra para girar el producto" : "Drag to turn the product"}</p>
        </div>
      ) : (
      <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-xl bg-[#f3f3f1]" onPointerDown={() => setSelected(null)}>
        {photo ? face(active) : shape ? (
          <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="mk-shade" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#000" stopOpacity="0.12" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0.04" />
                <stop offset="1" stopColor="#000" stopOpacity="0.12" />
              </linearGradient>
            </defs>
            <path d={shape.body} fill={color} fillRule="evenodd" />
            <path d={shape.body} fill="url(#mk-shade)" fillRule="evenodd" />
            <path d={shape.body} fill="none" stroke={dark ? "#fff" : "#000"} strokeOpacity="0.18" strokeWidth="2" strokeLinejoin="round" />
            <path d={shape.lines} fill="none" stroke={dark ? "#fff" : "#000"} strokeOpacity="0.16" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : null}

        {box && (
          <div ref={area} data-testid="print-area" className={cn("absolute overflow-visible border border-dashed [container-type:inline-size]", dark ? "border-white/60" : "border-slate-500/50")}
            style={{ left: `${box.x}%`, top: `${box.y}%`, width: `${box.w}%`, height: `${box.h}%` }}>
            {!photo && <div className="absolute inset-0 overflow-hidden">{designLayers(active)}</div>}
            {cur.url && (
              <div {...grab("art")} aria-label={es ? "Tu diseño" : "Your design"} role="img"
                className={cn("absolute cursor-move touch-none", sel === "art" ? "outline outline-2 outline-gold" : "hover:outline hover:outline-1 hover:outline-gold/60")}
                style={{ left: `${cur.art.x}%`, top: `${cur.art.y}%`, width: `${cur.art.size}%`, aspectRatio: String(cur.ratio), transform: "translate(-50%, -50%)", zIndex: cur.top === "art" ? 2 : 1 }}>
                {sel === "art" && handle("art", es ? "Tamaño del diseño" : "Resize design")}
              </div>
            )}
            {label && (
              <div {...grab("text")}
                className={cn("absolute cursor-move touch-none whitespace-nowrap text-transparent", sel === "text" ? "outline outline-2 outline-gold" : "hover:outline hover:outline-1 hover:outline-gold/60")}
                style={{ left: `${cur.text.x}%`, top: `${cur.text.y}%`, fontSize: `${cur.text.size}cqw`, fontFamily: font.css, fontWeight: value.textBold === false ? 400 : 700, transform: "translate(-50%, -50%)", zIndex: cur.top === "text" ? 2 : 1 }}>
                {label}
                {sel === "text" && handle("text", es ? "Tamaño del texto" : "Resize text")}
              </div>
            )}
          </div>
        )}
        {!cur.url && !label && box && (
          <p className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs text-slate-500">{es ? "Sube una imagen o agrega texto para empezar." : "Upload an image or add text to start."}</p>
        )}
      </div>
      )}
      <p className="text-center text-xs text-slate-500">
        {es ? "Arrastra para mover. Toca el diseño y usa el punto dorado para cambiar el tamaño. Fuera de la línea punteada no se imprime." : "Drag to move. Tap the design, then drag the gold dot to resize. Anything outside the dashed line is not printed."}
      </p>

      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={es ? "Subir diseño" : "Upload design"} onChange={(e) => upload(e.target.files?.[0])} />
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => { setView3d(false); input.current?.click(); }} disabled={uploading} className="btn-primary">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {cur.url ? (es ? "Cambiar imagen" : "Replace image") : es ? "Subir imagen" : "Upload image"}
        </button>
        <button type="button" onClick={() => { setView3d(false); setSelected("text"); textInput.current?.focus(); }} className="btn-outline">
          <Type className="h-4 w-4" /> {es ? "Agregar texto" : "Add text"}
        </button>
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}

      <div className="space-y-3 rounded-xl border border-line p-4">
        <div>
          <label htmlFor={`custom-text-${active}`} className="label">
            {es ? "Texto" : "Text"}{sides.length > 1 ? ` (${sideLabel(active)})` : ""}
          </label>
          <input ref={textInput} id={`custom-text-${active}`} className="input" maxLength={CUSTOM_TEXT_MAX}
            value={(value[field(active).text] as string | undefined) || ""}
            onFocus={() => setSelected("text")}
            onChange={(e) => { onChange({ [field(active).text]: e.target.value }); setSelected("text"); }}
            placeholder={es ? "Ej. nombre, equipo o frase" : "e.g. name, team or slogan"} />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <select aria-label={es ? "Fuente" : "Font"} className="input" value={font.value} onChange={(e) => onChange({ textFont: e.target.value })}>
            {FONTS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
          <button type="button" aria-pressed={value.textBold !== false} onClick={() => onChange({ textBold: value.textBold === false })}
            className={cn("rounded-md border px-4 text-sm font-bold transition", value.textBold !== false ? "border-navy bg-navy text-white" : "border-line bg-white")}>
            B
          </button>
        </div>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">{es ? "Color de tinta" : "Ink color"}</legend>
          <div className="flex flex-wrap gap-2">
            {TEXT_COLORS.map((c) => (
              <button key={c.value} type="button" aria-pressed={value.textColor === c.value} aria-label={es ? c.es : c.en} title={es ? c.es : c.en}
                onClick={() => onChange({ textColor: c.value })}
                className={cn("h-9 w-9 rounded-full border-2 transition", value.textColor === c.value ? "border-gold ring-2 ring-gold/30" : "border-line")} style={{ backgroundColor: c.hex }} />
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-2 border-t border-line pt-3" role="toolbar" aria-label={es ? "Herramientas" : "Design tools"}>
          <button type="button" className={tool} disabled={!sel} onClick={center}><Crosshair className="h-3.5 w-3.5" />{es ? "Centrar" : "Centre"}</button>
          <button type="button" className={tool} disabled={!sel || !cur.url || !label || cur.top === sel} onClick={() => sel && patchSide(active, { top: sel })}><ArrowUpToLine className="h-3.5 w-3.5" />{es ? "Traer al frente" : "Bring forward"}</button>
          <button type="button" className={tool} disabled={!sel || !cur.url || !label || cur.top !== sel} onClick={() => sel && patchSide(active, { top: sel === "art" ? "text" : "art" })}><ArrowDownToLine className="h-3.5 w-3.5" />{es ? "Enviar atrás" : "Send back"}</button>
          <button type="button" className={cn(tool, "text-red-600 hover:border-red-500")} disabled={!sel} onClick={remove}><Trash2 className="h-3.5 w-3.5" />{es ? "Quitar" : "Remove"}</button>
        </div>
        {sel && (
          <label className="block text-sm font-medium">
            {sel === "art" ? (es ? "Tamaño de la imagen" : "Image size") : es ? "Tamaño del texto" : "Text size"}
            <input type="range" min={sel === "art" ? 10 : 5} max={sel === "art" ? 200 : 40} value={Math.round(cur[sel].size)}
              onChange={(e) => patchSide(active, { [sel]: { ...cur[sel], size: Number(e.target.value) } })} className="mt-1 w-full accent-[#172333]" />
          </label>
        )}
        <p className="text-xs text-slate-500">{es ? "Imágenes PNG, JPG o WEBP de hasta 4MB. Usa una imagen grande para mejor calidad." : "PNG, JPG or WEBP images up to 4MB. Use a large image for the best print quality."}</p>
      </div>
    </div>
  );
}
