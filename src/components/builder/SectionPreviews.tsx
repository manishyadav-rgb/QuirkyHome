/**
 * Builder Canvas Section Components
 * 
 * Each component renders a storefront section using
 * CSS variables from the theme for consistent styling.
 */

import React, { useState, useEffect } from "react";
import type { Section } from "@/lib/builder/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ─── HeroBanner ───────────────────────────────────────────── */

export function HeroBannerPreview({ settings }: { settings: Section["settings"] }) {
  const h = settings.height === "100vh" ? "100vh" : `${settings.height}px`;
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ height: h, minHeight: 200 }}
    >
      {settings.imageUrl ? (
        <img src={settings.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--color-primary), var(--color-secondary))" }} />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: `rgba(0,0,0,${(settings.overlayOpacity || 40) / 100})` }} />
      <div className="relative z-10 px-6 py-12" style={{ textAlign: settings.textAlign || "center", maxWidth: "var(--container-max)" }}>
        <h1
          className="text-white drop-shadow-lg"
          style={{ fontSize: "clamp(28px, 5vw, 56px)", fontWeight: "var(--heading-weight)", fontFamily: "var(--heading-family)" }}
        >
          {settings.heading || "Hero Heading"}
        </h1>
        {settings.subheading && (
          <p className="mt-3 text-lg text-white/90 drop-shadow" style={{ fontFamily: "var(--font-family)" }}>
            {settings.subheading}
          </p>
        )}
        {settings.buttonText && (
          <button
            className="mt-6 rounded-full px-8 py-3 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {settings.buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── RichText ─────────────────────────────────────────────── */

export function RichTextPreview({ settings }: { settings: Section["settings"] }) {
  return (
    <div
      className="px-6"
      style={{
        backgroundColor: settings.bgColor || "transparent",
        padding: `var(--section-padding) 24px`,
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        textAlign: settings.textAlign || "left",
      }}
    >
      {settings.heading && (
        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 36px)",
            fontWeight: "var(--heading-weight)",
            fontFamily: "var(--heading-family)",
            color: settings.textColor || "var(--color-text)",
            marginBottom: 16,
          }}
        >
          {settings.heading}
        </h2>
      )}
      <div
        style={{
          fontSize: "var(--base-size)",
          lineHeight: 1.7,
          fontFamily: "var(--font-family)",
          color: settings.textColor || "var(--color-text-muted)",
          whiteSpace: "pre-wrap",
        }}
      >
        {settings.content}
      </div>
    </div>
  );
}

/* ─── ImageWithText ────────────────────────────────────────── */

export function ImageWithTextPreview({ settings }: { settings: Section["settings"] }) {
  const isLeft = settings.imagePosition !== "right";
  return (
    <div
      className="grid gap-8 px-6 md:grid-cols-2 md:items-center"
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: `var(--section-padding) 24px`,
        direction: isLeft ? "ltr" : "rtl",
      }}
    >
      <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gray-100" style={{ borderRadius: "var(--radius)" }}>
        {settings.imageUrl ? (
          <img src={settings.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">Image Placeholder</div>
        )}
      </div>
      <div style={{ direction: "ltr" }}>
        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: "var(--heading-weight)",
            fontFamily: "var(--heading-family)",
            color: "var(--color-text)",
            marginBottom: 12,
          }}
        >
          {settings.heading}
        </h2>
        <p style={{ fontSize: "var(--base-size)", lineHeight: 1.7, color: "var(--color-text-muted)", fontFamily: "var(--font-family)" }}>
          {settings.content}
        </p>
        {settings.buttonText && (
          <button
            className="mt-5 rounded-md px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {settings.buttonText}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── FeaturedCollection ───────────────────────────────────── */

export function FeaturedCollectionPreview({ settings }: { settings: Section["settings"] }) {
  const cols = parseInt(settings.columns) || 4;
  const limit = settings.limit || 4;
  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: `var(--section-padding) 24px` }}>
      <div className="mb-6 text-center">
        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: "var(--heading-weight)",
            fontFamily: "var(--heading-family)",
            color: "var(--color-text)",
          }}
        >
          {settings.heading}
        </h2>
        {settings.subheading && (
          <p className="mt-2" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-family)" }}>
            {settings.subheading}
          </p>
        )}
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius)" }}>
            <div className="aspect-square bg-gray-100">
              <div className="flex h-full items-center justify-center text-xs text-gray-300">Product {i + 1}</div>
            </div>
            <div className="p-3">
              <div className="h-3 w-3/4 rounded bg-gray-200" />
              <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ProductGrid ──────────────────────────────────────────── */

