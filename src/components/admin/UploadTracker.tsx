"use client";

import { createContext, useCallback, useContext, useRef } from "react";

/**
 * Tracks images uploaded during an unsaved form session so they can be cleaned up when
 * they are replaced/removed before saving, or when the admin cancels the form.
 * Images that were already saved on the document are cleaned up server-side on save.
 */
type Tracker = { track: (url: string) => void; isFresh: (url?: string) => boolean; discard: (url?: string) => Promise<void>; discardAll: () => Promise<void>; commit: () => void };

const Ctx = createContext<Tracker | null>(null);

export async function deleteUpload(url: string) {
  if (!url.startsWith("/api/uploads/")) return;
  await fetch(`/api/upload?url=${encodeURIComponent(url)}`, { method: "DELETE" }).catch(() => {});
}

export function UploadTracker({ children }: { children: React.ReactNode }) {
  const fresh = useRef(new Set<string>());
  const track = useCallback((u: string) => void fresh.current.add(u), []);
  const isFresh = useCallback((u?: string) => Boolean(u && fresh.current.has(u)), []);
  const discard = useCallback(async (u?: string) => {
    if (u && fresh.current.has(u)) {
      fresh.current.delete(u);
      await deleteUpload(u);
    }
  }, []);
  const discardAll = useCallback(async () => {
    const list = [...fresh.current];
    fresh.current.clear();
    await Promise.all(list.map(deleteUpload));
  }, []);
  const commit = useCallback(() => fresh.current.clear(), []);
  return <Ctx.Provider value={{ track, isFresh, discard, discardAll, commit }}>{children}</Ctx.Provider>;
}

export function useUploadTracker(): Tracker {
  return (
    useContext(Ctx) ?? {
      track: () => {},
      isFresh: () => false,
      discard: async () => {},
      discardAll: async () => {},
      commit: () => {},
    }
  );
}
