"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type { FieldDef } from "@/lib/admin/resources";
import { LocalImageField, MultiImageField } from "./LocalImageField";
import { ICON_NAMES, Icon } from "@/components/ui/Icon";
import { cn, slugify } from "@/lib/utils";

type Variant = { name: string; options: string[] };

function toDateInput(v: unknown) {
  if (!v) return "";
  const d = new Date(String(v));
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function TagsInput({ value, onChange, id }: { value: string[]; onChange: (v: string[]) => void; id: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setDraft("");
  };
  return (
    <div className="input flex flex-wrap items-center gap-1.5 py-2">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded bg-cream-200 px-2 py-0.5 text-xs">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} aria-label={`Remove ${t}`}><X className="h-3 w-3" /></button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        onBlur={add}
        placeholder="Type and press Enter"
        className="min-w-[120px] flex-1 bg-transparent text-sm focus:outline-none"
      />
    </div>
  );
}

function VariantsInput({ value, onChange }: { value: Variant[]; onChange: (v: Variant[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <input className="input w-36" placeholder="Name (e.g. Size)" value={v.name} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} aria-label="Variant name" />
          <input
            className="input min-w-[200px] flex-1"
            placeholder="Options, comma separated (S, M, L)"
            defaultValue={v.options.join(", ")}
            onBlur={(e) => onChange(value.map((x, j) => (j === i ? { ...x, options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) } : x)))}
            aria-label="Variant options"
          />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="btn-ghost btn-sm text-red-600" aria-label="Remove variant"><Trash2 className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, { name: "", options: [] }])} className="btn-outline btn-sm"><Plus className="h-3.5 w-3.5" /> Add variant</button>
    </div>
  );
}

export function FieldInput({ f, value, onChange, all }: { f: FieldDef; value: unknown; onChange: (v: unknown) => void; all: Record<string, unknown> }) {
  const id = `fld-${f.name}`;
  const label = (
    <label htmlFor={id} className="label">
      {f.label} {f.required && <span className="text-red-600">*</span>}
    </label>
  );
  const help = f.help ? <p className="mt-1 text-xs text-slate-500">{f.help}</p> : null;
  const ro = f.readOnly;

  switch (f.type) {
    case "image":
      return <div><LocalImageField label={f.label} value={(value as string) || ""} folder={f.folder || "misc"} onChange={onChange} />{help}</div>;
    case "images":
      return <div><MultiImageField label={f.label} value={(value as string[]) || []} folder={f.folder || "misc"} onChange={onChange} />{help}</div>;
    case "boolean":
      return (
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-line bg-white px-3.5 py-2.5 text-sm">
          <input id={id} type="checkbox" className="h-4 w-4 accent-navy" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} disabled={ro} />
          {f.label}
        </label>
      );
    case "textarea":
    case "longtext":
      return <div>{label}<textarea id={id} rows={f.type === "longtext" ? 10 : 3} className="input" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} readOnly={ro} required={f.required} />{help}</div>;
    case "number":
    case "money":
      return (
        <div>
          {label}
          <input id={id} type="number" step={f.type === "money" ? "0.01" : "any"} min={0} className="input" value={(value as number | string) ?? ""} onChange={(e) => onChange(e.target.value)} readOnly={ro} required={f.required} />
          {help}
        </div>
      );
    case "date":
      return <div>{label}<input id={id} type="date" className="input" value={toDateInput(value)} onChange={(e) => onChange(e.target.value)} readOnly={ro} />{help}</div>;
    case "select":
      return (
        <div>
          {label}
          <select id={id} className="input capitalize" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} disabled={ro} required={f.required}>
            <option value="">Select…</option>
            {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {help}
        </div>
      );
    case "tags":
      return <div>{label}<TagsInput id={id} value={(value as string[]) || []} onChange={onChange} />{help}</div>;
    case "variants":
      return <div><p className="label">{f.label}</p><VariantsInput value={(value as Variant[]) || []} onChange={onChange} />{help}</div>;
    case "icon":
      return (
        <div>
          {label}
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={f.label}>
            {ICON_NAMES.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={value === n}
                title={n}
                onClick={() => onChange(n)}
                className={cn("flex h-9 w-9 items-center justify-center rounded-md border", value === n ? "border-navy bg-navy text-white" : "border-line hover:border-navy")}
              >
                <Icon name={n} className="h-4 w-4" />
                <span className="sr-only">{n}</span>
              </button>
            ))}
          </div>
        </div>
      );
    case "slug":
      return (
        <div>
          {label}
          <div className="flex gap-2">
            <input id={id} className="input" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="auto-generated" />
            {f.slugFrom && (
              <button type="button" className="btn-ghost btn-sm shrink-0" onClick={() => onChange(slugify(String(all[f.slugFrom!] || "")))}>Generate</button>
            )}
          </div>
          {help}
        </div>
      );
    default:
      return (
        <div>
          {label}
          <input id={id} type={f.type === "email" ? "email" : "text"} className="input" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} readOnly={ro} required={f.required} />
          {help}
        </div>
      );
  }
}
