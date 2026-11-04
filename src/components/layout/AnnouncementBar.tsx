"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Tag } from "lucide-react";

export function AnnouncementBar({ messages }: { messages: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (messages.length < 2) return;
    const id = setInterval(() => setI((x) => (x + 1) % messages.length), 4500);
    return () => clearInterval(id);
  }, [messages.length]);
  if (!messages.length) return null;
  return (
    <div className="bg-navy text-white">
      <Link href="/pricing" className="container flex h-9 items-center justify-center gap-2 text-xs font-medium tracking-wide sm:text-[13px]">
        <Tag className="h-3.5 w-3.5 text-gold-100" strokeWidth={1.75} />
        <span key={i} className="animate-fade-in" aria-live="polite">{messages[i]}</span>
        <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
