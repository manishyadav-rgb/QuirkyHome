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

/* ─── HeroBanner (Vaaree Style) ───────────────────────────────────────────── */

function StorefrontHeroBanner({ settings, theme }: { settings: Record<string, any>; theme: ThemeSettings }) {
  return (
    <section className="bg-background-elevated">
      <div className="qh-container grid gap-6 py-6 md:qh-hero-grid md:py-10 lg:py-12">
        <div className="flex flex-col justify-center">
          {settings.badgeText && (
            <div className="mb-5 w-fit rounded-full bg-brand-accent/10 px-3 py-1 text-xs font-bold text-brand-accent">
              ✨ {settings.badgeText}
            </div>
          )}
          <h1 className="font-display text-4xl font-black leading-tight text-text-main md:text-5xl">
            {settings.heading}
          </h1>
          <p className="mt-5 max-w-narrow text-lg leading-relaxed text-text-muted text-pretty">
            {settings.subheading}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {settings.button1Text && (
              <Link href={settings.button1Link || "#"} className="inline-flex h-12 items-center justify-center rounded-full bg-brand-primary px-6 font-bold text-white transition-colors hover:bg-brand-primary-hover">
                {settings.button1Text}
              </Link>
            )}
            {settings.button2Text && (
              <Link href={settings.button2Link || "#"} className="inline-flex h-12 items-center justify-center rounded-full border-2 border-border bg-transparent px-6 font-bold text-text-main transition-colors hover:border-brand-primary hover:text-brand-primary">
                {settings.button2Text}
              </Link>
            )}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm font-bold text-text-main">
            {settings.feature1 && <div className="flex items-center gap-2">🚚 {settings.feature1}</div>}
            {settings.feature2 && <div className="flex items-center gap-2">🛡️ {settings.feature2}</div>}
            {settings.feature3 && <div className="flex items-center gap-2">✨ {settings.feature3}</div>}
          </div>
        </div>
        <div className="relative qh-hero-media overflow-hidden rounded-lg bg-background-soft">
          <img src={settings.imageUrl || "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80"} alt="" className="h-full w-full object-cover" />
          <div className="absolute bottom-5 left-5 rounded-lg border border-border bg-background-elevated p-4 shadow-dropdown">
            <p className="text-sm font-bold text-brand-primary">Up to 60% Off</p>
            <p className="text-sm text-text-muted">Bedding, lamps, wall art and more</p>
          </div>
        </div>
      </div>
    </section>
  );
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

/* ─── CategoryGrid ───────────────────────────────────────────── */
import { CategoryGrid as ActualCategoryGrid } from "@/components/home/CategoryGrid";
function StorefrontCategoryGrid({ settings }: { settings: Record<string, any> }) {
  // Pass settings to override header? For now just render it.
  return (
    <div>
       <ActualCategoryGrid />
    </div>
  );
}

/* ─── CollectionsSection ───────────────────────────────────────────── */
import { CollectionsSection as ActualCollectionsSection } from "@/components/home/CollectionsSection";
function StorefrontCollectionsSection({ settings }: { settings: Record<string, any> }) {
  return (
    <div>
      <ActualCollectionsSection />
    </div>
  );
}

/* ─── ProductGrid ───────────────────────────────────────────── */
import { ProductGrid as ActualProductGrid } from "@/components/product/ProductGrid";
import { getCatalogProducts } from "@/lib/catalog";
import { SectionHeader } from "@/components/ui/SectionHeader";
// We need this to be async or fetch inside... Wait, SectionRenderer is a server component!
async function StorefrontProductGridWrapper({ settings }: { settings: Record<string, any> }) {
  const products = await getCatalogProducts();
  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader eyebrow={settings.eyebrow} title={settings.heading} description={settings.subheading} />
      {products.length ? (
        <ActualProductGrid products={products} />
      ) : (
        <div className="rounded-lg border border-border bg-background-elevated p-6 text-text-muted">
          No published products yet.
        </div>
      )}
    </section>
  );
}

/* ─── PromisesSection ───────────────────────────────────────────── */
import { ShieldCheck, Sparkles, Truck, Undo2, WalletCards } from "lucide-react";
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
      <SectionHeader align="center" eyebrow={settings.eyebrow} title={settings.heading} />
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

/* ─── Newsletter ───────────────────────────────────────────── */
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { Button } from "@/components/ui/Button";
function StorefrontNewsletterVaaree({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad">
      <div className="grid gap-6 rounded-lg bg-background-soft p-6 md:qh-newsletter-grid md:items-center md:p-8">
        <div>
          <SectionHeader eyebrow={settings.eyebrow} title={settings.heading} description={settings.subheading} />
          <ThemeSwitcher />
        </div>
        <form className="grid gap-3 md:min-w-80" onSubmit={(e) => e.preventDefault()}>
          <input className="qh-focus h-button-lg rounded-full border border-border bg-background-elevated px-5 text-text-main placeholder:text-text-soft" placeholder="Enter email for decor notes" />
          <Button type="button" size="lg">{settings.buttonText || "Join Newsletter"}</Button>
        </form>
      </div>
    </section>
  );
}

/* ─── SeoArticle ───────────────────────────────────────────── */
function StorefrontSeoArticle({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad">
      <article 
        className="qh-seo-copy max-w-none rounded-lg border border-border bg-background-elevated p-6 md:p-8"
        dangerouslySetInnerHTML={{ __html: settings.content }}
      />
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

/* ─── Missing Components ────────────────────────────────────────── */

function StorefrontRichText({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad text-center">
      <div dangerouslySetInnerHTML={{ __html: settings.content || "" }} />
    </section>
  );
}

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

function StorefrontFeaturedCollection({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad">
      <h2 className="text-2xl font-bold mb-6 text-center text-text-main">{settings.heading}</h2>
      <div className="text-center text-text-muted">Featured Collection: {settings.collectionId || "None"}</div>
    </section>
  );
}

/* ─── Component Map ────────────────────────────────────────── */

const storefrontComponentMap: Record<string, React.FC<{ settings: Record<string, any>; theme: ThemeSettings }>> = {
  HeroBanner: StorefrontHeroBanner,
  SearchBand: StorefrontSearchBand,
  CategoryGrid: StorefrontCategoryGrid,
  CollectionsSection: StorefrontCollectionsSection,
  ProductGrid: StorefrontProductGridWrapper as unknown as React.FC<any>, // It's async
  PromisesSection: StorefrontPromisesSection,
  Newsletter: StorefrontNewsletterVaaree,
  SeoArticle: StorefrontSeoArticle,
  RichText: StorefrontRichText,
  ImageWithText: StorefrontImageWithText,
  FeaturedCollection: StorefrontFeaturedCollection,
  Testimonials: StorefrontTestimonials,
  BannerStrip: StorefrontBannerStrip,
};

/* ─── Public Renderer ──────────────────────────────────────── */

interface RenderSectionProps {
  section: Section;
  theme: ThemeSettings;
}

export function RenderSection({ section, theme }: RenderSectionProps) {
  if (!section.visible) return null;
  const Component = storefrontComponentMap[section.type];
  if (!Component) return null;
  return <Component settings={section.settings} theme={theme} />;
}

export function RenderSections({ sections, theme }: { sections: Section[]; theme: ThemeSettings }) {
  return (
    <>
      {sections.filter((s) => s.visible).map((section) => (
        <RenderSection key={section.id} section={section} theme={theme} />
      ))}
    </>
  );
}
