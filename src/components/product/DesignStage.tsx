"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { TEXT_COLORS, type Customization } from "@/lib/customization";

type Layer = { x: number; y: number; size: number };
const MAX_BYTES = 4 * 1024 * 1024;
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** Product mockup with a print area. Customers upload a design, then drag and resize it. */
export function DesignStage({ image, value, onChange, es }: { image: string; value: Customization; onChange: (patch: Partial<Customization>) => void; es: boolean }) {
  const area = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const drag = useRef<{ layer: "art" | "text"; id: number } | null>(null);
  const [preview, setPreview] = useState("");
  const [art, setArt] = useState<Layer>({ x: 50, y: 55, size: 60 });
  const [text, setText] = useState<Layer>({ x: 50, y: 18, size: 12 });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const label = value.text?.trim();

  useEffect(() => {
    const r = Math.round;
    const parts = [
      preview ? `Image x${r(art.x)}% y${r(art.y)}% width ${r(art.size)}%` : "",
      label ? `Text x${r(text.x)}% y${r(text.y)}% size ${r(text.size)}%` : "",
    ].filter(Boolean);
    onChange({ layout: parts.join("; ") });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [art, text, preview, label]);

  const upload = async (file?: File) => {
    if (!file) return;
    setError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return setError(es ? "Usa PNG, JPG o WEBP." : "Please use a PNG, JPG or WEBP file.");
    if (file.size > MAX_BYTES) return setError(es ? "El archivo debe pesar menos de 4MB." : "The file must be under 4MB.");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/design-upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data.url);
      onChange({ artworkUrl: `${window.location.origin}${data.url}` });
    } catch (e) {
      setError((e as Error).message || (es ? "No se pudo subir el archivo." : "The upload failed."));
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const start = (layer: "art" | "text") => (e: React.PointerEvent) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { layer, id: e.pointerId };
  };
  const move = (e: React.PointerEvent) => {
    const box = area.current?.getBoundingClientRect();
    if (!box || drag.current?.id !== e.pointerId) return;
    const x = clamp(((e.clientX - box.left) / box.width) * 100, 0, 100);
    const y = clamp(((e.clientY - box.top) / box.height) * 100, 0, 100);
    (drag.current.layer === "art" ? setArt : setText)((l) => ({ ...l, x, y }));
  };
  const stop = () => { drag.current = null; };
  const layerProps = (layer: "art" | "text") => ({ onPointerDown: start(layer), onPointerMove: move, onPointerUp: stop, onPointerCancel: stop });
  const color = TEXT_COLORS.find((c) => c.value === value.textColor)?.hex ?? "#111111";

  return (
    <div className="space-y-3">
      <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-lg bg-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-contain" draggable={false} />
        <div ref={area} data-testid="print-area" className="absolute left-[28%] top-[24%] h-[52%] w-[44%] overflow-hidden border border-dashed border-slate-500/70 [container-type:inline-size]">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt={es ? "Tu diseño" : "Your design"}
              draggable={false}
              {...layerProps("art")}
              className="absolute max-w-none cursor-move touch-none select-none"
              style={{ left: `${art.x}%`, top: `${art.y}%`, width: `${art.size}%`, transform: "translate(-50%, -50%)" }}
            />
          )}
          {label && (
            <span
              {...layerProps("text")}
              className="absolute cursor-move touch-none select-none whitespace-nowrap font-bold"
              style={{ left: `${text.x}%`, top: `${text.y}%`, fontSize: `clamp(8px, ${text.size}cqw, 40px)`, color, transform: "translate(-50%, -50%)" }}
            >
              {label}
            </span>
          )}
        </div>
      </div>
      <p className="text-center text-xs text-slate-500">
        {es ? "Arrastra tu diseño. Lo que quede fuera de la línea punteada no se imprime." : "Drag your design to move it. Anything outside the dashed line is not printed."}
      </p>

      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={es ? "Subir diseño" : "Upload design"} onChange={(e) => upload(e.target.files?.[0])} />
      <div className="flex gap-2">
        <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="btn-primary flex-1">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {preview ? (es ? "Cambiar diseño" : "Replace design") : es ? "Subir tu diseño" : "Upload your design"}
        </button>
        {preview && (
          <button type="button" aria-label={es ? "Quitar diseño" : "Remove design"} onClick={() => { setPreview(""); onChange({ artworkUrl: "" }); }} className="flex h-11 w-11 items-center justify-center rounded-md border border-line hover:border-red-500 hover:text-red-600">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <p className="text-xs text-slate-500">{es ? "PNG, JPG o WEBP, hasta 4MB. Para mejor calidad usa una imagen grande." : "PNG, JPG or WEBP, up to 4MB. Use a large image for the best print quality."}</p>

      {preview && (
        <label className="block text-sm font-medium">
          {es ? "Tamaño del diseño" : "Design size"}
          <input type="range" min={15} max={100} value={art.size} onChange={(e) => setArt((l) => ({ ...l, size: Number(e.target.value) }))} className="mt-1 w-full accent-[#172333]" />
        </label>
      )}
      {label && (
        <label className="block text-sm font-medium">
          {es ? "Tamaño del texto" : "Text size"}
          <input type="range" min={6} max={30} value={text.size} onChange={(e) => setText((l) => ({ ...l, size: Number(e.target.value) }))} className="mt-1 w-full accent-[#172333]" />
        </label>
      )}
    </div>
  );
}
