"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown, ArrowUp, Copy, ExternalLink, Inbox, Loader2, Pencil, Plus, Search, Star, Trash2, X,
} from "lucide-react";
import { RESOURCES, type FieldDef } from "@/lib/admin/resources";
import { useToast } from "@/components/providers/ToastProvider";
import { AdminPageHeader } from "./AdminShell";
import { FieldInput } from "./FieldInput";
import { UploadTracker, useUploadTracker } from "./UploadTracker";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { cn, formatDate, formatMoney, normalizeImageUrl } from "@/lib/utils";

type Doc = Record<string, unknown> & { _id: string };
type Options = Record<string, { value: string; label: string }[]>;

function Cell({ type, v }: { type?: string; v: unknown }) {
  switch (type) {
    case "image":
      // eslint-disable-next-line @next/next/no-img-element
      return <img src={normalizeImageUrl(v as string)} alt="" className="h-10 w-10 rounded-md bg-cream object-cover" />;
    case "money":
      return <>{formatMoney(Number(v || 0))}</>;
    case "boolean":
      return <StatusBadge value={v ? "active" : "inactive"} />;
    case "status":
      return <StatusBadge value={String(v || "")} />;
    case "date":
      return <>{v ? formatDate(String(v)) : "—"}</>;
    case "rating":
      return <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-gold text-gold" />{Number(v || 0).toFixed(1)}</span>;
    default:
      return <span className="line-clamp-2">{v === undefined || v === null || v === "" ? "—" : String(v)}</span>;
  }
}

