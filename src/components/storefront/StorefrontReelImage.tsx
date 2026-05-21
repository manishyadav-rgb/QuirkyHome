"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function StorefrontReelImage({ settings }: { settings: Record<string, any> }) {
  const cardH = settings.cardHeight ?? 400;
  const gap = settings.gap ?? 16;
  const radius = settings.borderRadius ?? 16;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const reels: { image: string; link: string; text: string }[] = [];
  for (let i = 1; i <= 8; i++) {
    const img = settings[`reel${i}Image`];
    if (img) reels.push({ image: img, link: settings[`reel${i}Link`] || "/", text: settings[`reel${i}Text`] || "" });
  }

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    // Re-check after images load
    const timer = setTimeout(handleScroll, 500);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, [reels.length]);

  if (reels.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;
    
    // Scroll by about one visible viewport width minus one card to keep context
    const scrollAmount = direction === "left" ? -container.clientWidth * 0.75 : container.clientWidth * 0.75;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollContainerCss = `
    .qh-reel-scroll::-webkit-scrollbar { display: none; }
    .qh-reel-scroll { -ms-overflow-style: none; scrollbar-width: none; }
    
    @media (max-width: 768px) {
      .qh-reel-card {
        height: ${Math.min(cardH, 320)}px !important;
      }
    }
  `;

  return (
    <section className="relative w-full overflow-hidden py-10 md:py-16">
      {settings.heading && (
        <div className="mb-8 text-center px-4">
          <h2 className="font-display text-3xl font-black tracking-tight text-text-main md:text-4xl">{settings.heading}</h2>
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: scrollContainerCss }} />
      
      <div className="relative group/arrows w-full">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-background-elevated text-text-main shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all hover:scale-105 border border-border/50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2]" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-background-elevated text-text-main shadow-[0_4px_20px_rgba(0,0,0,0.15)] transition-all hover:scale-105 border border-border/50"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 stroke-[2]" />
          </button>
        )}

        <div
          ref={containerRef}
          className="qh-reel-scroll flex overflow-x-auto snap-x snap-mandatory px-4 md:px-12"
          style={{ gap: `${gap}px` }}
        >
          {reels.map((reel, i) => {
            const inner = (
              <div
                className="qh-reel-card relative overflow-hidden group/card bg-gray-100 shadow-sm transition-shadow hover:shadow-lg"
                style={{
                  height: `${cardH}px`,
                  aspectRatio: "9/16",
                  borderRadius: `${radius}px`,
                }}
              >
                <img
                  src={reel.image}
                  alt={reel.text || ""}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover/card:opacity-100" />
                {reel.text && (
                  <div className="absolute inset-x-0 bottom-0 p-4 pb-6 text-center transform transition-transform duration-300 group-hover/card:-translate-y-1">
                    <p className="text-base md:text-lg font-bold text-white drop-shadow-md">{reel.text}</p>
                  </div>
                )}
              </div>
            );

            if (reel.link && reel.link !== "#") {
              return (
                <Link key={i} href={reel.link} className="shrink-0 snap-start block animate-fade-in outline-none focus-visible:ring-2 focus-visible:ring-brand-primary rounded-[inherit]">
                  {inner}
                </Link>
              );
            }
            return (
              <div key={i} className="shrink-0 snap-start animate-fade-in">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
