"use client";

import { useState } from "react";
import { useToast } from "@/components/providers/ToastProvider";
import { useI18n } from "@/components/providers/I18nProvider";

/** Small helper for JSON form submissions with loading state, field errors and toasts. */
export function useSubmit() {
  const { toast } = useToast();
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit<T = unknown>(url: string, body: unknown, opts: { method?: string; success?: string } = {}): Promise<T | null> {
    setLoading(true);
    setFieldErrors({});
    try {
      const r = await fetch(url, { method: opts.method || "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) {
        if (Array.isArray(d.issues)) {
          setFieldErrors(Object.fromEntries(d.issues.map((i: { path: string; message: string }) => [i.path, i.message])));
        }
        throw new Error(d.error || t.common.somethingWrong);
      }
      if (opts.success) toast(opts.success);
      return d as T;
    } catch (e) {
      toast((e as Error).message || t.common.somethingWrong, "error");
      return null;
    } finally {
      setLoading(false);
    }
  }

  return { submit, loading, fieldErrors };
}
