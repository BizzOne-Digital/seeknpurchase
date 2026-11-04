"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSubmit } from "./useSubmit";

function safeNext(n: string | null, fallback: string) {
  return n && n.startsWith("/") && !n.startsWith("//") ? n : fallback;
}

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const { submit, loading, fieldErrors } = useSubmit();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (mode === "register") {
      if (f.password.length < 8) return setErr(t.errors.passwordShort);
      if (f.password !== f.confirm) return setErr(t.errors.passwordMismatch);
    }
    const r = await submit("/api/auth/customer", { action: mode, name: f.name, email: f.email, phone: f.phone, password: f.password });
    if (r) {
      router.push(safeNext(sp.get("next"), "/account"));
      router.refresh();
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      {mode === "register" && (
        <div>
          <label htmlFor="a-name" className="label">{t.common.name}</label>
          <input id="a-name" className="input" value={f.name} onChange={set("name")} autoComplete="name" required />
          {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
        </div>
      )}
      <div>
        <label htmlFor="a-email" className="label">{t.common.email}</label>
        <input id="a-email" type="email" className="input" value={f.email} onChange={set("email")} autoComplete="email" required />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
      </div>
      {mode === "register" && (
        <div>
          <label htmlFor="a-phone" className="label">{t.common.phone}</label>
          <input id="a-phone" type="tel" className="input" value={f.phone} onChange={set("phone")} autoComplete="tel" />
        </div>
      )}
      <div>
        <label htmlFor="a-pass" className="label">{t.account.password}</label>
        <input id="a-pass" type="password" className="input" value={f.password} onChange={set("password")} autoComplete={mode === "login" ? "current-password" : "new-password"} required aria-describedby={mode === "register" ? "a-pass-hint" : undefined} />
        {mode === "register" && <p id="a-pass-hint" className="mt-1 text-xs text-slate-500">{t.account.passwordHint}</p>}
        {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
      </div>
      {mode === "register" && (
        <div>
          <label htmlFor="a-confirm" className="label">{t.account.confirmPassword}</label>
          <input id="a-confirm" type="password" className="input" value={f.confirm} onChange={set("confirm")} autoComplete="new-password" required />
        </div>
      )}
      {err && <p className="field-error" role="alert">{err}</p>}
      <button disabled={loading} className="btn-primary w-full py-3">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? t.account.signIn : t.account.register}
      </button>
      <p className="text-center text-sm text-slate-500">
        {mode === "login" ? t.account.noAccount : t.account.haveAccount}{" "}
        <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-navy underline-offset-4 hover:underline">
          {mode === "login" ? t.account.register : t.account.signIn}
        </Link>
      </p>
    </form>
  );
}
