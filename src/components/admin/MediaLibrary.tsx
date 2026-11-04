"use client";

import { useCallback, useEffect, useState } from "react";
import { Copy, ImageOff, Trash2, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { AdminPageHeader } from "./AdminShell";
import { uploadImage, type UploadFolder } from "./LocalImageField";
import { cn, formatDate } from "@/lib/utils";

type Item = { _id: string; folder: string; filename: string; size: number; mimeType: string; createdAt: string; url: string };
const FILTERS = ["all", "products", "gallery", "pages", "misc"] as const;
const kb = (b: number) => (b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);

export function MediaLibrary() {
  const { toast } = useToast();
  const [folder, setFolder] = useState<(typeof FILTERS)[number]>("all");
  const [items, setItems] = useState<Item[] | null>(null);
  const [usage, setUsage] = useState({ bytes: 0, count: 0 });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    const r = await fetch(`/api/admin/media?page=${page}${folder !== "all" ? `&folder=${folder}` : ""}`);
    const d = await r.json();
    if (!r.ok) {
      toast(d.error || "Failed to load media", "error");
      return setItems([]);
    }
    setItems(d.items);
    setUsage(d.usage);
    setPages(d.pages);
  }, [folder, page, toast]);
  useEffect(() => { load(); }, [load]);

  const remove = async (i: Item) => {
    if (!confirm(`Delete ${i.filename}? Any page still using this image will show a placeholder.`)) return;
    const r = await fetch(`/api/upload?url=${encodeURIComponent(i.url)}`, { method: "DELETE" });
    if (r.ok) {
      toast("Image deleted");
      load();
    } else toast("Delete failed", "error");
  };

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    const target: UploadFolder = folder === "all" ? "gallery" : folder;
    for (const f of Array.from(files)) {
      try {
        await uploadImage(f, target);
      } catch (e) {
        toast(`${f.name}: ${(e as Error).message}`, "error");
      }
    }
    setUploading(false);
    toast("Upload complete");
    load();
  };

  return (
    <>
      <AdminPageHeader
        title="Media Library"
        description={`${usage.count} files · ${kb(usage.bytes)} stored in MongoDB`}
        actions={
          <label className="btn-primary btn-sm cursor-pointer">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload to {folder === "all" ? "gallery" : folder}
            <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => onUpload(e.target.files)} />
          </label>
        }
      />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Folder">
        {FILTERS.map((f) => (
          <button key={f} role="tab" aria-selected={folder === f} onClick={() => { setPage(1); setFolder(f); }} className={cn("rounded-full px-4 py-1.5 text-sm capitalize", folder === f ? "bg-navy text-white" : "bg-white ring-1 ring-line hover:bg-cream")}>
            {f}
          </button>
        ))}
      </div>
      {items === null ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton aspect-square" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-white py-16 text-center"><ImageOff className="mx-auto h-8 w-8 text-gold" strokeWidth={1.4} /><p className="mt-2">No images in this folder</p></div>
      ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((i) => (
            <li key={i._id} className="overflow-hidden rounded-xl border border-line bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={i.url} alt={i.filename} loading="lazy" className="aspect-square w-full bg-cream object-cover" />
              <div className="space-y-1 p-3 text-xs">
                <p className="truncate font-medium" title={i.filename}>{i.filename}</p>
                <p className="text-slate-500"><span className="capitalize">{i.folder}</span> · {kb(i.size)} · {formatDate(i.createdAt)}</p>
                <div className="flex gap-1 pt-1">
                  <button onClick={() => { navigator.clipboard.writeText(i.url); toast("URL copied"); }} className="btn-ghost btn-sm flex-1 px-2"><Copy className="h-3.5 w-3.5" />Copy URL</button>
                  <button onClick={() => remove(i)} className="btn-ghost btn-sm px-2 text-red-600" aria-label={`Delete ${i.filename}`}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pages > 1 && (
        <div className="mt-4 flex justify-end gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline btn-sm">Previous</button>
          <span className="self-center">Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="btn-outline btn-sm">Next</button>
        </div>
      )}
    </>
  );
}
