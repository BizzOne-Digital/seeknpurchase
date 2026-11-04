"use client";

import { useState } from "react";
import { CalendarCheck, CheckCircle2, Loader2 } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSubmit } from "./useSubmit";

export function BookingForm() {
  const { t } = useI18n();
  const { submit, loading, fieldErrors } = useSubmit();
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", preferredDate: "", preferredTime: "", topic: t.booking.topics[0], message: "", website: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const today = new Date().toISOString().slice(0, 10);

  if (done) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-line bg-cream p-10 text-center" role="status">
        <CheckCircle2 className="h-12 w-12 text-emerald-600" strokeWidth={1.4} />
        <p className="mt-4 text-lg font-medium">{t.booking.success}</p>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        if (await submit("/api/booking", f)) setDone(true);
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <input type="text" name="website" value={f.website} onChange={set("website")} className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <div>
        <label htmlFor="b-name" className="label">{t.common.name} <span className="text-red-600">*</span></label>
        <input id="b-name" className="input" value={f.name} onChange={set("name")} autoComplete="name" />
        {fieldErrors.name && <p className="field-error">{fieldErrors.name}</p>}
      </div>
      <div>
        <label htmlFor="b-email" className="label">{t.common.email} <span className="text-red-600">*</span></label>
        <input id="b-email" type="email" className="input" value={f.email} onChange={set("email")} autoComplete="email" />
        {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
      </div>
      <div>
        <label htmlFor="b-phone" className="label">{t.common.phone}</label>
        <input id="b-phone" type="tel" className="input" value={f.phone} onChange={set("phone")} autoComplete="tel" />
      </div>
      <div>
        <label htmlFor="b-topic" className="label">{t.booking.topic}</label>
        <select id="b-topic" className="input" value={f.topic} onChange={set("topic")}>
          {t.booking.topics.map((x) => <option key={x}>{x}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="b-date" className="label">{t.booking.date}</label>
        <input id="b-date" type="date" min={today} className="input" value={f.preferredDate} onChange={set("preferredDate")} />
      </div>
      <div>
        <label htmlFor="b-time" className="label">{t.booking.time}</label>
        <input id="b-time" type="time" className="input" value={f.preferredTime} onChange={set("preferredTime")} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="b-message" className="label">{t.common.message}</label>
        <textarea id="b-message" rows={5} className="input" value={f.message} onChange={set("message")} />
      </div>
      <div className="sm:col-span-2">
        <button disabled={loading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" strokeWidth={1.75} />}
          {loading ? t.common.sending : t.booking.request}
        </button>
      </div>
    </form>
  );
}
