"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useI18n } from "@/components/providers/I18nProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { cn } from "@/lib/utils";

export function NewsletterForm({ variant = "footer", source = "footer" }: { variant?: "footer" | "banner"; source?: string }) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast(t.newsletter.invalid, "error");
    setLoading(true);
    try {
      const r = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, source }) });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error);
      toast(t.newsletter.success);
      setEmail("");
    } catch (err) {
      toast((err as Error).message || t.common.somethingWrong, "error");
    } finally {
      setLoading(false);
    }
  };

  const id = `nl-${source}`;
  return (
    <form onSubmit={submit} className={cn("flex w-full", variant === "banner" ? "max-w-md gap-2" : "")} noValidate>
      <label htmlFor={id} className="sr-only">{t.common.email}</label>
      <input
        id={id}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t.newsletter.placeholder}
        className={cn(
          "min-w-0 flex-1 px-3.5 text-sm text-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold",
          variant === "banner" ? "h-11 rounded-md" : "h-10 rounded-l-md",
        )}
      />
      <button
        type="submit"
        disabled={loading}
        aria-label={t.newsletter.subscribe}
        className={cn(
          "flex items-center justify-center bg-gold font-semibold text-white transition hover:bg-gold-600 disabled:opacity-60",
          variant === "banner" ? "h-11 gap-2 rounded-md px-5 text-sm" : "h-10 w-11 rounded-r-md",
        )}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.75} />}
        {variant === "banner" && t.newsletter.subscribe}
      </button>
    </form>
  );
}
