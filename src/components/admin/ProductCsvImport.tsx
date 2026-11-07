"use client";

import { useRef, useState } from "react";
import { Download, FileUp, Loader2, X } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";

const TEMPLATE = [
  "name,slug,sku,category,price,compare_at_price,wholesale_price,wholesale_min_qty,stock,status,short_description,description,images,tags",
  'Classic Cotton T-Shirt,classic-cotton-t-shirt,SP-TEE-013,everyday-essentials,14.99,,7.99,24,500,published,"Soft everyday crew-neck tee","100% cotton, regular fit",https://example.com/tee-front.jpg|https://example.com/tee-back.jpg,t-shirt|apparel',
].join("\n");

type Result = { created: number; updated: number; failed: number; errors: { row: number; error: string }[] };

/** Admin: import or update products (including wholesale prices) from a CSV file. */
export function ProductCsvImport() {
  const { toast } = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const run = async (file?: File) => {
    if (!file) return;
    if (file.size > 5_000_000) return toast("The CSV file must be under 5MB.", "error");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/products/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csv: await file.text() }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      toast(`Import done: ${data.created} added, ${data.updated} updated${data.failed ? `, ${data.failed} failed` : ""}.`, data.failed ? "info" : "success");
    } catch (e) {
      toast((e as Error).message || "Import failed", "error");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <>
      <a href={`data:text/csv;charset=utf-8,${encodeURIComponent(TEMPLATE)}`} download="products-template.csv" className="btn-ghost btn-sm">
        <Download className="h-4 w-4" /> CSV template
      </a>
      <button type="button" onClick={() => input.current?.click()} disabled={busy} className="btn-outline btn-sm">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} Import CSV
      </button>
      <input ref={input} type="file" accept=".csv,text/csv" className="sr-only" aria-label="Import products CSV" onChange={(e) => run(e.target.files?.[0])} />
      {result && (
        <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-xl border border-line bg-white p-5 shadow-lift sm:inset-x-auto sm:right-6">
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{result.created} added · {result.updated} updated · {result.failed} failed</p>
            <button type="button" aria-label="Close" onClick={() => { setResult(null); window.location.reload(); }}><X className="h-4 w-4" /></button>
          </div>
          {result.errors.length > 0 && (
            <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm text-red-700">
              {result.errors.map((e) => <li key={e.row}>Row {e.row}: {e.error}</li>)}
            </ul>
          )}
          <p className="mt-3 text-xs text-slate-500">Close this box to refresh the product list.</p>
        </div>
      )}
    </>
  );
}
