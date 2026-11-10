"use client";

import { useState } from "react";
import { SmartImage } from "@/components/ui/SmartImage";
import { cn } from "@/lib/utils";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [i, setI] = useState(0);
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:items-start">
      {images.length > 1 && (
        <ul className="no-scrollbar flex gap-3 overflow-x-auto md:w-20 md:flex-col md:overflow-visible" aria-label="Product images">
          {images.map((src, idx) => (
            <li key={src + idx}>
              <button
                type="button"
                onClick={() => setI(idx)}
                aria-label={`Show image ${idx + 1}`}
                aria-current={i === idx}
                className={cn("relative block h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 bg-cream transition", i === idx ? "border-gold" : "border-transparent hover:border-line")}
              >
                <SmartImage src={src} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="group relative aspect-square flex-1 overflow-hidden rounded-xl bg-cream">
        <SmartImage
          key={images[i]}
          src={images[i]}
          alt={`${title} — image ${i + 1}`}
          fill
          priority
          sizes="(max-width:1024px) 100vw, 50vw"
          className="animate-fade-in object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
    </div>
  );
}
