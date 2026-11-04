"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSubmit } from "@/components/forms/useSubmit";
import { EmptyState } from "@/components/ui/EmptyState";

export function ProfileForm({ initial }: { initial: { name: string; email: string; phone?: string } }) {
  const { t } = useI18n();
  const router = useRouter();
  const { submit, loading, fieldErrors } = useSubmit();
  const [f, setF] = useState({ name: initial.name, email: initial.email, phone: initial.phone || "" });
  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await submit("/api/account/profile", f, { method: "PUT", success: t.account.saved })) router.refresh();
      }}
    >
      {(["name", "email", "phone"] as const).map((k) => (
        <div key={k}>
          <label htmlFor={`p-${k}`} className="label">{k === "name" ? t.common.name : k === "email" ? t.common.email : t.common.phone}</label>
          <input id={`p-${k}`} type={k === "email" ? "email" : k === "phone" ? "tel" : "text"} className="input" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
          {fieldErrors[k] && <p className="field-error">{fieldErrors[k]}</p>}
        </div>
      ))}
      <button disabled={loading} className="btn-primary w-fit">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{t.common.save}</button>
    </form>
  );
}

export function PasswordForm() {
  const { t } = useI18n();
  const { submit, loading } = useSubmit();
  const [f, setF] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [err, setErr] = useState("");
  return (
    <form
      className="grid max-w-xl gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setErr("");
        if (f.newPassword.length < 8) return setErr(t.errors.passwordShort);
        if (f.newPassword !== f.confirm) return setErr(t.errors.passwordMismatch);
        if (await submit("/api/account/profile", { action: "password", currentPassword: f.currentPassword, newPassword: f.newPassword }, { method: "PUT", success: t.account.saved })) {
          setF({ currentPassword: "", newPassword: "", confirm: "" });
        }
      }}
    >
      <div><label htmlFor="pw-c" className="label">{t.account.currentPassword}</label><input id="pw-c" type="password" autoComplete="current-password" className="input" value={f.currentPassword} onChange={(e) => setF({ ...f, currentPassword: e.target.value })} /></div>
      <div><label htmlFor="pw-n" className="label">{t.account.newPassword}</label><input id="pw-n" type="password" autoComplete="new-password" className="input" value={f.newPassword} onChange={(e) => setF({ ...f, newPassword: e.target.value })} /><p className="mt-1 text-xs text-slate-500">{t.account.passwordHint}</p></div>
      <div><label htmlFor="pw-r" className="label">{t.account.confirmPassword}</label><input id="pw-r" type="password" autoComplete="new-password" className="input" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></div>
      {err && <p className="field-error" role="alert">{err}</p>}
      <button disabled={loading} className="btn-primary w-fit">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{t.account.updatePassword}</button>
    </form>
  );
}

type Address = { _id: string; label?: string; firstName?: string; lastName?: string; address: string; apartment?: string; city: string; state: string; zip: string; country?: string; phone?: string; isDefault?: boolean };
const blank = { label: "Home", firstName: "", lastName: "", address: "", apartment: "", city: "", state: "", zip: "", country: "United States", phone: "", isDefault: false };

export function AddressManager({ initial }: { initial: Address[] }) {
  const { t } = useI18n();
  const { submit, loading, fieldErrors } = useSubmit();
  const [list, setList] = useState<Address[]>(initial);
  const [editing, setEditing] = useState<(typeof blank & { id?: string }) | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const d = await submit<{ addresses: Address[] }>("/api/account/addresses", editing.id ? { ...editing } : editing, { method: editing.id ? "PUT" : "POST", success: t.account.saved });
    if (d) {
      setList(d.addresses);
      setEditing(null);
    }
  };
  const del = async (id: string) => {
    if (!confirm(`${t.common.delete}?`)) return;
    const r = await fetch(`/api/account/addresses?id=${id}`, { method: "DELETE" });
    const d = await r.json();
    if (r.ok) setList(d.addresses);
  };

  const fields: [keyof typeof blank, string, boolean?][] = [
    ["label", t.account.label], ["firstName", t.checkout.firstName], ["lastName", t.checkout.lastName], ["address", t.checkout.address, true],
    ["apartment", t.checkout.apartment, true], ["city", t.checkout.city], ["state", t.checkout.state], ["zip", t.checkout.zip], ["country", t.checkout.country], ["phone", t.common.phone],
  ];

  return (
    <div className="space-y-6">
      {!editing && <button onClick={() => setEditing({ ...blank })} className="btn-primary btn-sm"><Plus className="h-4 w-4" /> {t.account.addAddress}</button>}
      {editing && (
        <form onSubmit={save} className="grid gap-4 rounded-xl border border-line bg-cream p-5 sm:grid-cols-2">
          {fields.map(([k, label, span]) => (
            <div key={k} className={span ? "sm:col-span-2" : ""}>
              <label htmlFor={`ad-${k}`} className="label">{label}</label>
              <input id={`ad-${k}`} className="input" value={String(editing[k] ?? "")} onChange={(e) => setEditing({ ...editing, [k]: e.target.value })} />
              {fieldErrors[k] && <p className="field-error">{fieldErrors[k]}</p>}
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" className="h-4 w-4 accent-navy" checked={editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} /> {t.account.makeDefault}
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={loading} className="btn-primary btn-sm">{loading && <Loader2 className="h-4 w-4 animate-spin" />}{t.common.save}</button>
            <button type="button" onClick={() => setEditing(null)} className="btn-ghost btn-sm">{t.common.cancel}</button>
          </div>
        </form>
      )}
      {list.length === 0 && !editing ? (
        <EmptyState icon={MapPin} title={t.account.noAddresses} />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <li key={a._id} className="rounded-xl border border-line p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold">{a.label}</p>
                {a.isDefault && <span className="badge bg-gold-50 text-gold-700"><Star className="mr-1 h-3 w-3" />{t.account.default}</span>}
              </div>
              <address className="text-sm not-italic leading-relaxed text-slate-600">
                {[a.firstName, a.lastName].filter(Boolean).join(" ")}{(a.firstName || a.lastName) && <br />}
                {a.address}{a.apartment ? `, ${a.apartment}` : ""}<br />{a.city}, {a.state} {a.zip}<br />{a.country}
              </address>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditing({ ...blank, ...Object.fromEntries(Object.entries(a).map(([k, v]) => [k, v ?? ""])), isDefault: Boolean(a.isDefault), id: a._id })}
                  className="btn-ghost btn-sm"
                ><Pencil className="h-3.5 w-3.5" />{t.common.edit}</button>
                <button onClick={() => del(a._id)} className="btn-ghost btn-sm text-red-600"><Trash2 className="h-3.5 w-3.5" />{t.common.delete}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
