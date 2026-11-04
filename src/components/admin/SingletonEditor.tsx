"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useToast } from "@/components/providers/ToastProvider";
import { AdminPageHeader } from "./AdminShell";
import { LocalImageField, type UploadFolder } from "./LocalImageField";
import { UploadTracker, useUploadTracker } from "./UploadTracker";
import { cn } from "@/lib/utils";

type Obj = Record<string, unknown>;
export type SField = { path: string; label: string; type?: "text" | "textarea" | "number" | "image"; folder?: UploadFolder; half?: boolean; help?: string };
export type SSection = { title: string; fields?: SField[]; list?: { path: string; item: SField[]; addLabel: string; max?: number } };

function get(o: Obj, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => (acc && typeof acc === "object" ? (acc as Obj)[k] : undefined), o);
}
function set(o: Obj, path: string, v: unknown): Obj {
  const [k, ...rest] = path.split(".");
  if (!rest.length) return { ...o, [k]: v };
  return { ...o, [k]: set(((o[k] as Obj) || {}) as Obj, rest.join("."), v) };
}

function Field({ f, value, onChange }: { f: SField; value: unknown; onChange: (v: unknown) => void }) {
  const id = `s-${f.path}`;
  if (f.type === "image") return <LocalImageField label={f.label} value={(value as string) || ""} folder={f.folder || "pages"} onChange={onChange} aspect="wide" />;
  return (
    <div>
      <label htmlFor={id} className="label">{f.label}</label>
      {f.type === "textarea" ? (
        <textarea id={id} rows={4} className="input" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input id={id} type={f.type === "number" ? "number" : "text"} step="any" className="input" value={(value as string | number) ?? ""} onChange={(e) => onChange(e.target.value)} />
      )}
      {f.help && <p className="mt-1 text-xs text-slate-500">{f.help}</p>}
    </div>
  );
}

function Inner({ title, description, endpoint, sections, transform }: { title: string; description: string; endpoint: string; sections: SSection[]; transform?: (o: Obj) => Obj }) {
  const { toast } = useToast();
  const tracker = useUploadTracker();
  const [data, setData] = useState<Obj | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(endpoint).then((r) => r.json()).then((d) => setData(d.item || {})).catch(() => toast("Failed to load", "error"));
  }, [endpoint, toast]);

  if (!data) return <div className="skeleton h-96" />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = transform ? transform(data) : data;
      const r = await fetch(endpoint, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Save failed");
      tracker.commit();
      toast("Saved. Changes are live on the storefront.");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save}>
      <AdminPageHeader title={title} description={description} actions={<button disabled={saving} className="btn-primary btn-sm">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save changes</button>} />
      <div className="space-y-6">
        {sections.map((s) => (
          <section key={s.title} className="rounded-xl border border-line bg-white p-5 md:p-6">
            <h2 className="mb-4 text-lg">{s.title}</h2>
            {s.fields && (
              <div className="grid gap-4 md:grid-cols-2">
                {s.fields.map((f) => (
                  <div key={f.path} className={cn(!f.half && "md:col-span-2")}>
                    <Field f={f} value={get(data, f.path)} onChange={(v) => setData((d) => set(d!, f.path, v))} />
                  </div>
                ))}
              </div>
            )}
            {s.list && (() => {
              const list = (get(data, s.list.path) as Obj[]) || [];
              const L = s.list;
              return (
                <div className="space-y-4">
                  {list.map((item, i) => (
                    <div key={i} className="rounded-lg border border-line bg-cream/50 p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-sm font-semibold">#{i + 1}</span>
                        <button type="button" onClick={() => setData((d) => set(d!, L.path, list.filter((_, j) => j !== i)))} className="btn-ghost btn-sm text-red-600"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        {L.item.map((f) => (
                          <div key={f.path} className={cn(!f.half && "md:col-span-2")}>
                            <Field f={{ ...f, path: `${L.path}.${i}.${f.path}` }} value={item[f.path]} onChange={(v) => setData((d) => set(d!, L.path, list.map((x, j) => (j === i ? { ...x, [f.path]: v } : x))))} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {list.length < (L.max || 10) && (
                    <button type="button" onClick={() => setData((d) => set(d!, L.path, [...list, {}]))} className="btn-outline btn-sm"><Plus className="h-3.5 w-3.5" />{L.addLabel}</button>
                  )}
                </div>
              );
            })()}
          </section>
        ))}
      </div>
      <div className="mt-6 flex justify-end"><button disabled={saving} className="btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save changes</button></div>
    </form>
  );
}

export function SingletonEditor(props: { title: string; description: string; endpoint: string; sections: SSection[]; transform?: (o: Obj) => Obj }) {
  return <UploadTracker><Inner {...props} /></UploadTracker>;
}
