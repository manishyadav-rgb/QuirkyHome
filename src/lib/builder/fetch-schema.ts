/**
 * Fetch builder schema for the storefront (server-side).
 * 
 * Used by the dynamic homepage to load sections from DB.
 */

import { query } from "@/lib/db";
import type { BuilderSchema } from "@/lib/builder/types";

function buildDefaultBuilderSchema(siteId: string): BuilderSchema {
  const siteTitle = siteId === "quirkyhome" ? "QuirkyHome" : siteId.toUpperCase();
  return {
    themeSettings: {
      colors: {
        primary: "#111111",
        secondary: "#5f3f00",
        accent: "#ffd86f",
        background: "#fffdf7",
        surface: "#fff4cf",
        elevated: "#ffffff",
        text: "#111111",
        textMuted: "#555555",
        border: "#e8e0d0",
      },
      typography: {
        fontFamily: "Inter, system-ui, sans-serif",
        headingFamily: "Inter, system-ui, sans-serif",
        baseSize: "16px",
        headingWeight: "700",
      },
      spacing: {
        sectionPadding: "64px",
        containerMax: "1200px",
        borderRadius: "8px",
      },
    },
    pages: {
      home: {
        name: "Home Page",
        slug: "home",
        sections: [
          { id: "banner-strip-1", type: "BannerStrip", visible: true, settings: { text: "Festive Home Refresh Sale - Up to 60% Off | Free shipping above Rs. 999", bgColor: "#008060", textColor: "#ffffff", link: "" } },
          { id: "hero-banner-1", type: "HeroBanner", visible: true, settings: { heading: "Buy Home Decor Items Online for Every Indian Home", subheading: "Shop bedsheets, wall decor, table lamps, kitchen essentials, dining pieces, planters, gifts, and curated home accessories at friendly prices.", badgeText: "Festive Home Refresh Sale", button1Text: "Shop the Sale", button1Link: "/search", button2Text: "Explore Collections", button2Link: "/search", imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80", feature1: "Fast delivery", feature2: "Secure checkout", feature3: "Curated picks" } },
          { id: "search-band-1", type: "SearchBand", visible: true, settings: { label: "Search for", chips: "Bedsheets, Artificial Plants, Photo Frames, Wall Clocks, Canvas Paintings, Table Lamps, Cushion Covers" } },
          { id: "category-grid-1", type: "CategoryGrid", visible: true, settings: { eyebrow: "Shop by category", heading: "Home decor, furnishing and essentials", subheading: "Find bedding, wall decor, lighting, kitchen, dining, bath, garden, gifts, storage and showpieces in one place." } },
          { id: "collections-section-1", type: "CollectionsSection", visible: true, settings: { eyebrow: "Collections", heading: "Shop by collection", subheading: "Curated product sets to help you discover your style." } },
          { id: "product-grid-1", type: "ProductGrid", visible: true, settings: { eyebrow: "Sale picks", heading: "Premium finds, friendly prices", subheading: "Shop bestselling home decor products with clear pricing, ratings, wishlist and add-to-cart actions." } },
          { id: "promises-section-1", type: "PromisesSection", visible: true, settings: { eyebrow: "Why choose us", heading: "A calmer, warmer way to shop for home" } },
          { id: "newsletter-1", type: "Newsletter", visible: true, settings: { eyebrow: "Decor notes", heading: "Ideas, offers and new drops", subheading: "Get room styling inspiration, festive sale alerts and new home essentials in your inbox.", buttonText: "Join Newsletter" } },
          { id: "seo-article-1", type: "SeoArticle", visible: true, settings: { content: `<h2>${siteTitle} - Buy Home Decor Items Online in India</h2><p>${siteTitle} is built for people who want beautiful home decor without making shopping feel complicated. Explore bedding, home furnishing, wall decor, table lamps, dining essentials, kitchen products, bath accessories, planters, storage baskets, showpieces and thoughtful gifts for Indian homes.</p><h2>Shop Home Decor by Category</h2><p>Whether you are refreshing a bedroom, setting up a living room, styling a dining table or choosing a housewarming gift, our category-led shopping experience helps you find the right product quickly. Every product card keeps price, discount, rating, wishlist and add-to-cart actions easy to scan on mobile and desktop.</p>` } },
        ],
      },
    },
  };
}

export async function getBuilderSchema(siteId: string = "quirkyhome"): Promise<BuilderSchema | null> {
  try {
    const result = await query<{ schema_json: BuilderSchema }>(
      "select schema_json from builder_pages where id = 'main' and site_id = $1 limit 1",
      [siteId],
    );

    if (result.rows.length > 0 && result.rows[0].schema_json) {
      const schema = result.rows[0].schema_json as any;

      // Migrate old schemas missing new fields
      const c = schema.themeSettings?.colors;
      if (c && !c.elevated) c.elevated = c.surface || "#ffffff";
      if (c && !c.accent) c.accent = "#ffd86f";
      return schema as BuilderSchema;
    }

    const seeded = buildDefaultBuilderSchema(siteId);
    await query(
      `insert into builder_pages (id, schema_json, site_id, updated_at)
       values ('main', $1, $2, now())
       on conflict (id, site_id) do nothing`,
      [JSON.stringify(seeded), siteId],
    );
    return seeded;
  } catch {
    return null;
  }
}
