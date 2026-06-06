/**
 * Fetch builder schema for the storefront (server-side).
 * 
 * Used by the dynamic homepage to load sections from DB.
 */

import { query } from "@/lib/db";
import type { BuilderSchema } from "@/lib/builder/types";

function buildDefaultBuilderSchema(siteId: string): BuilderSchema {
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
        sections: [],
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
      let migrated = false;

      // Ensure pages object exists
      if (!schema.pages) {
        schema.pages = {};
        migrated = true;
      }

      // 1. Inject About Us if missing
      if (!schema.pages["about-us"]) {
        schema.pages["about-us"] = {
          name: "About Us",
          slug: "about-us",
          sections: [
            {
              id: "about-seo-1",
              type: "SeoArticle",
              visible: true,
              settings: {
                content: `<h2>About QuirkyHome</h2><p>Welcome to QuirkyHome. We craft premium, playful and warm home decor pieces for Indian homes that refuse to be boring.</p><p>Explore bedding, home furnishing, wall decor, table lamps, dining essentials, kitchen products, bath accessories, planters, storage baskets, showpieces and thoughtful gifts.</p>`
              }
            }
          ]
        };
        migrated = true;
      }

      // 2. Inject Shipping Policy if missing
      if (!schema.pages["shipping"]) {
        schema.pages["shipping"] = {
          name: "Shipping Policy",
          slug: "shipping",
          sections: [
            {
              id: "shipping-seo-1",
              type: "SeoArticle",
              visible: true,
              settings: {
                content: `<h2>Shipping & Delivery</h2><p>We deliver happiness to your doorstep within 3-5 business days across India.</p><p>Free shipping on all prepaid orders above Rs. 999! Standard COD and shipping charges apply below Rs. 999.</p>`
              }
            }
          ]
        };
        migrated = true;
      }

      // 3. Inject Returns Policy if missing
      if (!schema.pages["returns"]) {
        schema.pages["returns"] = {
          name: "Returns & Exchanges",
          slug: "returns",
          sections: [
            {
              id: "returns-seo-1",
              type: "SeoArticle",
              visible: true,
              settings: {
                content: `<h2>Easy Returns & Exchanges</h2><p>Easy 7-day hassle-free return and exchange policy.</p><p>Return requests can be initiated easily from your account orders dashboard. We pick up return products within 48 hours.</p>`
              }
            }
          ]
        };
        migrated = true;
      }

      // 4. Inject Track Order if missing
      if (!schema.pages["track-order"]) {
        schema.pages["track-order"] = {
          name: "Track Order",
          slug: "track-order",
          sections: [
            {
              id: "track-seo-1",
              type: "SeoArticle",
              visible: true,
              settings: {
                content: `<h2>Track Your Order</h2><p>Enter your tracking number or check your Orders section in your account dashboard to track live shipping updates.</p><p>For live order status, check your SMS updates or contact support at support@quirkyhome.com.</p>`
              }
            }
          ]
        };
        migrated = true;
      }

      // Migrate old schemas missing new fields
      const c = schema.themeSettings?.colors;
      if (c && !c.elevated) {
        c.elevated = c.surface || "#ffffff";
        migrated = true;
      }
      if (c && !c.accent) {
        c.accent = "#ffd86f";
        migrated = true;
      }

      if (migrated) {
        await query(
          "update builder_pages set schema_json = $1, updated_at = now() where id = 'main' and site_id = $2",
          [JSON.stringify(schema), siteId]
        );
      }

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
