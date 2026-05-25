/**
 * Storefront Section Renderer
 * 
 * Maps builder section types to actual storefront React components.
 * Used by the dynamic homepage to render builder-defined layouts.
 * 
 * These are the PRODUCTION versions of the section components.
 * They use real CSS classes (not builder CSS vars) and fetch real data.
 */

import React from "react";
import Link from "next/link";
import type { Section, ThemeSettings } from "@/lib/builder/types";
import { StorefrontReelImage } from "./StorefrontReelImage";
import { StorefrontSlideBanner } from "./StorefrontSlideBanner";
import { StorefrontSaleBanner } from "./StorefrontSaleBanner";
import { StorefrontNewArrival } from "./StorefrontNewArrival";

/* ─── Import actual beautiful components ─────────────────────── */
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getCatalogProducts } from "@/lib/catalog";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Sparkles, Truck, Undo2, WalletCards, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductGrid2Card } from "@/components/product/ProductGrid2Card";

/* ─── HeroBanner — uses actual HeroSection with framer-motion ──── */

function StorefrontHeroBanner({ settings }: { settings: Record<string, any>; theme: ThemeSettings }) {
  return <HeroSection settings={settings} />;
}

/* ─── SearchBand ───────────────────────────────────────────── */
function StorefrontSearchBand({ settings }: { settings: Record<string, any> }) {
  const chips = (settings.chips || "").split(",").map((c: string) => c.trim()).filter(Boolean);
  return (
    <section className="qh-market-band">
      <div className="qh-container flex flex-wrap items-center gap-3 py-4">
        <span className="text-sm font-black text-text-main">{settings.label}</span>
        {chips.map((chip: string) => (
          <Link key={chip} href={`/search?q=${encodeURIComponent(chip)}`} className="rounded-full border border-text-main/10 bg-background-elevated px-4 py-2 text-sm font-bold text-text-main shadow-soft transition-all duration-base hover:border-brand-primary">
            {chip}
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ─── CategoryGrid — uses actual CategoryGrid component ──────── */
function StorefrontCategoryGrid({ settings }: { settings: Record<string, any> }) {
  return <CategoryGrid settings={settings} />;
}

/* ─── CollectionsSection — uses actual CollectionsSection component ─ */
function StorefrontCollectionsSection({ settings }: { settings: Record<string, any> }) {
  return <CollectionsSection settings={settings} />;
}

/* ─── ProductGrid ───────────────────────────────────────────── */
async function StorefrontProductGridWrapper({ settings }: { settings: Record<string, any> }) {
  const allProducts = await getCatalogProducts();
  
  const source = settings.productSource || "all";
  let products = allProducts;
  
  if (source === "manual" && settings.productIds?.length > 0) {
    const ids: string[] = settings.productIds;
    products = allProducts.filter(p => ids.includes(p.id || "") || ids.includes(p.slug));
  } else if (source === "latest") {
    products = allProducts.slice(0, 20);
  }

  const cols = parseInt(settings.columns || "4");
  const mobileCols = parseInt(settings.mobileColumns || "2");
  const rows = parseInt(settings.rows || "2");
  const gap = parseInt(settings.gap || "24");
  const mobileGap = Math.min(gap, 12);
  const limit = cols * rows;
  const limitedProducts = products.slice(0, limit);

  /* Use inline styles for mobile, injected CSS for responsive breakpoints.
     Tailwind purges dynamic class names like lg:grid-cols-${cols}, so we
     inject real CSS with media queries instead. */
  const gridStyle = {
    display: "grid",
    gap: `${mobileGap}px`,
    gridTemplateColumns: `repeat(${mobileCols}, 1fr)`,
  } as React.CSSProperties;

  const desktopCss = `
    @media (min-width: 768px) {
      .qh-product-grid-dynamic { grid-template-columns: repeat(3, 1fr) !important; gap: ${gap}px !important; }
    }
    @media (min-width: 1024px) {
      .qh-product-grid-dynamic { grid-template-columns: repeat(${cols}, 1fr) !important; gap: ${gap}px !important; }
    }
  `;

  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader eyebrow={settings.eyebrow} title={settings.heading} description={settings.subheading} />
      <style dangerouslySetInnerHTML={{ __html: desktopCss }} />
      {limitedProducts.length ? (
        <div style={gridStyle} className="qh-product-grid-dynamic">
          {limitedProducts.map((product) => (
            <ProductCard key={product.slug} product={product} /> 
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background-elevated p-6 text-center text-text-muted">
          No products selected or available.
        </div>
      )}
    </section>
  );
}

async function StorefrontProductGrid2({ settings, sectionId }: { settings: Record<string, any>; sectionId: string }) {
  const desktopCols = Math.min(6, Math.max(2, parseInt(settings.desktopColumns || "6")));
  const mobileCols = Math.min(2, Math.max(1, parseInt(settings.mobileColumns || "2")));
  const gap = Math.min(32, Math.max(8, Number(settings.gap || 16)));
  const radius = Math.min(28, Math.max(4, Number(settings.cardRadius || 14)));
  const buttonText = settings.buttonText || "Add To Cart";
  const source = settings.productSource || "manual";
  const selectedIds: string[] = settings.productIds || [];
  const viewAllText = settings.viewAllText || "View All Products";
  const viewAllLink = `/all-product/${sectionId}`;

  const allProducts = await getCatalogProducts();
  let picked = allProducts;
  if (source === "manual" && selectedIds.length > 0) {
    picked = allProducts.filter((p) => selectedIds.includes(p.id || "") || selectedIds.includes(p.slug));
  } else if (source === "latest") {
    picked = allProducts.slice(0, 30);
  }
  const visible = picked.slice(0, 6);
  const hasMore = picked.length > 6;

  const uid = getDeterministicId("qh-pg2", settings);
  const css = `
    .${uid} { display: grid; grid-template-columns: repeat(${mobileCols}, minmax(0, 1fr)); gap: ${Math.min(gap, 12)}px; }
    @media (min-width: 768px) {
      .${uid} { grid-template-columns: repeat(${desktopCols}, minmax(0, 1fr)); gap: ${gap}px; }
    }
  `;

  return (
    <section className="qh-container qh-section-pad">
      {(settings.heading || settings.subheading) && (
        <div className="mb-5">
          {settings.heading && <h2 className="font-display text-2xl font-black text-text-main md:text-3xl">{settings.heading}</h2>}
          {settings.subheading && <p className="mt-2 text-sm text-text-muted md:text-base">{settings.subheading}</p>}
        </div>
      )}
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={uid}>
        {visible.map((product) => (
          <ProductGrid2Card
            key={product.slug}
            product={product}
            radius={radius}
            buttonText={buttonText}
          />
        ))}
      </div>
      {hasMore && (
        <div className="mt-5 flex justify-center">
          <Link href={viewAllLink} className="inline-flex rounded-[10px] border border-black/70 bg-white px-5 py-2 text-sm font-semibold text-black">
            {viewAllText}
          </Link>
        </div>
      )}
    </section>
  );
}

/* ─── PromisesSection — exact replica of original page.tsx ──── */
function StorefrontPromisesSection({ settings }: { settings: Record<string, any> }) {
  const promises = [
    { icon: Sparkles, title: "Curated decor", text: "Thoughtfully selected pieces with warmth and personality." },
    { icon: ShieldCheck, title: "Premium quality", text: "Affordable luxury without fragile showroom energy." },
    { icon: Undo2, title: "Easy returns", text: "A smoother post-purchase experience for real life." },
    { icon: Truck, title: "Fast shipping", text: "Quick dispatch across India on everyday favourites." },
    { icon: WalletCards, title: "Secure payments", text: "UPI, cards, wallets, and protected checkout flows." },
  ];
  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader align="center" eyebrow={settings.eyebrow || "Why choose us"} title={settings.heading || "A calmer, warmer way to shop for home"} />
      <div className="grid gap-4 md:grid-cols-5">
        {promises.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="qh-card p-5 text-center">
              <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-background-soft text-brand-primary"><Icon className="h-6 w-6" /></div>
              <h3 className="font-semibold text-text-main">{item.title}</h3>
              <p className="mt-2 text-sm text-text-muted">{item.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─── Newsletter — exact replica of original page.tsx ────────── */
function StorefrontNewsletterVaaree({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad">
      <div className="grid gap-6 rounded-lg bg-background-soft p-6 md:qh-newsletter-grid md:items-center md:p-8">
        <div>
          <SectionHeader eyebrow={settings.eyebrow || "Decor notes"} title={settings.heading || "Ideas, offers and new drops"} description={settings.subheading || "Get room styling inspiration, festive sale alerts and new home essentials in your inbox."} />
          <ThemeSwitcher />
        </div>
        <form className="grid gap-3 md:min-w-80">
          <input className="qh-focus h-button-lg rounded-full border border-border bg-background-elevated px-5 text-text-main placeholder:text-text-soft" placeholder="Enter email for decor notes" />
          <Button type="button" size="lg">{settings.buttonText || "Join Newsletter"}</Button>
        </form>
      </div>
    </section>
  );
}

/* ─── SeoArticle ───────────────────────────────────────────── */
function StorefrontSeoArticle({ settings }: { settings: Record<string, any> }) {
  type HeadingTagName = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  const allowedTags: HeadingTagName[] = ["h1", "h2", "h3", "h4", "h5", "h6"];
  const safeHeadingTag = String(settings.headingTag || "");
  const safeSubheadingTag = String(settings.subheadingTag || "");
  const headingTag: HeadingTagName = allowedTags.includes(safeHeadingTag as HeadingTagName) ? (safeHeadingTag as HeadingTagName) : "h2";
  const subheadingTag: HeadingTagName = allowedTags.includes(safeSubheadingTag as HeadingTagName) ? (safeSubheadingTag as HeadingTagName) : "h2";
  const HeadingTag = headingTag;
  const SubheadingTag = subheadingTag;

  // Backward compatibility: keep rendering legacy HTML when present.
  if (
    typeof settings.content === "string" &&
    settings.content.includes("<") &&
    settings.content.includes(">")
  ) {
    return (
      <section className="qh-container qh-section-pad">
        <article
          className="qh-seo-copy max-w-none rounded-lg border border-border bg-background-elevated p-6 md:p-8"
          dangerouslySetInnerHTML={{ __html: settings.content }}
        />
      </section>
    );
  }

  return (
    <section className="qh-container qh-section-pad">
      <article className="qh-seo-copy max-w-none rounded-lg border border-border bg-background-elevated p-6 md:p-8">
        {settings.headingText ? <HeadingTag>{settings.headingText}</HeadingTag> : null}
        {settings.content ? <p>{settings.content}</p> : null}
        {settings.subheadingText ? <SubheadingTag>{settings.subheadingText}</SubheadingTag> : null}
        {settings.content2 ? <p>{settings.content2}</p> : null}
      </article>
    </section>
  );
}

/* ─── Testimonials ─────────────────────────────────────────── */

function StorefrontTestimonials({ settings, theme }: { settings: Record<string, any>; theme: ThemeSettings }) {
  const testimonials = [
    { name: settings.testimonial1Name, text: settings.testimonial1Text },
    { name: settings.testimonial2Name, text: settings.testimonial2Text },
    { name: settings.testimonial3Name, text: settings.testimonial3Text },
  ].filter((t) => t.name && t.text);

  return (
    <section className="qh-container qh-section-pad">
      <h2 className="mb-8 text-center text-2xl font-bold text-text-main md:text-3xl">{settings.heading}</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <div key={i} className="qh-card p-6">
            <div className="mb-3 text-2xl" style={{ color: theme.colors.primary }}>"</div>
            <p className="text-sm leading-relaxed text-text-muted">{t.text}</p>
            <p className="mt-4 text-sm font-semibold text-text-main">— {t.name}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── BannerStrip ──────────────────────────────────────────── */

function StorefrontBannerStrip({ settings }: { settings: Record<string, any>; theme: ThemeSettings }) {
  return (
    <div
      className="px-4 py-2.5 text-center text-sm font-semibold"
      style={{
        backgroundColor: settings.bgColor || "#008060",
        color: settings.textColor || "#ffffff",
      }}
    >
      {settings.text}
    </div>
  );
}

/* ─── RichText ────────────────────────────────────────── */

function StorefrontRichText({ settings }: { settings: Record<string, any> }) {
  const headingAlign = settings.headingAlign === "left" || settings.headingAlign === "right"
    ? settings.headingAlign
    : (settings.textAlign === "left" || settings.textAlign === "right" ? settings.textAlign : "center");
  const contentAlign = settings.contentAlign === "left" || settings.contentAlign === "right"
    ? settings.contentAlign
    : (settings.textAlign === "left" || settings.textAlign === "right" ? settings.textAlign : "center");
  const headingSize = settings.headingSize === "small" ? "1.15rem" : settings.headingSize === "large" ? "1.8rem" : "1.45rem";
  const contentSize = settings.contentSize === "small" ? "0.92rem" : settings.contentSize === "large" ? "1.08rem" : "1rem";
  return (
    <section className="qh-container qh-section-pad">
      <div>
        {settings.heading ? (
          <h2 className="mb-4 font-display font-black text-text-main" style={{ fontSize: headingSize, lineHeight: 1.2, textAlign: headingAlign }}>
            {settings.heading}
          </h2>
        ) : null}
        <div
          className="qh-seo-copy max-w-none text-text-muted"
          style={{ fontSize: contentSize, textAlign: contentAlign }}
          dangerouslySetInnerHTML={{ __html: settings.content || "" }}
        />
      </div>
    </section>
  );
}

/* ─── ImageWithText ────────────────────────────────────── */

function StorefrontImageWithText({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad grid md:grid-cols-2 gap-6 items-center">
      <img src={settings.imageUrl || "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80"} alt="" className="rounded-lg object-cover w-full h-full max-h-[400px]" />
      <div>
        <h2 className="text-3xl font-bold mb-4 text-text-main">{settings.heading}</h2>
        <p className="text-text-muted mb-6">{settings.text}</p>
      </div>
    </section>
  );
}

/* ─── FeaturedCollection ────────────────────────────────── */

function StorefrontFeaturedCollection({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad">
      <h2 className="text-2xl font-bold mb-6 text-center text-text-main">{settings.heading}</h2>
      <div className="text-center text-text-muted">Featured Collection: {settings.collectionId || "None"}</div>
    </section>
  );
}

function getDeterministicId(prefix: string, settings: Record<string, any>) {
  const str = JSON.stringify(settings);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `${prefix}-${Math.abs(hash)}`;
}

/* ─── ImageBanner (full-width clickable banner — no text, pure image) ── */
function StorefrontImageBanner({ settings }: { settings: Record<string, any> }) {
  const desktopHeight = settings.desktopHeight || 280;
  const mobileHeight = settings.mobileHeight || 180;
  const radius = settings.borderRadius ?? 12;
  const fullWidth = settings.fullWidth ?? false;
  const desktopImage = settings.desktopImageUrl || settings.imageUrl || "";
  const mobileImage = settings.mobileImageUrl || desktopImage;
  const link = settings.link || "#";
  const alt = settings.altText || "";

  const uid = getDeterministicId("qh-imgbanner", settings);
  const css = `
    .${uid} { height: ${mobileHeight}px; }
    @media (min-width: 768px) { .${uid} { height: ${desktopHeight}px; } }
    .${uid} .qh-ib-mobile { display: block; }
    .${uid} .qh-ib-desktop { display: none; }
    @media (min-width: 768px) {
      .${uid} .qh-ib-mobile { display: none; }
      .${uid} .qh-ib-desktop { display: block; }
    }
  `;

  const content = (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div
        className={`${uid} relative overflow-hidden transition-transform duration-300 hover:scale-[1.005]`}
        style={{ borderRadius: fullWidth ? `0 0 ${Math.max(radius + 8, 20)}px ${Math.max(radius + 8, 20)}px` : `${radius}px` }}
      >
        {desktopImage && (
          <img src={desktopImage} alt={alt} className="qh-ib-desktop absolute inset-0 h-full w-full object-cover" />
        )}
        {mobileImage && (
          <img src={mobileImage} alt={alt} className="qh-ib-mobile absolute inset-0 h-full w-full object-cover" />
        )}
        {!desktopImage && !mobileImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-background-soft text-text-muted text-sm">
            No banner image set
          </div>
        )}
      </div>
    </>
  );

  if (link && link !== "#") {
    return (
      <section className={fullWidth ? "" : "qh-container"} style={fullWidth ? {} : { paddingTop: "8px", paddingBottom: "8px" }}>
        <Link href={link} className="block">{content}</Link>
      </section>
    );
  }

  return (
    <section className={fullWidth ? "" : "qh-container"} style={fullWidth ? {} : { paddingTop: "8px", paddingBottom: "8px" }}>
      {content}
    </section>
  );
}

/* ─── ImageGrid (3-image promo grid — Flipkart/Amazon style) ───── */
function StorefrontImageGrid({ settings }: { settings: Record<string, any> }) {
  const gap = settings.gap ?? 12;
  const radius = settings.borderRadius ?? 12;
  const desktopHeight = settings.desktopHeight ?? 360;
  const mobileHeight = settings.mobileHeight ?? 420;

  const uid = getDeterministicId("qh-imggrid", settings);
  const css = `
    .${uid} {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: ${gap}px;
    }
    .${uid} > div {
      height: 140px;
      width: 100%;
    }
    .${uid} .qh-ig-large {
      grid-column: span 2;
      height: 200px;
    }
    @media (min-width: 768px) {
      .${uid} {
        grid-template-columns: 2fr 1fr;
        grid-template-rows: repeat(2, ${Math.round(desktopHeight / 2)}px);
        height: ${desktopHeight}px;
      }
      .${uid} > div {
        height: 100% !important;
      }
      .${uid} .qh-ig-large {
        grid-column: span 1;
        grid-row: 1 / 3;
        height: 100% !important;
      }
    }
  `;

  const renderSlot = (imageUrl: string, link: string, alt: string) => {
    const inner = (
      <div
        className="relative h-full w-full overflow-hidden group"
        style={{ borderRadius: `${radius}px` }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={alt || ""}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ borderRadius: `${radius}px` }}
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center bg-background-soft text-text-muted text-sm"
            style={{ borderRadius: `${radius}px` }}
          >
            No image set
          </div>
        )}
      </div>
    );

    if (link && link !== "#") {
      return <Link href={link} className="block h-full">{inner}</Link>;
    }
    return inner;
  };

  return (
    <section className="qh-container" style={{ paddingTop: "8px", paddingBottom: "8px" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={uid}>
        <div className="qh-ig-large">
          {renderSlot(settings.image1Url || "", settings.image1Link || "#", settings.image1Alt || "")}
        </div>
        <div>
          {renderSlot(settings.image2Url || "", settings.image2Link || "#", settings.image2Alt || "")}
        </div>
        <div>
          {renderSlot(settings.image3Url || "", settings.image3Link || "#", settings.image3Alt || "")}
        </div>
      </div>
    </section>
  );
}

function StorefrontFiveGrid({ settings }: { settings: Record<string, any> }) {
  const gap = Number(settings.gap ?? 16);
  const radius = Number(settings.radius ?? 22);
  const uid = getDeterministicId("qh-fivegrid", settings);

  const css = `
    .${uid} { display: grid; gap: ${gap}px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .${uid} .fg-item { position: relative; min-height: 140px; overflow: hidden; }
    .${uid} .fg-item-3, .${uid} .fg-item-5 { grid-column: 1 / -1; min-height: 170px; }
    .${uid} .fg-item-2 { display: none; }
    .${uid} .fg-overlay {
      position: absolute;
      inset: 0;
      z-index: 1;
      background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 56%, transparent 100%);
    }
    .${uid} .fg-copy {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 2;
      padding: 14px;
    }
    .${uid} .fg-copy.right { text-align: right; }
    .${uid} .fg-title {
      color: #fff;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
      line-height: 1.25;
      text-transform: uppercase;
      margin-bottom: 3px;
    }
    .${uid} .fg-off {
      color: #f2f2f2;
      font-size: 10px;
      margin-bottom: 8px;
    }
    .${uid} .fg-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 4px;
      background: #fff;
      color: #111;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.2px;
      padding: 5px 12px;
      line-height: 1;
      min-height: 26px;
    }
    @media (min-width: 1024px) {
      .${uid} {
        grid-template-columns: 1.1fr 1fr 1fr;
        grid-template-rows: repeat(2, minmax(230px, 1fr));
      }
      .${uid} .fg-item { min-height: 230px; }
      .${uid} .fg-item-2 { display: block; }
      .${uid} .fg-item-1 { grid-row: 1 / 3; grid-column: 1 / 2; min-height: 100%; }
      .${uid} .fg-item-2 { grid-row: 1 / 2; grid-column: 2 / 3; min-height: auto; }
      .${uid} .fg-item-3 { grid-row: 1 / 2; grid-column: 3 / 4; }
      .${uid} .fg-item-4 { grid-row: 2 / 3; grid-column: 2 / 3; }
      .${uid} .fg-item-5 { grid-row: 2 / 3; grid-column: 3 / 4; min-height: auto; }
      .${uid} .fg-title { font-size: 14px; }
      .${uid} .fg-off { font-size: 11px; }
      .${uid} .fg-btn { font-size: 11px; padding: 6px 14px; }
      .${uid} .fg-item-1 .fg-copy { padding: 18px; }
      .${uid} .fg-item-1 .fg-title { font-size: 22px; line-height: 1.2; }
      .${uid} .fg-item-1 .fg-off { font-size: 14px; }
      .${uid} .fg-item-1 .fg-btn { min-height: 34px; padding: 8px 20px; font-size: 12px; }
    }
  `;

  const items = [1, 2, 3, 4, 5].map((n) => ({
    key: n,
    image: settings[`image${n}Url`] || "",
    alt: settings[`image${n}Alt`] || "",
    link: settings[`image${n}Link`] || "",
    title: settings[`image${n}Title`] || `Image ${n}`,
    offer: settings[`image${n}Offer`] || "",
    cta: settings[`image${n}Cta`] || "Shop Now",
    textAlign: settings[`image${n}TextAlign`] === "right" ? "right" : "left",
  }));

  const renderItem = (item: { key: number; image: string; alt: string; link: string; title: string; offer: string; cta: string; textAlign: string }) => {
    const content = (
      <div className={`fg-item fg-item-${item.key} h-full w-full`} style={{ borderRadius: `${radius}px` }}>
        {item.image ? (
          <img
            src={item.image}
            alt={item.alt}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-background-soft text-sm text-text-muted">
            No image
          </div>
        )}
        <div className="fg-overlay" />
        <div className={`fg-copy ${item.textAlign === "right" ? "right" : ""}`}>
          <p className="fg-title">{item.title}</p>
          {item.offer ? <p className="fg-off">{item.offer}</p> : null}
          <span className="fg-btn">{item.cta}</span>
        </div>
      </div>
    );

    if (item.link && item.link !== "#") {
      return (
        <Link key={item.key} href={item.link} className="block h-full w-full">
          {content}
        </Link>
      );
    }
    return <div key={item.key}>{content}</div>;
  };

  return (
    <section className="qh-container" style={{ paddingTop: "8px", paddingBottom: "8px" }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={uid}>
        {items.map(renderItem)}
      </div>
    </section>
  );
}

/* ─── Slideshow ───────────────────────────────────────────── */
function StorefrontSlideshow({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="relative w-full overflow-hidden" style={{ height: settings.height || "500px" }}>
      <img src={settings.slide1Image} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{settings.slide1Heading}</h2>
        <p className="text-lg text-white/90">{settings.slide1Subtext}</p>
      </div>
    </section>
  );
}

/* ─── Multicolumn ─────────────────────────────────────────── */
function StorefrontMulticolumn({ settings }: { settings: Record<string, any> }) {
  const cols = parseInt(settings.columns || "3");
  const data = [];
  for(let i=1; i<=cols; i++) {
    data.push({
      title: settings[`col${i}Title`],
      text: settings[`col${i}Text`],
      image: settings[`col${i}Image`],
    });
  }

  const multiCss = `
    @media (min-width: 768px) {
      .qh-multicol-dynamic { grid-template-columns: repeat(${cols}, 1fr) !important; }
    }
  `;

  return (
    <section className="qh-container qh-section-pad">
      <h2 className="text-3xl font-bold mb-10 text-center text-text-main">{settings.heading}</h2>
      <style dangerouslySetInnerHTML={{ __html: multiCss }} />
      <div className="grid gap-8 qh-multicol-dynamic">
        {data.map((col, i) => (
          <div key={i} className="flex flex-col items-center text-center p-4 bg-background-elevated rounded-xl shadow-sm border border-border">
            {col.image && <img src={col.image} alt="" className="w-16 h-16 object-contain mb-5" />}
            <h3 className="text-lg font-bold text-text-main mb-2">{col.title}</h3>
            <p className="text-text-muted text-sm">{col.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── CollapsibleContent ──────────────────────────────────── */
function StorefrontCollapsibleContent({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 text-center text-text-main">{settings.heading}</h2>
      <div className="grid gap-4">
        {[1,2,3,4,5].map(i => {
          const q = settings[`q${i}`];
          const a = settings[`a${i}`];
          if(!q || !a) return null;
          return (
            <details key={i} className="group border border-border bg-background-elevated rounded-lg p-4 cursor-pointer">
              <summary className="font-semibold text-text-main flex justify-between items-center outline-none">
                {q}
                <span className="text-text-muted group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4 text-text-muted text-sm leading-relaxed">{a}</div>
            </details>
          );
        })}
      </div>
    </section>
  );
}

/* ─── FeaturedProduct ─────────────────────────────────────── */
function StorefrontFeaturedProduct({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad text-center">
      <h2 className="text-3xl font-bold mb-6 text-text-main">{settings.heading}</h2>
      <p className="text-text-muted">Featured Product Showcase: {settings.productSlug}</p>
    </section>
  );
}

/* ─── Video ───────────────────────────────────────────────── */
function StorefrontVideo({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad text-center">
      <h2 className="text-3xl font-bold mb-8 text-text-main">{settings.heading}</h2>
      <div className="aspect-video max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg border border-border">
        {settings.videoUrl ? (
          <iframe src={settings.videoUrl} className="w-full h-full" allowFullScreen />
        ) : (
          <div className="w-full h-full bg-background-soft flex items-center justify-center">No video URL provided</div>
        )}
      </div>
      {settings.description && <p className="mt-6 text-text-muted max-w-2xl mx-auto">{settings.description}</p>}
    </section>
  );
}

/* ─── LogoList ────────────────────────────────────────────── */
function StorefrontLogoList({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container py-12 border-y border-border/50 bg-background-soft/50">
      <h3 className="text-center text-sm font-semibold text-text-muted uppercase tracking-widest mb-8">{settings.heading}</h3>
      <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
        {[1,2,3,4,5].map(i => {
          const logo = settings[`logo${i}`];
          return logo ? <img key={i} src={logo} alt="" className="h-8 md:h-12 object-contain" /> : null;
        })}
      </div>
    </section>
  );
}

/* ─── ContactForm ─────────────────────────────────────────── */
function StorefrontContactForm({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad max-w-2xl mx-auto text-center">
      <h2 className="text-3xl font-bold mb-3 text-text-main">{settings.heading}</h2>
      <p className="text-text-muted mb-8">{settings.subheading}</p>
      <form className="grid gap-4 text-left">
        <div className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Name" className="p-3 rounded-lg border border-border bg-background-elevated outline-none focus:border-brand-primary" />
          <input type="email" placeholder="Email" className="p-3 rounded-lg border border-border bg-background-elevated outline-none focus:border-brand-primary" />
        </div>
        {settings.showPhone && <input type="tel" placeholder="Phone Number" className="p-3 rounded-lg border border-border bg-background-elevated outline-none focus:border-brand-primary" />}
        <textarea placeholder="Message" rows={5} className="p-3 rounded-lg border border-border bg-background-elevated outline-none focus:border-brand-primary" />
        <Button className="w-full h-12 mt-2">{settings.buttonText}</Button>
      </form>
    </section>
  );
}

/* ─── MapSection ──────────────────────────────────────────── */
function StorefrontMapSection({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad grid md:grid-cols-2 gap-8 items-center">
      <div>
        <h2 className="text-3xl font-bold mb-4 text-text-main">{settings.heading}</h2>
        <p className="text-text-muted text-lg leading-relaxed whitespace-pre-line">{settings.address}</p>
      </div>
      <div className="aspect-square md:aspect-video rounded-xl bg-background-soft border border-border overflow-hidden">
        {settings.mapEmbed ? (
          <iframe src={settings.mapEmbed} className="w-full h-full" allowFullScreen loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">Map goes here</div>
        )}
      </div>
    </section>
  );
}

/* ─── CustomHTML ──────────────────────────────────────────── */
function StorefrontCustomHTML({ settings }: { settings: Record<string, any> }) {
  return <div dangerouslySetInnerHTML={{ __html: settings.content }} />;
}

/* ─── Divider ─────────────────────────────────────────────── */
function StorefrontDivider({ settings }: { settings: Record<string, any> }) {
  return (
    <div style={{ paddingTop: `${settings.paddingTop}px`, paddingBottom: `${settings.paddingBottom}px` }} className="qh-container">
      {settings.style === "line" && <hr className="border-border" />}
      {settings.style === "dotted" && <hr className="border-border border-dashed" />}
    </div>
  );
}



/* ─── Component Map ────────────────────────────────────────── */

const storefrontComponentMap: Record<string, React.FC<{ settings: Record<string, any>; theme: ThemeSettings }>> = {
  HeroBanner: StorefrontHeroBanner,
  SearchBand: StorefrontSearchBand,
  CategoryGrid: StorefrontCategoryGrid,
  CollectionsSection: StorefrontCollectionsSection,
  ProductGrid: StorefrontProductGridWrapper as unknown as React.FC<any>, // It's async
  ProductGrid2: StorefrontProductGrid2 as unknown as React.FC<any>,
  PromisesSection: StorefrontPromisesSection,
  Newsletter: StorefrontNewsletterVaaree,
  SeoArticle: StorefrontSeoArticle,
  RichText: StorefrontRichText,
  ImageWithText: StorefrontImageWithText,
  FeaturedCollection: StorefrontFeaturedCollection,
  Testimonials: StorefrontTestimonials,
  BannerStrip: StorefrontBannerStrip,
  // newly added
  ImageBanner: StorefrontImageBanner,
  ImageGrid: StorefrontImageGrid,
  FiveGrid: StorefrontFiveGrid,
  SlideBanner: StorefrontSlideBanner,
  SaleBanner: StorefrontSaleBanner,
  NewArrival: StorefrontNewArrival,
  Slideshow: StorefrontSlideshow,
  Multicolumn: StorefrontMulticolumn,
  CollapsibleContent: StorefrontCollapsibleContent,
  FeaturedProduct: StorefrontFeaturedProduct,
  Video: StorefrontVideo,
  LogoList: StorefrontLogoList,
  ContactForm: StorefrontContactForm,
  MapSection: StorefrontMapSection,
  CustomHTML: StorefrontCustomHTML,
  Divider: StorefrontDivider,
  ReelImage: StorefrontReelImage,
};

/* ─── Public Renderer ──────────────────────────────────────── */

interface RenderSectionProps {
  section: Section;
  theme: ThemeSettings;
}

export function RenderSection({ section, theme }: RenderSectionProps) {
  if (!section.visible) return null;
  if (section.type === "ProductGrid2") {
    const s = section.settings;
    const wrapperStyle: React.CSSProperties = {};
    if (s.sectionPaddingTop) wrapperStyle.paddingTop = `${s.sectionPaddingTop}px`;
    if (s.sectionPaddingBottom) wrapperStyle.paddingBottom = `${s.sectionPaddingBottom}px`;
    if (s.sectionBgColor) wrapperStyle.backgroundColor = s.sectionBgColor;
    return (
      <div style={wrapperStyle} className="qh-builder-section">
        <StorefrontProductGrid2 settings={s} sectionId={section.id} />
      </div>
    );
  }

  const Component = storefrontComponentMap[section.type];
  if (!Component) return null;
  
  const s = section.settings;
  const wrapperStyle: React.CSSProperties = {};
  if (s.sectionPaddingTop) wrapperStyle.paddingTop = `${s.sectionPaddingTop}px`;
  if (s.sectionPaddingBottom) wrapperStyle.paddingBottom = `${s.sectionPaddingBottom}px`;
  if (s.sectionBgColor) wrapperStyle.backgroundColor = s.sectionBgColor;

  return (
    <div style={wrapperStyle} className="qh-builder-section">
      <Component settings={s} theme={theme} />
    </div>
  );
}

export function RenderSections({ sections, theme }: { sections: Section[]; theme: ThemeSettings }) {
  return (
    <>
      {sections.filter((s) => s.visible && s.type !== "BannerStrip").map((section) => (
        <RenderSection key={section.id} section={section} theme={theme} />
      ))}
    </>
  );
}

