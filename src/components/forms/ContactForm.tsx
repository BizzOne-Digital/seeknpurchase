"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSubmit } from "./useSubmit";

export function ContactForm() {
  const { t } = useI18n();
  const { submit, loading, fieldErrors } = useSubmit();
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "", website: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-line bg-cream p-10 text-center" role="status">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" strokeWidth={1.4} />
        <p className="mt-4 text-lg font-medium">{t.contact.success}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (await submit("/api/contact", f)) setDone(true);
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <input type="text" name="website" value={f.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <div>
        <label htmlFor="c-name" className="label">{t.common.name} <span className="text-red-600">*</span></label>
        <input id="c-name" required className="input" value={f.name} onChange={set("name")} autoComplete="name" />
        {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
      </div>
      <div>
        <label htmlFor="c-email" className="label">{t.common.email} <span className="text-red-600">*</span></label>
        <input id="c-email" type="email" required className="input" value={f.email} onChange={set("email")} autoComplete="email" />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="c-phone" className="label">{t.common.phone}</label>
        <input id="c-phone" type="tel" className="input" value={f.phone} onChange={set("phone")} autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="c-subject" className="label">{t.common.subject}</label>
        <input id="c-subject" className="input" value={f.subject} onChange={set("subject")} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-message" className="label">{t.common.message} <span className="text-red-600">*</span></label>
        <textarea id="c-message" required rows={6} className="input" value={f.message} onChange={set("message")} />
        {fieldErrors.message && <p className="field-error">{fieldErrors.message}</p>}
      </div>
      <div className="sm:col-span-2">
        <button disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.75} />}
          {loading ? t.common.sending : t.contact.send}
        </button>
      </div>
    </form>
  );
}
