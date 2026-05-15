import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildDefaultBuilderSchema(siteId: string) {
  const siteTitle = siteId === "quirkyhome" ? "QuirkyHome" : siteId.toUpperCase();
  return {
    themeSettings: {
      colors: {
        primary: "#008060",
        secondary: "#5c6ac4",
        background: "#ffffff",
        surface: "#f6f6f7",
        text: "#1a1a1a",
        textMuted: "#6d7175",
        accent: "#b98900",
        border: "#e1e3e5",
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
          {
            id: "banner-strip-1",
            type: "BannerStrip",
            visible: true,
            settings: {
              text: "Festive Home Refresh Sale - Up to 60% Off | Free shipping above Rs. 999",
              bgColor: "#008060",
              textColor: "#ffffff",
              link: "",
            },
          },
          {
            id: "hero-banner-1",
            type: "HeroBanner",
            visible: true,
            settings: {
              heading: "Buy Home Decor Items Online for Every Indian Home",
              subheading: "Shop bedsheets, wall decor, table lamps, kitchen essentials, dining pieces, planters, gifts, and curated home accessories at friendly prices.",
              badgeText: "Festive Home Refresh Sale",
              button1Text: "Shop the Sale",
              button1Link: "/search",
              button2Text: "Explore Collections",
              button2Link: "/search",
              imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80",
              feature1: "Fast delivery",
              feature2: "Secure checkout",
              feature3: "Curated picks",
            },
          },
          {
            id: "search-band-1",
            type: "SearchBand",
            visible: true,
            settings: {
              label: "Search for",
              chips: "Bedsheets, Artificial Plants, Photo Frames, Wall Clocks, Canvas Paintings, Table Lamps, Cushion Covers",
            },
          },
          {
            id: "category-grid-1",
            type: "CategoryGrid",
            visible: true,
            settings: {
              eyebrow: "Shop by category",
              heading: "Home decor, furnishing and essentials",
              subheading: "Find bedding, wall decor, lighting, kitchen, dining, bath, garden, gifts, storage and showpieces in one place.",
            },
          },
          {
            id: "collections-section-1",
            type: "CollectionsSection",
            visible: true,
            settings: {
              eyebrow: "Collections",
              heading: "Shop by collection",
              subheading: "Curated product sets to help you discover your style.",
            },
          },
          {
            id: "product-grid-1",
            type: "ProductGrid",
            visible: true,
            settings: {
              eyebrow: "Sale picks",
              heading: "Premium finds, friendly prices",
              subheading: "Shop bestselling home decor products with clear pricing, ratings, wishlist and add-to-cart actions.",
            },
          },
          {
            id: "promises-section-1",
            type: "PromisesSection",
            visible: true,
            settings: {
              eyebrow: "Why choose us",
              heading: "A calmer, warmer way to shop for home",
            },
          },
          {
            id: "newsletter-1",
            type: "Newsletter",
            visible: true,
            settings: {
              eyebrow: "Decor notes",
              heading: "Ideas, offers and new drops",
              subheading: "Get room styling inspiration, festive sale alerts and new home essentials in your inbox.",
              buttonText: "Join Newsletter",
            },
          },
          {
            id: "seo-article-1",
            type: "SeoArticle",
            visible: true,
            settings: {
              content: `<h2>${siteTitle} - Buy Home Decor Items Online in India</h2><p>${siteTitle} is built for people who want beautiful home decor without making shopping feel complicated. Explore bedding, home furnishing, wall decor, table lamps, dining essentials, kitchen products, bath accessories, planters, storage baskets, showpieces and thoughtful gifts for Indian homes.</p><h2>Shop Home Decor by Category</h2><p>Whether you are refreshing a bedroom, setting up a living room, styling a dining table or choosing a housewarming gift, our category-led shopping experience helps you find the right product quickly. Every product card keeps price, discount, rating, wishlist and add-to-cart actions easy to scan on mobile and desktop.</p>`,
            },
          },
        ],
      },
    },
  };
}

function isLegacyBuilderSchema(schema: any) {
  const sections = schema?.pages?.home?.sections;
  if (!Array.isArray(sections)) return true;
  // Empty sections is a valid state (merchant intentionally cleared home page).
  // Do not auto-upgrade such schemas to defaults.
  if (sections.length === 0) return false;
  const types = sections.map((s: any) => s?.type).filter(Boolean);
  return types.includes("FeaturedCollection") || !types.includes("SearchBand") || !types.includes("BannerStrip");
}

// GET - Load saved builder schema for a site
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("site_id") || "quirkyhome";

  try {
    // Ensure table exists
    await query(`
      create table if not exists builder_pages (
        id varchar(50) not null,
        schema_json jsonb not null,
        site_id varchar(50) not null default 'quirkyhome',
        updated_at timestamptz not null default now(),
        primary key (id, site_id)
      )
    `);

    const result = await query<{ schema_json: any }>(
      "select schema_json from builder_pages where id = 'main' and site_id = $1 limit 1",
      [siteId],
    );
    if (result.rows.length > 0) {
      const existing = result.rows[0].schema_json;
      if (isLegacyBuilderSchema(existing)) {
        const upgraded = buildDefaultBuilderSchema(siteId);
        await query(
          "update builder_pages set schema_json = $1, updated_at = now() where id = 'main' and site_id = $2",
          [JSON.stringify(upgraded), siteId],
        );
        return NextResponse.json({ schema: upgraded }, { headers: { "Cache-Control": "no-store" } });
      }
      return NextResponse.json({ schema: existing }, { headers: { "Cache-Control": "no-store" } });
    }
    const fallback = await query<{ schema_json: any }>(
      "select schema_json from builder_pages where id = 'main' and site_id = 'quirkyhome' limit 1",
    );
    const seeded = fallback.rows.length > 0 && !isLegacyBuilderSchema(fallback.rows[0].schema_json)
      ? fallback.rows[0].schema_json
      : buildDefaultBuilderSchema(siteId);
    await query(
      `insert into builder_pages (id, schema_json, site_id, updated_at)
       values ('main', $1, $2, now())
       on conflict (id, site_id) do nothing`,
      [JSON.stringify(seeded), siteId],
    );
    return NextResponse.json({ schema: seeded }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ schema: null }, { headers: { "Cache-Control": "no-store" } });
  }
}

// POST - Save builder schema (admin only)
export async function POST(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || (auth.role !== "admin" && auth.role !== "team")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { schema, site_id } = body.schema ? { schema: body.schema, site_id: body.site_id } : { schema: body, site_id: "quirkyhome" };
  const siteId = site_id || "quirkyhome";

  try {
    // Ensure table exists
    await query(`
      create table if not exists builder_pages (
        id varchar(50) not null,
        schema_json jsonb not null,
        site_id varchar(50) not null default 'quirkyhome',
        updated_at timestamptz not null default now(),
        primary key (id, site_id)
      )
    `);

    // Upsert
    await query(
      `insert into builder_pages (id, schema_json, site_id, updated_at)
       values ('main', $1, $2, now())
       on conflict (id, site_id) do update set schema_json = $1, updated_at = now()`,
      [JSON.stringify(schema), siteId],
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
