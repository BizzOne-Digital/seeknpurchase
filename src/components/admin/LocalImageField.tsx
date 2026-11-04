"use client";

import { useId, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { normalizeImageUrl, cn } from "@/lib/utils";
import { useUploadTracker } from "./UploadTracker";

export type UploadFolder = "products" | "gallery" | "pages" | "misc";
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX = 8 * 1024 * 1024;

/** Uploads one file to POST /api/upload and returns the stored public URL. */
export async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  if (!ACCEPT.split(",").includes(file.type)) throw new Error("Unsupported file type. Use PNG, JPEG, WEBP or GIF.");
  if (file.size > MAX) throw new Error("File is too large. Maximum size is 8MB.");
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  const r = await fetch("/api/upload", { method: "POST", body: formData });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.success) throw new Error(d.error || "Upload failed");
  return d.url as string;
}

type Props = {
  value?: string;
  folder: UploadFolder;
  onChange: (url: string) => void;
  label?: string;
  aspect?: "square" | "wide";
};

/**
 * Reusable admin image field. Images are stored in MongoDB (StoredUpload) via /api/upload —
 * never on disk — and only the resulting URL is passed back through onChange.
 */
export function LocalImageField({ value, folder, onChange, label, aspect = "square" }: Props) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const tracker = useUploadTracker();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file, folder);
      tracker.track(url);
      const previous = value;
      onChange(url);
      // Replacing an image uploaded in this unsaved session: delete it now.
      // Previously-saved images are removed server-side when the form is saved.
      await tracker.discard(previous);
      toast("Image uploaded");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  const remove = async () => {
    const previous = value;
    onChange("");
    await tracker.discard(previous);
    toast("Image removed", "info");
  };

  return (
    <div>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <div className="flex flex-wrap items-start gap-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "relative flex items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-cream transition",
            aspect === "wide" ? "h-32 w-56" : "h-32 w-32",
            dragOver ? "border-gold bg-gold-50" : "border-line",
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={normalizeImageUrl(value)} alt="Preview" className="h-full w-full object-cover" />
          ) : (
            <button type="button" onClick={() => input.current?.click()} className="flex flex-col items-center gap-1 text-xs text-slate-500">
              <UploadCloud className="h-6 w-6 text-gold" strokeWidth={1.5} />
              Drop or choose
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80" aria-live="polite">
              <Loader2 className="h-6 w-6 animate-spin text-navy" />
              <span className="sr-only">Uploading…</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input id={id} ref={input} type="file" accept={ACCEPT} className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
          <button type="button" disabled={uploading} onClick={() => input.current?.click()} className="btn-outline btn-sm">
            {value ? <RefreshCw className="h-3.5 w-3.5" /> : <ImagePlus className="h-3.5 w-3.5" />}
            {uploading ? "Uploading…" : value ? "Replace image" : "Choose image"}
          </button>
          {value && (
            <button type="button" disabled={uploading} onClick={remove} className="btn-ghost btn-sm text-red-600">
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
          <p className="max-w-[220px] text-[11px] leading-snug text-slate-400">PNG, JPEG, WEBP or GIF · max 8MB</p>
        </div>
      </div>
    </div>
  );
}

/** Multi-image gallery built on the same upload pipeline. */
export function MultiImageField({ value = [], folder, onChange, label }: { value?: string[]; folder: UploadFolder; onChange: (urls: string[]) => void; label?: string }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const tracker = useUploadTracker();
  const [uploading, setUploading] = useState(false);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const added: string[] = [];
    for (const f of Array.from(files).slice(0, 10)) {
      try {
        const url = await uploadImage(f, folder);
        tracker.track(url);
        added.push(url);
      } catch (e) {
        toast(`${f.name}: ${(e as Error).message}`, "error");
      }
    }
    if (added.length) {
      onChange([...value, ...added].slice(0, 20));
      toast(`${added.length} image${added.length > 1 ? "s" : ""} uploaded`);
    }
    setUploading(false);
    if (input.current) input.current.value = "";
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      {label && <label htmlFor={id} className="label">{label}</label>}
      <ul className="flex flex-wrap gap-3">
        {value.map((u, i) => (
          <li key={u + i} className="group relative h-24 w-24 overflow-hidden rounded-lg border border-line bg-cream">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={normalizeImageUrl(u)} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-1 top-1 rounded bg-navy px-1.5 text-[10px] font-semibold text-white">Main</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-navy/70 px-1 py-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" onClick={() => move(i, -1)} className="px-1 text-xs text-white" aria-label="Move left"><ChevronLeft className="h-3.5 w-3.5" /></button>
              <button
                type="button"
                onClick={async () => {
                  onChange(value.filter((_, x) => x !== i));
                  await tracker.discard(u);
                }}
                className="px-1 text-white"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="px-1 text-xs text-white" aria-label="Move right"><ChevronRight className="h-3.5 w-3.5" /></button>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            disabled={uploading}
            onClick={() => input.current?.click()}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-xs text-slate-500 hover:border-gold"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5 text-gold" />}
            {uploading ? "Uploading" : "Add images"}
          </button>
        </li>
      </ul>
      <input id={id} ref={input} type="file" accept={ACCEPT} multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}