export function ProductGridPreview({ settings }: { settings: Section["settings"] }) {
  const cols = parseInt(settings.columns) || 4;
  const limit = settings.limit || 8;
  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: `var(--section-padding) 24px` }}>
      {settings.heading && (
        <h2
          className="mb-6"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: "var(--heading-weight)",
            fontFamily: "var(--heading-family)",
            color: "var(--color-text)",
          }}
        >
          {settings.heading}
        </h2>
      )}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: limit }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "var(--color-border)", borderRadius: "var(--radius)" }}>
            <div className="aspect-square bg-gray-50">
              <div className="flex h-full items-center justify-center text-xs text-gray-300">Product</div>
            </div>
            <div className="space-y-1.5 p-3">
              <div className="h-3 w-3/4 rounded bg-gray-200" />
              {settings.showPrice && <div className="h-3 w-1/3 rounded" style={{ backgroundColor: "var(--color-primary)", opacity: 0.3 }} />}
              {settings.showRating && (
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => <span key={s} className="text-[10px]" style={{ color: "var(--color-accent)" }}>★</span>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Newsletter ───────────────────────────────────────────── */

export function NewsletterPreview({ settings }: { settings: Section["settings"] }) {
  return (
    <div style={{ backgroundColor: settings.bgColor || "var(--color-surface)", padding: `var(--section-padding) 24px` }}>
      <div className="mx-auto max-w-lg text-center">
        <h2
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: "var(--heading-weight)",
            fontFamily: "var(--heading-family)",
            color: "var(--color-text)",
          }}
        >
          {settings.heading}
        </h2>
        {settings.subheading && (
          <p className="mt-2" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-family)" }}>
            {settings.subheading}
          </p>
        )}
        <div className="mt-5 flex gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 rounded-lg border px-4 py-2.5 text-sm"
            style={{ borderColor: "var(--color-border)", fontFamily: "var(--font-family)" }}
            readOnly
          />
          <button
            className="whitespace-nowrap rounded-lg px-6 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            {settings.buttonText || "Subscribe"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Testimonials ─────────────────────────────────────────── */

export function TestimonialsPreview({ settings }: { settings: Section["settings"] }) {
  const testimonials = [
    { name: settings.testimonial1Name, text: settings.testimonial1Text },
    { name: settings.testimonial2Name, text: settings.testimonial2Text },
    { name: settings.testimonial3Name, text: settings.testimonial3Text },
  ].filter((t) => t.name && t.text);

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: `var(--section-padding) 24px` }}>
      <h2
        className="mb-8 text-center"
        style={{
          fontSize: "clamp(22px, 3vw, 32px)",
          fontWeight: "var(--heading-weight)",
          fontFamily: "var(--heading-family)",
          color: "var(--color-text)",
        }}
      >
        {settings.heading}
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <div
            key={i}
            className="rounded-xl border p-6"
            style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-surface)", borderRadius: "var(--radius)" }}
          >
            <div className="mb-3 text-2xl" style={{ color: "var(--color-primary)" }}>"</div>
            <p className="text-sm" style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-family)", lineHeight: 1.7 }}>
              {t.text}
            </p>
            <p className="mt-4 text-sm font-semibold" style={{ color: "var(--color-text)" }}>— {t.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── BannerStrip ──────────────────────────────────────────── */

export function BannerStripPreview({ settings }: { settings: Section["settings"] }) {
  return (
    <div
      className="px-4 py-2.5 text-center text-sm font-semibold"
      style={{
        backgroundColor: settings.bgColor || "var(--color-primary)",
        color: settings.textColor || "#ffffff",
        fontFamily: "var(--font-family)",
      }}
    >
      {settings.text}
    </div>
  );
}

export function SearchBandPreview({ settings }: { settings: Section["settings"] }) {
  const chips = String(settings.chips || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  return (
    <section className="qh-market-band">
      <div className="qh-container flex flex-wrap items-center gap-3 py-4">
        <span className="text-sm font-black text-text-main">{settings.label || "Search for"}</span>
        {chips.map((chip, i) => (
          <span key={`${chip}-${i}`} className="rounded-full border border-text-main/10 bg-background-elevated px-4 py-2 text-sm font-bold text-text-main shadow-soft">
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
}

export function CategoryGridPreview({ settings }: { settings: Section["settings"] }) {
  const fallbackNames = [
    "Bedding",
    "Furnishing",
    "Organiser",
    "Bath",
    "Gifts",
    "New Arrival",
    "Comforters",
    "Carpet",
    "Return and Exchange",
  ];
  const requestedCount = Number(settings.categoryCount ?? 5);
  const categoryCount = Number.isFinite(requestedCount) ? Math.min(Math.max(requestedCount, 1), 12) : 5;
  const previewNames = Array.from({ length: categoryCount }, (_, idx) => {
    const fallbackName = fallbackNames[idx] || `Category ${idx + 1}`;
    return String(settings[`cat${idx + 1}Text`] || fallbackName);
  });

  return (
    <section className="qh-container py-8 md:py-12">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase text-brand-primary">{settings.eyebrow || "Shop by category"}</p>
        <h2 className="font-display text-3xl font-black text-text-main">{settings.heading || "Home decor, furnishing and essentials"}</h2>
        <p className="mt-3 text-base leading-relaxed text-text-muted">{settings.subheading || ""}</p>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-7 md:grid-cols-5 lg:gap-8">
        {previewNames.map((name, idx) => (
          <div key={`${name}-${idx}`} className="qh-card p-4 text-center text-sm font-semibold text-text-main">
            {name}
          </div>
        ))}
      </div>
    </section>
  );
}

export function CollectionsSectionPreview({ settings }: { settings: Section["settings"] }) {
  return (
    <section className="qh-container qh-section-pad">
      <div className="mb-8">
        <p className="mb-2 text-sm font-bold uppercase text-brand-primary">{settings.eyebrow || "Collections"}</p>
        <h2 className="font-display text-3xl font-black text-text-main">{settings.heading || "Shop by collection"}</h2>
        <p className="mt-3 text-base leading-relaxed text-text-muted">{settings.subheading || ""}</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {["Collection A", "Collection B", "Collection C"].map((name) => (
          <div key={name} className="qh-card p-5">
            <div className="h-24 rounded bg-background-soft" />
            <p className="mt-3 text-base font-bold text-text-main">{name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PromisesSectionPreview({ settings }: { settings: Section["settings"] }) {
  return (
    <section className="qh-container qh-section-pad">
      <div className="mb-8 text-center">
        <p className="mb-2 text-sm font-bold uppercase text-brand-primary">{settings.eyebrow || "Why choose us"}</p>
        <h2 className="font-display text-3xl font-black text-text-main">{settings.heading || "A calmer, warmer way to shop for home"}</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        {["Curated decor", "Premium quality", "Easy returns", "Fast shipping", "Secure payments"].map((t) => (
          <div key={t} className="qh-card p-4 text-center text-sm font-semibold text-text-main">{t}</div>
        ))}
      </div>
    </section>
  );
}

export function SeoArticlePreview({ settings }: { settings: Section["settings"] }) {
  type HeadingTagName = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const allowedTags: HeadingTagName[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const safeHeadingTag = String(settings.headingTag || "");
  const safeSubheadingTag = String(settings.subheadingTag || "");
  const headingTag: HeadingTagName = allowedTags.includes(safeHeadingTag as HeadingTagName) ? (safeHeadingTag as HeadingTagName) : "h2";
  const subheadingTag: HeadingTagName = allowedTags.includes(safeSubheadingTag as HeadingTagName) ? (safeSubheadingTag as HeadingTagName) : "h2";
  const HeadingTag = headingTag;
  const SubheadingTag = subheadingTag;

  if (
    typeof settings.content === "string" &&
    settings.content.includes("<") &&
    settings.content.includes(">")
  ) {
    return (
      <section className="qh-container qh-section-pad">
        <article className="qh-seo-copy max-w-none rounded-lg border border-border bg-background-elevated p-6 md:p-8">
          <div dangerouslySetInnerHTML={{ __html: settings.content || "" }} />
        </article>
      </section>
    );
  }

  return (
    <section className="qh-container qh-section-pad">
      <article className="qh-seo-copy max-w-none rounded-lg border border-border bg-background-elevated p-6 md:p-8">
        {settings.headingText ? <HeadingTag>{String(settings.headingText)}</HeadingTag> : null}
        {settings.content ? <p>{String(settings.content)}</p> : null}
        {settings.subheadingText ? <SubheadingTag>{String(settings.subheadingText)}</SubheadingTag> : null}
        {settings.content2 ? <p>{String(settings.content2)}</p> : null}
      </article>
    </section>
  );
}

/* ─── ImageGrid Preview ────────────────────────────────────── */

export function ImageGridPreview({ settings }: { settings: Section["settings"] }) {
  const gap = settings.gap ?? 12;
  const radius = settings.borderRadius ?? 12;
  const height = settings.desktopHeight ?? 360;

  const uid = `qh-preview-imggrid-${Math.random().toString(36).slice(2, 8)}`;
  const css = `
    .${uid} {
      display: grid;
      grid-template-columns: 2fr 1fr;
      grid-template-rows: repeat(2, ${Math.round(height / 2)}px);
      gap: ${gap}px;
      height: ${height}px;
    }
    .${uid} > div {
      height: 100%;
      width: 100%;
    }
    .${uid} .qh-ig-large {
      grid-row: 1 / 3;
    }

    @container (max-width: 767px) {
      .${uid} {
        grid-template-columns: repeat(2, 1fr) !important;
        grid-template-rows: auto auto !important;
        height: auto !important;
        gap: ${gap}px !important;
      }
      .${uid} > div {
        height: 160px !important;
      }
      .${uid} .qh-ig-large {
        grid-column: span 2 !important;
        grid-row: auto !important;
        height: 240px !important;
      }
    }
  `;

  const renderSlot = (imageUrl: string, alt: string, placeholder: string) => (
    <div
      className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 h-full w-full"
      style={{ borderRadius: `${radius}px` }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={alt || ""} className="absolute inset-0 h-full w-full object-cover" style={{ borderRadius: `${radius}px` }} />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
          <span className="text-xs font-medium">{placeholder}</span>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "16px 24px" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={uid}>
        <div className="qh-ig-large">
          {renderSlot(settings.image1Url, settings.image1Alt, "Image 1 (Large — Left)")}
        </div>
        <div>
          {renderSlot(settings.image2Url, settings.image2Alt, "Image 2 (Top Right)")}
        </div>
        <div>
          {renderSlot(settings.image3Url, settings.image3Alt, "Image 3 (Bottom Right)")}
        </div>
      </div>
    </div>
  );
}

/* ─── ImageBanner Preview ──────────────────────────────────── */

export function ImageBannerPreview({ settings }: { settings: Section["settings"] }) {
  const height = settings.desktopHeight ?? 280;
  const radius = settings.borderRadius ?? 12;
  const fullWidth = settings.fullWidth ?? false;
  const imageUrl = settings.desktopImageUrl || settings.imageUrl || "";

  return (
    <div style={{ maxWidth: fullWidth ? "100%" : "var(--container-max)", margin: "0 auto", padding: fullWidth ? "0" : "16px 24px" }}>
      <div
        className="relative overflow-hidden bg-gradient-to-r from-gray-100 to-gray-200"
        style={{
          height: `${height}px`,
          borderRadius: fullWidth ? "0" : `${radius}px`,
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={settings.altText || ""} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <span className="text-sm font-medium">Upload a banner image</span>
            <span className="text-xs text-gray-300">Recommended: 1920 × {height}px</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── ReelImage Preview ────────────────────────────────────── */

export function ReelImagePreview({ settings }: { settings: Section["settings"] }) {
  const cardH = settings.cardHeight ?? 380;
  const gap = settings.gap ?? 16;
  const radius = settings.borderRadius ?? 16;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Collect reel items
  const reels: { image: string; text: string }[] = [];
  for (let i = 1; i <= 8; i++) {
    const img = settings[`reel${i}Image`];
    if (img) reels.push({ image: img, text: settings[`reel${i}Text`] || "" });
  }

  useEffect(() => {
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

  const hasItems = reels.length > 0;
  const displayItems = hasItems ? reels : Array.from({ length: 4 }).map((_, i) => ({
    image: "",
    text: `Reel ${i + 1}`,
  }));

  return (
    <div className="relative w-full overflow-hidden" style={{ paddingTop: "8px", paddingBottom: "8px" }}>
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
          {displayItems.map((reel, i) => {
            const inner = (
              <div
                className="relative overflow-hidden group shadow-md w-full"
                style={{
                  height: `${cardH}px`,
                  borderRadius: `${radius}px`,
                }}
              >
                {reel.image ? (
                  <img
                    src={reel.image}
                    alt={reel.text || ""}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ borderRadius: `${radius}px` }}
                  />
                ) : (
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2"
                    style={{ borderRadius: `${radius}px` }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    <span className="text-xs font-medium">{reel.text}</span>
                  </div>
                )}
                {reel.text && reel.image && (
                  <div
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-4 pt-10 flex items-end justify-center text-center"
                    style={{ borderRadius: `0 0 ${radius}px ${radius}px` }}
                  >
                    <p className="text-sm font-semibold text-white leading-tight drop-shadow-sm">{reel.text}</p>
                  </div>
                )}
              </div>
            );

            return (
              <div
                key={i}
                style={{
                  width: "50%",
                  flexShrink: 0,
                  scrollSnapAlign: "center",
                }}
              >
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Component Map ────────────────────────────────────────── */

export const sectionComponentMap: Record<string, React.FC<{ settings: Section["settings"] }>> = {
  HeroBanner: HeroBannerPreview,
  SearchBand: SearchBandPreview,
  CategoryGrid: CategoryGridPreview,
  CollectionsSection: CollectionsSectionPreview,
  RichText: RichTextPreview,
  ImageWithText: ImageWithTextPreview,
  FeaturedCollection: FeaturedCollectionPreview,
  ProductGrid: ProductGridPreview,
  PromisesSection: PromisesSectionPreview,
  Newsletter: NewsletterPreview,
  SeoArticle: SeoArticlePreview,
  Testimonials: TestimonialsPreview,
  BannerStrip: BannerStripPreview,
  ImageGrid: ImageGridPreview,
  ImageBanner: ImageBannerPreview,
  ReelImage: ReelImagePreview,
};
