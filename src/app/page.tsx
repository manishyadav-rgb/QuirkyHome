import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { CollectionsSection } from "@/components/home/CollectionsSection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Button } from "@/components/ui/Button";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCatalogProducts } from "@/lib/catalog";
import { getBuilderSchema } from "@/lib/builder/fetch-schema";
import { RenderSections } from "@/components/storefront/SectionRenderer";
import { ShieldCheck, Sparkles, Truck, Undo2, WalletCards } from "lucide-react";
import Link from "next/link";
import { searchChips } from "@/data/categories";

export const dynamic = "force-dynamic";

const promises = [
  { icon: Sparkles, title: "Curated decor", text: "Thoughtfully selected pieces with warmth and personality." },
  { icon: ShieldCheck, title: "Premium quality", text: "Affordable luxury without fragile showroom energy." },
  { icon: Undo2, title: "Easy returns", text: "A smoother post-purchase experience for real life." },
  { icon: Truck, title: "Fast shipping", text: "Quick dispatch across India on everyday favourites." },
  { icon: WalletCards, title: "Secure payments", text: "UPI, cards, wallets, and protected checkout flows." },
];

export const metadata: Metadata = {
  title: "Buy Home Decor Items & Essentials Online",
  description: "Buy home decor items online at QuirkyHome. Shop bedding, wall decor, lighting, kitchen, dining, bath, garden, gifts and storage essentials.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  // Try to load builder schema first
  const builderSchema = await getBuilderSchema("quirkyhome");

  // If builder has a home page defined (even if empty), render it dynamically
  if (builderSchema?.pages?.home) {
    const homePage = builderSchema.pages.home;
    const theme = builderSchema.themeSettings;

    return (
      <>
        <RenderSections sections={homePage.sections || []} theme={theme} />
      </>
    );
  }

  // Fallback: original hardcoded homepage (when no builder data exists at all)
  const products = await getCatalogProducts();

  return (
    <>
      <HeroSection />
      <section className="qh-market-band">
        <div className="qh-container flex flex-wrap items-center gap-3 py-4">
          <span className="text-sm font-black text-text-main">Search for</span>
          {searchChips.map((chip) => (
            <Link key={chip} href={`/search?q=${encodeURIComponent(chip)}`} className="rounded-full border border-text-main/10 bg-background-elevated px-4 py-2 text-sm font-bold text-text-main shadow-soft transition-all duration-base hover:border-brand-primary">
              {chip}
            </Link>
          ))}
        </div>
      </section>
      <CategoryGrid />
      <CollectionsSection />
      <section className="qh-container qh-section-pad">
        <SectionHeader eyebrow="Sale picks" title="Premium finds, friendly prices" description="Shop bestselling home decor products with clear pricing, ratings, wishlist and add-to-cart actions." />
        {products.length ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-lg border border-border bg-background-elevated p-6 text-text-muted">
            No published products yet. Add products from QH Admin to Add Product.
          </div>
        )}
      </section>
      <section className="qh-container qh-section-pad">
        <SectionHeader align="center" eyebrow="Why choose us" title="A calmer, warmer way to shop for home" />
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
      <section className="qh-container qh-section-pad">
        <div className="grid gap-6 rounded-lg bg-background-soft p-6 md:qh-newsletter-grid md:items-center md:p-8">
          <div>
            <SectionHeader eyebrow="Decor notes" title="Ideas, offers and new drops" description="Get room styling inspiration, festive sale alerts and new home essentials in your inbox." />
            <ThemeSwitcher />
          </div>
          <form className="grid gap-3 md:min-w-80">
            <input className="qh-focus h-button-lg rounded-full border border-border bg-background-elevated px-5 text-text-main placeholder:text-text-soft" placeholder="Enter email for decor notes" />
            <Button type="button" size="lg">Join Newsletter</Button>
          </form>
        </div>
      </section>
      <section className="qh-container qh-section-pad">
        <article className="qh-seo-copy max-w-none rounded-lg border border-border bg-background-elevated p-6 md:p-8">
          <h2>QuirkyHome - Buy Home Decor Items Online in India</h2>
          <p>
            QuirkyHome is built for people who want beautiful home decor without making shopping feel complicated.
            Explore bedding, home furnishing, wall decor, table lamps, dining essentials, kitchen products, bath accessories,
            planters, storage baskets, showpieces and thoughtful gifts for Indian homes.
          </p>
          <h2>Shop Home Decor by Category</h2>
          <p>
            Whether you are refreshing a bedroom, setting up a living room, styling a dining table or choosing a housewarming gift,
            our category-led shopping experience helps you find the right product quickly. Every product card keeps price, discount,
            rating, wishlist and add-to-cart actions easy to scan on mobile and desktop.
          </p>
          <h2>Why QuirkyHome Works Better for Everyday Shopping</h2>
          <p>
            The platform is designed for fast browsing, clean product discovery, phone OTP login, local cart and wishlist persistence,
            secure checkout readiness and SEO-friendly pages. That means shoppers can discover products, save favourites and return
            later without losing their selections.
          </p>
        </article>
      </section>
    </>
  );
}
