"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useI18n } from "@/components/providers/I18nProvider";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl md:text-4xl">{t.errors.generic}</h1>
      <p className="mt-3 max-w-md text-slate-600">{t.errors.genericText}</p>
      {error.digest && <p className="mt-2 text-xs text-slate-400">Ref: {error.digest}</p>}
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary">{t.common.tryAgain}</button>
        <Link href="/" className="btn-outline">{t.common.backHome}</Link>
      </div>
    </main>
  );
}
