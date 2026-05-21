"use client";

import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function StorefrontReelImage({ settings }: { settings: Record<string, any> }) {
  const cardH = settings.cardHeight ?? 380;
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
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

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

    const cardWidth = container.clientWidth * 0.5;
    const scrollAmount = direction === "left" ? -(cardWidth + gap) : (cardWidth + gap);
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollContainerCss = `
    .qh-reel-scroll::-webkit-scrollbar { display: none; }
    .qh-reel-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  return (
    <section className="relative w-full overflow-hidden" style={{ paddingTop: "8px", paddingBottom: "8px" }}>
      {settings.heading && <h2 className="mb-4 text-center font-display text-2xl font-black text-text-main">{settings.heading}</h2>}
      <style dangerouslySetInnerHTML={{ __html: scrollContainerCss }} />
      
      <div className="relative group/arrows max-w-4xl mx-auto px-4 md:px-8">
        {/* Left Arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 dark:bg-black/95 text-text-main shadow-md hover:shadow-lg transition-all duration-200 border border-border/40 hover:scale-105 active:scale-95"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 stroke-[2.5]" />
          </button>
        )}

        {/* Right Arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 dark:bg-black/95 text-text-main shadow-md hover:shadow-lg transition-all duration-200 border border-border/40 hover:scale-105 active:scale-95"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 stroke-[2.5]" />
          </button>
        )}

        <div
          ref={containerRef}
          className="qh-reel-scroll"
          style={{
            display: "flex",
            gap: `${gap}px`,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            paddingBottom: "8px",
            paddingLeft: "25%",
            paddingRight: "25%",
            scrollPadding: "0 25%",
          }}
        >
          {reels.map((reel, i) => {
            const inner = (
              <div
                className="relative overflow-hidden group shadow-md"
                style={{
                  width: "100%",
                  height: `${cardH}px`,
                  borderRadius: `${radius}px`,
                }}
              >
                <img
                  src={reel.image}
                  alt={reel.text || ""}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ borderRadius: `${radius}px` }}
                />
                {reel.text && (
                  <div
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-4 pt-10 flex items-end justify-center text-center"
                    style={{ borderRadius: `0 0 ${radius}px ${radius}px` }}
                  >
                    <p className="text-sm font-semibold text-white leading-tight drop-shadow-sm">{reel.text}</p>
                  </div>
                )}
              </div>
            );

            const cardStyle: React.CSSProperties = {
              width: "50%",
              flexShrink: 0,
              scrollSnapAlign: "center",
            };

            if (reel.link && reel.link !== "#") {
              return (
                <Link key={i} href={reel.link} className="block animate-fade-in" style={cardStyle}>
                  {inner}
                </Link>
              );
            }
            return (
              <div key={i} className="animate-fade-in" style={cardStyle}>
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
