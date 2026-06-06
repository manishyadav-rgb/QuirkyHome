"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Settings = Record<string, any>;

export function StorefrontSlideBanner({ settings }: { settings: Settings }) {
  const slides = Array.from({ length: 15 }, (_, i) => {
    const n = i + 1;
    return { image: settings[`slide${n}Image`] || "", alt: settings[`slide${n}Alt`] || "" };
  }).filter((s) => s.image);

  const activeSlides = slides.length ? slides : [{ image: "", alt: "" }];
  const [index, setIndex] = useState(0);

  const autoPlay = settings.autoPlay !== false;
  const intervalMs = Math.max(2, Number(settings.intervalSec || 4)) * 1000;
  const radius = Math.max(0, Number(settings.radius || 16));
  const mobileHeight = Math.max(80, Number(settings.heightMobile || 220));
  const desktopHeight = Math.max(120, Number(settings.heightDesktop || 360));
  const fullWidth = settings.sectionFullWidth === true;
  const mobileAutoHeight = settings.mobileAutoHeight !== false;
  const desktopAutoHeight = settings.desktopAutoHeight !== false;
  const mobileFit = settings.fitMobile === "cover" ? "cover" : "contain";
  const desktopFit = settings.fitDesktop === "cover" ? "cover" : "contain";

  useEffect(() => {
    if (!autoPlay || activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % activeSlides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [autoPlay, intervalMs, activeSlides.length]);

  return (
    <section className={`${fullWidth ? "w-full" : "qh-container"} qh-section-pad`}>
      {settings.heading ? <h3 className="mb-3 text-sm font-bold text-text-main md:text-base">{settings.heading}</h3> : null}
      <div className="relative overflow-hidden" style={{ borderRadius: fullWidth ? "0" : `${radius}px` }}>
        <div className="md:hidden" style={mobileAutoHeight ? {} : { height: `${mobileHeight}px` }}>
          {activeSlides[index].image ? (
            <img
              src={activeSlides[index].image}
              alt={activeSlides[index].alt}
              className={mobileAutoHeight ? `block w-full h-auto object-${mobileFit}` : `h-full w-full object-${mobileFit}`}
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center bg-background-soft text-sm text-text-muted">Slide image</div>
          )}
        </div>
        <div className="hidden bg-black/10 md:block" style={desktopAutoHeight ? {} : { height: `${desktopHeight}px` }}>
          {activeSlides[index].image ? (
            <img
              src={activeSlides[index].image}
              alt={activeSlides[index].alt}
              className={desktopAutoHeight ? `block w-full h-auto object-${desktopFit}` : `h-full w-full object-${desktopFit}`}
            />
          ) : (
            <div className="flex h-full min-h-[200px] items-center justify-center bg-background-soft text-sm text-text-muted">Slide image</div>
          )}
        </div>
        {activeSlides.length > 1 && (
          <>
            <button
              type="button"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/20 hover:bg-black/45 h-8 w-8 flex items-center justify-center text-white border border-white/20 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 z-10"
              onClick={() => setIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/20 hover:bg-black/45 h-8 w-8 flex items-center justify-center text-white border border-white/20 shadow-md backdrop-blur-md transition-all duration-300 hover:scale-110 z-10"
              onClick={() => setIndex((prev) => (prev + 1) % activeSlides.length)}
              aria-label="Next slide"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
