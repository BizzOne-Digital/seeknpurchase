"use client";

import { useEffect, useState, type ReactNode } from "react";
import { getImageProps } from "next/image";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { SmartImage } from "@/components/ui/SmartImage";
import type { Locale } from "@/lib/i18n/dictionaries";

const SLIDE_COUNT = 4;

export function HeroCarousel({ desktopImage, locale, panels }: {
  desktopImage: string;
  locale: Locale;
  panels: ReactNode[]; // one text block per slide
}) {
  const es = locale === "es";
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(true);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setVisible(!document.hidden);
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const rotating = !paused && !hovered && !focused && visible && !reducedMotion;
  useEffect(() => {
    if (!rotating) return;
    const timer = window.setTimeout(() => setActive((slide) => (slide + 1) % SLIDE_COUNT), 3000);
    return () => window.clearTimeout(timer);
  }, [active, rotating]);

  const slides = [
    {
      desktop: desktopImage,
      mobile: "/images/hero/mobile-hero-theme.webp",
      alt: es ? "Camiseta personalizada, sudadera azul marino, bolsa, taza y gorra" : "Custom ivory T-shirt, navy hoodie, personalized tote, mug and cap",
    },
    {
      desktop: "/images/hero/western-hats-desktop.webp",
      mobile: "/images/hero/western-hats-mobile.webp",
      alt: es ? "Sombreros vaqueros de fieltro y cuero sobre una caja de madera" : "Felt and leather western hats on a wooden crate",
    },
    {
      desktop: "/images/hero/summer-hats-desktop.webp",
      mobile: "/images/hero/summer-hats-mobile.webp",
      alt: es ? "Sombreros de paja de verano, sombrero de pescador y gafas de sol" : "Straw summer hats, bucket hat and sunglasses",
    },
    {
      desktop: "/images/hero/sportswear-desktop.webp",
      mobile: "/images/hero/sportswear-mobile.webp",
      alt: es ? "Uniforme deportivo negro y lima, camiseta blanca, balón y botella" : "Black and lime team jersey and shorts, white jersey, soccer ball and bottle",
    },
  ];
  const buttonClass = "flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-navy/10";

  return (
    <section
      className="relative isolate aspect-[3/5] min-h-[680px] w-full overflow-hidden bg-cream text-navy sm:aspect-auto sm:min-h-0"
      aria-labelledby="hero-heading"
      aria-roledescription={es ? "carrusel" : "carousel"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <div className="absolute inset-0" aria-live={rotating ? "off" : "polite"} aria-atomic="true">
        {slides.map((slide, index) => {
          const { props: mobile } = getImageProps({ src: slide.mobile, alt: "", fill: true, sizes: "100vw" });
          return (
            <div
              key={slide.mobile}
              role="group"
              aria-roledescription={es ? "diapositiva" : "slide"}
              aria-label={`${index + 1} / ${SLIDE_COUNT}`}
              aria-hidden={index !== active}
              className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${index === active ? "opacity-100" : "pointer-events-none opacity-0"}`}
            >
              <picture>
                <source media="(max-width: 639px)" srcSet={mobile.srcSet} sizes={mobile.sizes} />
                <SmartImage
                  src={slide.desktop}
                  alt={slide.alt}
                  fill
                  loading="eager"
                  fetchPriority={index === 0 ? "high" : "low"}
                  sizes="100vw"
                  className="object-contain object-bottom sm:object-cover sm:object-center"
                />
              </picture>
            </div>
          );
        })}
      </div>
      <div className="absolute inset-y-0 left-0 hidden w-[60%] bg-gradient-to-r from-cream via-cream/90 to-transparent sm:block lg:w-[45%] lg:via-cream/50" />
      {/* All text panels share one grid cell so the height stays steady; only the active one is visible. */}
      <div className="relative grid">
        {panels.map((panel, index) => (
          <div key={index} aria-hidden={index !== active} className={`[grid-area:1/1] transition-opacity duration-700 motion-reduce:transition-none ${index === active ? "opacity-100" : "pointer-events-none invisible opacity-0"}`}>
            {panel}
          </div>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center sm:bottom-4">
        <div role="group" aria-label={es ? "Controles del carrusel" : "Hero slideshow controls"} className="flex items-center gap-1 rounded-full border border-navy/10 bg-cream/95 px-1.5 py-0.5 shadow-sm backdrop-blur-sm">
          <button type="button" aria-label={es ? "Diapositiva anterior" : "Previous slide"} className={buttonClass} onClick={() => setActive((slide) => (slide + SLIDE_COUNT - 1) % SLIDE_COUNT)}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          {slides.map((slide, index) => (
            <button key={slide.mobile} type="button" aria-label={es ? `Ir a diapositiva ${index + 1}` : `Go to slide ${index + 1}`} aria-current={active === index ? "true" : undefined} onClick={() => setActive(index)} className="flex h-10 w-8 items-center justify-center rounded-full">
              <span className={`h-2 rounded-full transition-all motion-reduce:transition-none ${active === index ? "w-5 bg-gold-600" : "w-2 bg-navy/25"}`} />
            </button>
          ))}
          <button type="button" aria-label={es ? "Siguiente diapositiva" : "Next slide"} className={buttonClass} onClick={() => setActive((slide) => (slide + 1) % SLIDE_COUNT)}>
            <ChevronRight className="h-4 w-4" />
          </button>
          {!reducedMotion && <button type="button" aria-label={paused ? (es ? "Reproducir carrusel" : "Play slideshow") : (es ? "Pausar carrusel" : "Pause slideshow")} className={buttonClass} onClick={() => setPaused((value) => !value)}>
            {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
          </button>}
        </div>
      </div>
    </section>
  );
}