function EditorDrawer({
  resource, initial, fields, onClose, onSaved,
}: { resource: string; initial: Doc | null; fields: FieldDef[]; onClose: () => void; onSaved: () => void }) {
  const def = RESOURCES[resource];
  const { toast } = useToast();
  const tracker = useUploadTracker();
  const [form, setForm] = useState<Record<string, unknown>>(() => {
    if (initial) return { ...initial };
    return Object.fromEntries(fields.filter((f) => f.default !== undefined).map((f) => [f.name, f.default]));
  });
  const [saving, setSaving] = useState(false);
  const groups = useMemo(() => {
    const m = new Map<string, FieldDef[]>();
    fields.forEach((f) => m.set(f.group || "", [...(m.get(f.group || "") || []), f]));
    return [...m.entries()];
  }, [fields]);

  const close = async () => {
    await tracker.discardAll(); // remove images uploaded but never saved
    onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const r = await fetch(initial ? `/api/admin/${resource}/${initial._id}` : `/api/admin/${resource}`, {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "Save failed");
      tracker.commit();
      toast(`${def.singular} saved`);
      onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={`${initial ? "Edit" : "New"} ${def.singular}`}>
      <div className="absolute inset-0 animate-fade-in bg-navy/50" onClick={close} />
      <form onSubmit={save} className="absolute inset-y-0 right-0 flex w-full max-w-3xl animate-slide-in-right flex-col bg-white shadow-lift">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="text-xl">{initial ? `Edit ${def.singular}` : `New ${def.singular}`}</h2>
          <button type="button" onClick={close} className="rounded-full p-2 hover:bg-cream" aria-label="Close"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
          {groups.map(([g, list]) => (
            <fieldset key={g || "main"}>
              {g && <legend className="mb-4 w-full border-b border-line pb-2 font-serif text-lg">{g}</legend>}
              <div className="grid gap-4 sm:grid-cols-2">
                {list.map((f) => (
                  <div key={f.name} className={cn(!f.half && "sm:col-span-2")}>
                    <FieldInput f={f} value={form[f.name]} all={form} onChange={(v) => setForm((s) => ({ ...s, [f.name]: v }))} />
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-line bg-cream px-6 py-4">
          <button type="button" onClick={close} className="btn-ghost">Cancel</button>
          <button disabled={saving} className="btn-primary">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Save {def.singular}</button>
        </div>
      </form>
    </div>
  );
}

export function ResourceManager({ resource, dynamicOptions = {}, description }: { resource: string; dynamicOptions?: Options; description?: string }) {
  const def = RESOURCES[resource];
  const { toast } = useToast();
  const [items, setItems] = useState<Doc[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Doc | "new" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const fields = useMemo(
    () => def.fields.map((f) => (dynamicOptions[f.name] ? { ...f, options: dynamicOptions[f.name] } : f)),
    [def.fields, dynamicOptions],
  );

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/admin/${resource}?q=${encodeURIComponent(query)}&page=${page}&limit=25`);
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setItems(d.items);
      setTotal(d.total);
      setPages(d.pages);
    } catch (e) {
      toast((e as Error).message || "Failed to load", "error");
      setItems([]);
    }
  }, [resource, query, page, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const act = async (id: string, method: string, body?: unknown, msg?: string) => {
    setBusy(id);
    try {
      const r = await fetch(`/api/admin/${resource}/${id}`, { method, headers: { "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      if (msg) toast(msg);
      await load();
    } catch (e) {
      toast((e as Error).message || "Action failed", "error");
    } finally {
      setBusy(null);
    }
  };

  const move = async (i: number, dir: -1 | 1) => {
    if (!items) return;
    const a = items[i];
    const b = items[i + dir];
    if (!a || !b) return;
    const ao = Number(a.sortOrder ?? i);
    const bo = Number(b.sortOrder ?? i + dir);
    setBusy(a._id);
    await Promise.all([
      fetch(`/api/admin/${resource}/${a._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: ao === bo ? bo + dir : bo }) }),
      fetch(`/api/admin/${resource}/${b._id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: ao }) }),
    ]);
    setBusy(null);
    load();
  };

  const toggle = def.quickToggle;

  return (
    <>
      <AdminPageHeader
        title={def.title}
        description={description || `${total} total`}
        actions={def.canCreate !== false && (
          <button onClick={() => setEditing("new")} className="btn-primary btn-sm"><Plus className="h-4 w-4" /> Add {def.singular}</button>
        )}
      />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQuery(q);
        }}
        className="mb-4 flex max-w-md gap-2"
        role="search"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <label htmlFor="admin-q" className="sr-only">Search</label>
          <input id="admin-q" className="input pl-9" placeholder={`Search ${def.title.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <button className="btn-outline btn-sm">Search</button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-line bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-cream/70 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              {def.sortable && <th className="w-16 px-3 py-3"><span className="sr-only">Order</span></th>}
              {def.columns.map((c) => <th key={c.name} className="px-4 py-3 font-semibold">{c.label}</th>)}
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {items === null &&
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={def.columns.length + 2} className="px-4 py-3"><div className="skeleton h-8" /></td></tr>
              ))}
            {items?.length === 0 && (
              <tr>
                <td colSpan={def.columns.length + 2} className="px-4 py-14 text-center">
                  <Inbox className="mx-auto h-8 w-8 text-gold" strokeWidth={1.4} />
                  <p className="mt-2 font-medium">No {def.title.toLowerCase()} yet</p>
                  {def.canCreate !== false && <button onClick={() => setEditing("new")} className="btn-primary btn-sm mt-4"><Plus className="h-4 w-4" />Add {def.singular}</button>}
                </td>
              </tr>
            )}
            {items?.map((d, i) => {
              const href = def.publicPath?.(d);
              return (
                <tr key={d._id} className={cn("hover:bg-cream/40", busy === d._id && "opacity-50")}>
                  {def.sortable && (
                    <td className="px-3 py-2">
                      <div className="flex flex-col">
                        <button onClick={() => move(i, -1)} disabled={i === 0} className="text-slate-400 hover:text-navy disabled:opacity-30" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                        <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="text-slate-400 hover:text-navy disabled:opacity-30" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                      </div>
                    </td>
                  )}
                  {def.columns.map((c) => (
                    <td key={c.name} className="px-4 py-3">
                      {toggle && c.name === toggle.field ? (
                        <button
                          onClick={() => act(d._id, "PATCH", { [toggle.field]: d[toggle.field] === toggle.on ? toggle.off : toggle.on }, "Updated")}
                          title={`Toggle ${toggle.label}`}
                          className="rounded-full focus-visible:ring-2"
                        >
                          <Cell type={c.type} v={d[c.name]} />
                        </button>
                      ) : (
                        <Cell type={c.type} v={d[c.name]} />
                      )}
                    </td>
                  ))}
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {href && <a href={href} target="_blank" rel="noreferrer" className="rounded-md p-2 text-slate-500 hover:bg-cream hover:text-navy" title="View on site"><ExternalLink className="h-4 w-4" /><span className="sr-only">View</span></a>}
                      {def.canDuplicate && <button onClick={() => act(d._id, "POST", undefined, "Duplicated as draft")} className="rounded-md p-2 text-slate-500 hover:bg-cream hover:text-navy" title="Duplicate"><Copy className="h-4 w-4" /><span className="sr-only">Duplicate</span></button>}
                      <button onClick={() => setEditing(d)} className="rounded-md p-2 text-slate-500 hover:bg-cream hover:text-navy" title="Edit"><Pencil className="h-4 w-4" /><span className="sr-only">Edit</span></button>
                      <button
                        onClick={() => confirm(`Delete this ${def.singular.toLowerCase()}? This also deletes its uploaded images and cannot be undone.`) && act(d._id, "DELETE", undefined, "Deleted")}
                        className="rounded-md p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" /><span className="sr-only">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 text-sm">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline btn-sm">Previous</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(page + 1)} className="btn-outline btn-sm">Next</button>
        </div>
      )}

      {editing && (
        <UploadTracker>
          <EditorDrawer
            resource={resource}
            fields={fields}
            initial={editing === "new" ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null);
              load();
            }}
          />
        </UploadTracker>
      )}
    </>
  );
}
