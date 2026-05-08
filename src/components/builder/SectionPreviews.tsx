/**
 * Builder Canvas Section Components
 * 
 * Each component renders a storefront section using
 * CSS variables from the theme for consistent styling.
 */

import React from "react";
import type { Section } from "@/lib/builder/types";

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

/* ─── Component Map ────────────────────────────────────────── */

export const sectionComponentMap: Record<string, React.FC<{ settings: Section["settings"] }>> = {
  HeroBanner: HeroBannerPreview,
  RichText: RichTextPreview,
  ImageWithText: ImageWithTextPreview,
  FeaturedCollection: FeaturedCollectionPreview,
  ProductGrid: ProductGridPreview,
  Newsletter: NewsletterPreview,
  Testimonials: TestimonialsPreview,
  BannerStrip: BannerStripPreview,
};
