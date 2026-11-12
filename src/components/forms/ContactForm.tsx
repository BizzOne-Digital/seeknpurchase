"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Paperclip, Send, X } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useSubmit } from "./useSubmit";

export function ContactForm() {
  const { t } = useI18n();
  const { submit, loading, fieldErrors } = useSubmit();
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ name: "", email: "", phone: "", subject: "", message: "", attachmentUrl: "", website: "" });
  const [file, setFile] = useState<{ name: string; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const es = t.nav.home !== "Home";

  // Links like /contact?subject=... prefill the subject (e.g. "Custom bulk order").
  useEffect(() => {
    const subject = new URLSearchParams(window.location.search).get("subject");
    if (subject) setF((v) => ({ ...v, subject: subject.slice(0, 200) }));
  }, []);

  const attach = async (picked?: File) => {
    if (!picked) return;
    setUploadError("");
    if (!["image/png", "image/jpeg", "image/webp"].includes(picked.type)) return setUploadError(es ? "Usa PNG, JPG o WEBP." : "Please use a PNG, JPG or WEBP image.");
    if (picked.size > 4 * 1024 * 1024) return setUploadError(es ? "El archivo debe pesar menos de 4MB." : "The file must be under 4MB.");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", picked);
      const r = await fetch("/api/design-upload", { method: "POST", body: form });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      setF((v) => ({ ...v, attachmentUrl: d.url }));
      setFile({ name: picked.name, preview: d.url });
    } catch (e) {
      setUploadError((e as Error).message || t.common.somethingWrong);
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };
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
        <span className="label">{es ? "Adjuntar imagen o diseño (opcional)" : "Attach image or artwork (optional)"}</span>
        <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={es ? "Adjuntar imagen" : "Attach image"} onChange={(e) => attach(e.target.files?.[0])} />
        {file ? (
          <div className="flex items-center gap-3 rounded-md border border-line p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={file.preview} alt="" className="h-12 w-12 rounded object-cover" />
            <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm"><Paperclip className="h-4 w-4 shrink-0 text-gold" />{file.name}</span>
            <button type="button" aria-label={es ? "Quitar archivo" : "Remove file"} onClick={() => { setFile(null); setF((v) => ({ ...v, attachmentUrl: "" })); }} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-red-50 hover:text-red-600"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <button type="button" onClick={() => input.current?.click()} disabled={uploading} className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-line px-4 py-5 text-sm text-slate-600 transition hover:border-navy hover:text-navy">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
            {uploading ? (es ? "Subiendo..." : "Uploading...") : es ? "Sube tu logo, diseño o imagen de referencia (PNG, JPG o WEBP, hasta 4MB)" : "Upload your logo, design or reference image (PNG, JPG or WEBP, up to 4MB)"}
          </button>
        )}
        {uploadError && <p className="field-error" role="alert">{uploadError}</p>}
      </div>
      <div className="sm:col-span-2">
        <button disabled={loading || uploading} className="btn-primary">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.75} />}
          {loading ? t.common.sending : t.contact.send}
        </button>
      </div>
    </form>
  );
}
