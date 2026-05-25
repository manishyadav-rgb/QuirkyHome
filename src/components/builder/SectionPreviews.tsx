/**
 * Builder Canvas Section Components
 * 
 * Each component renders a storefront section using
 * CSS variables from the theme for consistent styling.
 */

import React, { useState, useEffect } from "react";
import type { Section } from "@/lib/builder/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* â”€â”€â”€ HeroBanner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

/* â”€â”€â”€ RichText â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function RichTextPreview({ settings }: { settings: Section["settings"] }) {
  const headingAlign = settings.headingAlign === "center" || settings.headingAlign === "right" || settings.headingAlign === "left"
    ? settings.headingAlign
    : (settings.textAlign === "center" || settings.textAlign === "right" ? settings.textAlign : "left");
  const contentAlign = settings.contentAlign === "center" || settings.contentAlign === "right" || settings.contentAlign === "left"
    ? settings.contentAlign
    : (settings.textAlign === "center" || settings.textAlign === "right" ? settings.textAlign : "left");
  const headingSize = settings.headingSize === "small" ? "1.15rem" : settings.headingSize === "large" ? "1.8rem" : "1.45rem";
  const contentSize = settings.contentSize === "small" ? "0.92rem" : settings.contentSize === "large" ? "1.08rem" : "1rem";
  return (
    <div
      className="px-6"
      style={{
        backgroundColor: settings.bgColor || "transparent",
        padding: `var(--section-padding) 24px`,
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        textAlign: "left",
      }}
    >
      {settings.heading && (
        <h2
          style={{
            fontSize: headingSize,
            fontWeight: "var(--heading-weight)",
            fontFamily: "var(--heading-family)",
            color: settings.textColor || "var(--color-text)",
            marginBottom: 16,
            lineHeight: 1.2,
            textAlign: headingAlign,
          }}
        >
          {settings.heading}
        </h2>
      )}
      <div
        className="qh-seo-copy max-w-none"
        style={{
          fontSize: contentSize,
          lineHeight: 1.7,
          fontFamily: "var(--font-family)",
          color: settings.textColor || "var(--color-text-muted)",
          textAlign: contentAlign,
        }}
        dangerouslySetInnerHTML={{ __html: settings.content || "" }}
      />
    </div>
  );
}

/* â”€â”€â”€ ImageWithText â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

/* â”€â”€â”€ FeaturedCollection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

/* â”€â”€â”€ ProductGrid â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
                  {[1,2,3,4,5].map((s) => <span key={s} className="text-[10px]" style={{ color: "var(--color-accent)" }}>â˜…</span>)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* â”€â”€â”€ Newsletter â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

/* â”€â”€â”€ Testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
            <p className="mt-4 text-sm font-semibold" style={{ color: "var(--color-text)" }}>â€” {t.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* â”€â”€â”€ BannerStrip â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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

/* â”€â”€â”€ ImageGrid Preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
          {renderSlot(settings.image1Url, settings.image1Alt, "Image 1 (Large â€” Left)")}
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

/* â”€â”€â”€ ImageBanner Preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function FiveGridPreview({ settings }: { settings: Section["settings"] }) {
  const gap = Number(settings.gap ?? 16);
  const radius = Number(settings.radius ?? 22);
  const uid = `qh-preview-fivegrid-${Math.random().toString(36).slice(2, 8)}`;

  const css = `
    .${uid} { display: grid; gap: ${gap}px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .${uid} .fg-item { position: relative; min-height: 140px; overflow: hidden; }
    .${uid} .fg-item-3, .${uid} .fg-item-5 { grid-column: 1 / -1; min-height: 170px; }
    .${uid} .fg-item-2 { display: none; }
    .${uid} .fg-overlay { position: absolute; inset: 0; z-index: 1; background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 56%, transparent 100%); }
    .${uid} .fg-copy { position: absolute; left: 0; right: 0; bottom: 0; z-index: 2; padding: 14px; }
    .${uid} .fg-copy.right { text-align: right; }
    .${uid} .fg-title { color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.3px; line-height: 1.25; text-transform: uppercase; margin-bottom: 3px; }
    .${uid} .fg-off { color: #f2f2f2; font-size: 10px; margin-bottom: 8px; }
    .${uid} .fg-btn { display: inline-flex; align-items: center; justify-content: center; border-radius: 4px; background: #fff; color: #111; font-size: 10px; font-weight: 700; padding: 5px 12px; }
    @media (min-width: 1024px) {
      .${uid} {
        grid-template-columns: 1.1fr 1fr 1fr;
        grid-template-rows: repeat(2, minmax(220px, 1fr));
      }
      .${uid} .fg-item { min-height: 220px; }
      .${uid} .fg-item-2 { display: block; }
      .${uid} .fg-item-1 { grid-row: 1 / 3; grid-column: 1 / 2; min-height: 100%; }
      .${uid} .fg-item-2 { grid-row: 1 / 2; grid-column: 2 / 3; }
      .${uid} .fg-item-3 { grid-row: 1 / 2; grid-column: 3 / 4; }
      .${uid} .fg-item-4 { grid-row: 2 / 3; grid-column: 2 / 3; }
      .${uid} .fg-item-5 { grid-row: 2 / 3; grid-column: 3 / 4; }
      .${uid} .fg-title { font-size: 14px; }
      .${uid} .fg-off { font-size: 11px; }
      .${uid} .fg-btn { font-size: 11px; padding: 6px 14px; }
      .${uid} .fg-item-1 .fg-copy { padding: 18px; }
      .${uid} .fg-item-1 .fg-title { font-size: 22px; line-height: 1.2; }
      .${uid} .fg-item-1 .fg-off { font-size: 14px; }
      .${uid} .fg-item-1 .fg-btn { padding: 8px 20px; font-size: 12px; }
    }
  `;

  const items = [1, 2, 3, 4, 5].map((n) => ({
    key: n,
    image: settings[`image${n}Url`],
    alt: settings[`image${n}Alt`] || `Grid image ${n}`,
    title: settings[`image${n}Title`] || `Image ${n}`,
    offer: settings[`image${n}Offer`] || "",
    cta: settings[`image${n}Cta`] || "Shop Now",
    textAlign: settings[`image${n}TextAlign`] === "right" ? "right" : "left",
  }));

  return (
    <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "16px 24px" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={uid}>
        {items.map((item) => (
          <div
            key={item.key}
            className={`fg-item fg-item-${item.key} relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`}
            style={{ borderRadius: `${radius}px` }}
          >
            {item.image ? (
              <img src={item.image} alt={item.alt} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">Image {item.key}</div>
            )}
            <div className="fg-overlay" />
            <div className={`fg-copy ${item.textAlign === "right" ? "right" : ""}`}>
              <p className="fg-title">{item.title}</p>
              {item.offer ? <p className="fg-off">{item.offer}</p> : null}
              <span className="fg-btn">{item.cta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
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
            <span className="text-xs text-gray-300">Recommended: 1920 Ã— {height}px</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* â”€â”€â”€ ReelImage Preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

export function SlideBannerPreview({ settings }: { settings: Section["settings"] }) {
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
  const mobileImageClass = mobileAutoHeight ? `block w-full h-auto object-${mobileFit}` : `h-full w-full object-${mobileFit}`;
  const desktopImageClass = desktopAutoHeight ? `block w-full h-auto object-${desktopFit}` : `h-full w-full object-${desktopFit}`;

  useEffect(() => {
    if (!autoPlay || activeSlides.length <= 1) return;
    const timer = setInterval(() => setIndex((prev) => (prev + 1) % activeSlides.length), intervalMs);
    return () => clearInterval(timer);
  }, [autoPlay, intervalMs, activeSlides.length]);

  return (
    <section className={`${fullWidth ? "w-full" : "qh-container"} qh-section-pad`}>
      {settings.heading ? <h3 className="mb-3 text-sm font-bold text-text-main md:text-base">{settings.heading}</h3> : null}
      <div className="relative overflow-hidden" style={{ borderRadius: fullWidth ? "0" : `${radius}px` }}>
        <div className="md:hidden" style={mobileAutoHeight ? {} : { height: `${mobileHeight}px` }}>
          {activeSlides[index].image ? <img src={activeSlides[index].image} alt={activeSlides[index].alt} className={mobileImageClass} /> : <div className="flex h-full min-h-[120px] items-center justify-center bg-background-soft text-sm text-text-muted">Slide image</div>}
        </div>
        <div style={desktopAutoHeight ? {} : { height: `${desktopHeight}px` }} className="hidden md:block bg-black/10">
          {activeSlides[index].image ? <img src={activeSlides[index].image} alt={activeSlides[index].alt} className={desktopImageClass} /> : <div className="flex h-full min-h-[200px] items-center justify-center bg-background-soft text-sm text-text-muted">Slide image</div>}
        </div>
        {activeSlides.length > 1 && (
          <>
            <button className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-transparent p-1.5 text-white" onClick={() => setIndex((prev) => (prev - 1 + activeSlides.length) % activeSlides.length)}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/70 bg-transparent p-1.5 text-white" onClick={() => setIndex((prev) => (prev + 1) % activeSlides.length)}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}

export function SaleBannerPreview({ settings }: { settings: Section["settings"] }) {
  const endTime = new Date(settings.endDateTime || "").getTime();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, endTime - now);
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const radius = Math.max(0, Number(settings.radius || 20));

  return (
    <section className="qh-container qh-section-pad">
      <div className="overflow-hidden p-5 md:p-7" style={{ borderRadius: `${radius}px`, background: `linear-gradient(120deg, ${settings.bgFrom || "#1b1f3b"}, ${settings.bgTo || "#ff6a3d"})`, color: settings.textColor || "#fff" }}>
        <h3 className="text-lg font-black md:text-2xl">{settings.title || "Mega Sale Ends Soon"}</h3>
        <p className="mt-1 text-xs md:text-sm">{settings.subtitle || "Grab your favorites before the timer runs out"}</p>
        <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
          {[{ l: "D", v: days }, { l: "H", v: hours }, { l: "M", v: mins }, { l: "S", v: secs }].map((item) => (
            <div key={item.l} className="rounded-lg bg-white/15 px-2 py-2 text-center backdrop-blur">
              <div className="text-base font-black md:text-2xl">{String(item.v).padStart(2, "0")}</div>
              <div className="text-[10px] font-bold">{item.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NewArrivalPreview({ settings }: { settings: Section["settings"] }) {
  type Item = { icon: string; label: string };
  type Group = { tab: string; items: Item[] };
  const parse = (raw: any, fallback: Group[]): Group[] => {
    try {
      const p = JSON.parse(String(raw || "[]"));
      if (Array.isArray(p) && p.length) {
        return p
          .map((g: any) => ({
            tab: String(g?.tab || ""),
            items: Array.isArray(g?.items)
              ? g.items.map((it: any) => ({ icon: String(it?.icon || "*"), label: String(it?.label || "Item") }))
              : [],
          }))
          .filter((g: Group) => g.tab);
      }
    } catch {}
    return fallback;
  };

  const accessory = parse(settings.accessoryDataJson, [{ tab: "Wall Decor", items: [{ icon: "*", label: "Canvas Art" }, { icon: "*", label: "Mirrors" }] }]);
  const furniture = parse(settings.furnitureDataJson, [{ tab: "Sofas & Seating", items: [{ icon: "*", label: "3-Seater Sofa" }, { icon: "*", label: "Recliners" }] }]);
  const [cat, setCat] = useState<"accessory" | "furniture">("accessory");
  const data = cat === "accessory" ? accessory : furniture;
  const [tab, setTab] = useState(0);
  const active = data[Math.min(tab, Math.max(0, data.length - 1))] || { tab: "", items: [] as Item[] };

  const c = {
    sectionBg: "#f8f1e4",
    cardBg: "#ffffff",
    title: "#2d2417",
    subtitle: "#7c6540",
    accent: "#D4B483",
    badgeText: "#ffffff",
    tabText: "#9f8254",
    tabActiveText: "#8a6636",
    tabUnderline: "#D4B483",
    tabBorder: "#eadcc3",
    itemCardBg: "#fdf8ef",
    itemCardBorder: "#ecdcbf",
    itemText: "#6d552f",
    arrowBg: "transparent",
    arrowBorder: "#dfcaa6",
    arrowText: "#7c6540",
  };

  return (
    <section className="qh-container qh-section-pad">
      <div className="mx-auto w-full max-w-[640px] overflow-hidden rounded-[22px] shadow-[0_16px_56px_rgba(212,180,131,0.30)]" style={{ backgroundColor: c.sectionBg }}>
        <div className="px-4 pt-6 md:px-6 md:pt-7">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center rounded-[7px] px-3 py-1 font-serif text-[1.05rem] font-black tracking-[0.06em]" style={{ backgroundColor: c.accent, color: c.badgeText }}>
              {settings.badgeText || "NEW"}
            </span>
            <h2 className="font-serif text-2xl font-bold md:text-[1.75rem]" style={{ color: c.title }}>{settings.title || "Arrivals"}</h2>
          </div>
          <p className="mt-2 max-w-[370px] text-[0.87rem] leading-relaxed" style={{ color: c.subtitle }}>{settings.subtitle || "Be the first to explore our newest furniture and home essentials, crafted for modern homes."}</p>
          <div className="mt-4 flex items-end gap-1">
            <button
              className="relative rounded-t-[16px] px-4 pb-2 pt-3 text-[0.9rem]"
              style={{ backgroundColor: cat === "accessory" ? c.cardBg : "transparent", color: cat === "accessory" ? c.tabActiveText : c.tabText, fontWeight: cat === "accessory" ? 700 : 500 }}
              onClick={() => {
                setCat("accessory");
                setTab(0);
              }}
            >
              {settings.accessoryLabel || "Accessory"}
              {cat === "accessory" ? <span className="absolute bottom-0 left-[20%] right-[20%] h-[2.5px] rounded" style={{ backgroundColor: c.tabUnderline }} /> : null}
            </button>
            <button
              className="relative rounded-t-[16px] px-4 pb-2 pt-3 text-[0.9rem]"
              style={{ backgroundColor: cat === "furniture" ? c.cardBg : "transparent", color: cat === "furniture" ? c.tabActiveText : c.tabText, fontWeight: cat === "furniture" ? 700 : 500 }}
              onClick={() => {
                setCat("furniture");
                setTab(0);
              }}
            >
              {settings.furnitureLabel || "Furniture"}
              {cat === "furniture" ? <span className="absolute bottom-0 left-[20%] right-[20%] h-[2.5px] rounded" style={{ backgroundColor: c.tabUnderline }} /> : null}
            </button>
          </div>
        </div>
        <div style={{ backgroundColor: c.cardBg }}>
          <div className="flex items-center overflow-x-auto border-b px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-[18px]" style={{ borderBottomColor: c.tabBorder }}>
            {data.map((t: Group, i: number) => (
              <button key={t.tab + i} className="relative shrink-0 whitespace-nowrap px-3.5 pb-3 pt-3.5 text-[0.86rem]" style={{ color: i === tab ? c.title : c.tabText, fontWeight: i === tab ? 700 : 500 }} onClick={() => setTab(i)}>
                {t.tab}
                {i === tab ? <span className="absolute bottom-0 left-1/2 h-[2.5px] w-[70%] -translate-x-1/2 rounded" style={{ backgroundColor: c.tabUnderline }} /> : null}
              </button>
            ))}
            <button className="ml-auto inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-sm" style={{ backgroundColor: c.arrowBg, borderColor: c.arrowBorder, color: c.arrowText }} onClick={() => setTab((p) => (p + 1) % Math.max(1, data.length))}>
              {">"}
            </button>
          </div>
          <div className="p-4 pt-4 md:p-4 md:pt-[18px]">
            <div className="grid grid-cols-2 gap-[11px] md:grid-cols-3">
              {active.items.map((item: Item, idx: number) => (
                <div key={item.label + idx} className="rounded-[13px] border px-2 py-3 text-center" style={{ backgroundColor: c.itemCardBg, borderColor: c.itemCardBorder }}>
                  <span className="mb-1 block text-[1.85rem]">{item.icon}</span>
                  <span className="block text-[0.73rem] font-medium" style={{ color: c.itemText }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
export function ReelImagePreview({ settings }: { settings: Section["settings"] }) {
  const cardH = settings.cardHeight ?? 400;
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
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
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

    const scrollAmount = direction === "left" ? -container.clientWidth : container.clientWidth;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const scrollContainerCss = `
    .qh-reel-scroll-preview::-webkit-scrollbar { display: none; }
    .qh-reel-scroll-preview { -ms-overflow-style: none; scrollbar-width: none; }
    
    .qh-reel-card-preview {
      width: calc(50% - ${gap / 2}px);
      height: ${Math.min(cardH, 340)}px;
    }
    
    @media (min-width: 768px) {
      .qh-reel-card-preview {
        width: calc(25% - ${(gap * 3) / 4}px);
        height: ${cardH}px;
      }
    }
  `;

  const hasItems = reels.length > 0;
  const displayItems = hasItems ? reels : Array.from({ length: 4 }).map((_, i) => ({
    image: "",
    text: `Reel ${i + 1}`,
  }));

  return (
    <div className="relative w-full overflow-hidden py-10 md:py-16">
      {settings.heading && <h2 className="mb-8 text-center font-display text-3xl font-black tracking-tight text-text-main md:text-4xl">{settings.heading}</h2>}
      <style dangerouslySetInnerHTML={{ __html: scrollContainerCss }} />
      
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="relative group/arrows w-full">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105 hover:bg-gray-50 border border-gray-200"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 stroke-[2]" />
            </button>
          )}

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105 hover:bg-gray-50 border border-gray-200"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 stroke-[2]" />
            </button>
          )}

          <div
            ref={containerRef}
            className="qh-reel-scroll-preview flex overflow-x-auto snap-x snap-mandatory"
            style={{ gap: `\${gap}px` }}
          >
            {displayItems.map((reel, i) => {
              return (
                <div
                  key={i}
                  className="qh-reel-card-preview shrink-0 snap-start relative overflow-hidden group/card bg-gray-100 shadow-sm transition-shadow hover:shadow-lg"
                  style={{
                    borderRadius: `\${radius}px`,
                  }}
                >
                  {reel.image ? (
                    <img
                      src={reel.image}
                      alt={reel.text || ""}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover/card:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center text-gray-400 gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      <span className="text-xs font-medium">{reel.text}</span>
                    </div>
                  )}
                  {reel.image && <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover/card:opacity-100" />}
                  {reel.text && reel.image && (
                    <div className="absolute inset-x-0 bottom-0 p-4 pb-6 text-center transform transition-transform duration-300 group-hover/card:-translate-y-1">
                      <p className="text-base md:text-lg font-bold text-white drop-shadow-md">{reel.text}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Component Map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

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
  FiveGrid: FiveGridPreview,
  ImageBanner: ImageBannerPreview,
  SlideBanner: SlideBannerPreview,
  SaleBanner: SaleBannerPreview,
  NewArrival: NewArrivalPreview,
  ReelImage: ReelImagePreview,
};






