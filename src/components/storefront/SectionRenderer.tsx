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

/* ─── Import actual beautiful components ─────────────────────── */
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductGrid as ActualProductGrid } from "@/components/product/ProductGrid";
import { getCatalogProducts } from "@/lib/catalog";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Sparkles, Truck, Undo2, WalletCards } from "lucide-react";

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

import { ProductCard } from "@/components/product/ProductCard";

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

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${mobileCols}, 1fr)`,
    ["--gap-mobile" as string]: `${mobileGap}px`,
    ["--gap-desktop" as string]: `${gap}px`,
  } as React.CSSProperties;

  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader eyebrow={settings.eyebrow} title={settings.heading} description={settings.subheading} />
      {limitedProducts.length ? (
        <div style={gridStyle} className={`[gap:var(--gap-mobile)] md:[gap:var(--gap-desktop)] md:!grid-cols-3 lg:!grid-cols-${cols}`}>
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

/* ─── RichText ────────────────────────────────────────── */

function StorefrontRichText({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="qh-container qh-section-pad text-center">
      <div dangerouslySetInnerHTML={{ __html: settings.content || "" }} />
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

/* ─── ImageBanner ─────────────────────────────────────────── */
function StorefrontImageBanner({ settings }: { settings: Record<string, any> }) {
  return (
    <section className="relative w-full" style={{ height: settings.height || "400px" }}>
      <img src={settings.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-black" style={{ opacity: (settings.overlayOpacity || 40) / 100 }} />
      <div className={`absolute inset-0 flex flex-col justify-center px-8 text-${settings.textAlign || "center"}`}>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">{settings.heading}</h2>
        <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">{settings.subheading}</p>
        {settings.buttonText && (
          <div><Link href={settings.buttonLink || "#"} className="inline-block bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition shadow-lg">{settings.buttonText}</Link></div>
        )}
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
  return (
    <section className="qh-container qh-section-pad">
      <h2 className="text-3xl font-bold mb-10 text-center text-text-main">{settings.heading}</h2>
      <div className={`grid gap-8 md:grid-cols-${cols}`}>
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
  
  const s = section.settings;
  const wrapperStyle: React.CSSProperties = {};
  if (s.sectionPaddingTop) wrapperStyle.paddingTop = `${s.sectionPaddingTop}px`;
  if (s.sectionPaddingBottom) wrapperStyle.paddingBottom = `${s.sectionPaddingBottom}px`;
  if (s.sectionBgColor) wrapperStyle.backgroundColor = s.sectionBgColor;

  return (
    <div style={wrapperStyle}>
      <Component settings={s} theme={theme} />
    </div>
  );
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
