import { categories } from "@/data/categories";
import { collections as staticCollections } from "@/data/collections";
import { products as staticProducts } from "@/data/products";
import { listAdminProducts } from "@/lib/admin-products";
import { query } from "@/lib/db";

export type SitemapItem = {
  loc: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: number;
};

export const BASE_URL = "https://quirkyhome.in";

const STATIC_PAGES = [
  "/",
  "/search",
  "/cart",
  "/wishlist",
  "/account",
  "/checkout",
  "/track-order",
  "/about-us",
  "/shipping",
  "/returns",
];

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dedupe(items: SitemapItem[]): SitemapItem[] {
  const seen = new Set<string>();
  const out: SitemapItem[] = [];
  for (const item of items) {
    if (seen.has(item.loc)) continue;
    seen.add(item.loc);
    out.push(item);
  }
  return out;
}

export function sitemapXml(items: SitemapItem[]): string {
  const rows = dedupe(items)
    .map((item) => {
      const fields = [
        `<loc>${escapeXml(item.loc)}</loc>`,
        item.lastmod ? `<lastmod>${escapeXml(item.lastmod)}</lastmod>` : "",
        item.changefreq ? `<changefreq>${item.changefreq}</changefreq>` : "",
        typeof item.priority === "number" ? `<priority>${item.priority.toFixed(1)}</priority>` : "",
      ]
        .filter(Boolean)
        .join("");
      return `<url>${fields}</url>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}</urlset>`;
}

export function sitemapIndexXml(urls: string[]): string {
  const rows = [...new Set(urls)]
    .map((url) => `<sitemap><loc>${escapeXml(url)}</loc></sitemap>`)
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${rows}</sitemapindex>`;
}

export async function getProductItems(): Promise<SitemapItem[]> {
  const now = new Date().toISOString();
  try {
    const rows = await listAdminProducts();
    if (rows.length > 0) {
      return dedupe(
        rows
          .filter((r) => r.slug && r.is_active)
          .map((r) => ({
            loc: `${BASE_URL}/${r.slug}`,
            lastmod: r.created_at ? new Date(r.created_at).toISOString() : now,
            changefreq: "weekly",
            priority: 0.8,
          })),
      );
    }
  } catch {}

  return staticProducts.map((p) => ({
    loc: `${BASE_URL}/${p.slug}`,
    lastmod: now,
    changefreq: "weekly",
    priority: 0.8,
  }));
}

export async function getCategoryItems(): Promise<SitemapItem[]> {
  const now = new Date().toISOString();
  try {
    const rows = await query<{ slug: string }>("select slug from categories where slug is not null order by slug asc");
    if (rows.rows.length > 0) {
      return rows.rows.map((c) => ({
        loc: `${BASE_URL}/${c.slug}`,
        lastmod: now,
        changefreq: "weekly",
        priority: 0.9,
      }));
    }
  } catch {}

  return categories.map((c) => ({
    loc: `${BASE_URL}/${c.slug}`,
    lastmod: now,
    changefreq: "weekly",
    priority: 0.9,
  }));
}

export async function getCollectionItems(): Promise<SitemapItem[]> {
  const now = new Date().toISOString();
  try {
    const rows = await query<{ slug: string }>(
      "select slug from collections where is_active = true and slug is not null order by sort_order asc, created_at desc",
    );
    if (rows.rows.length > 0) {
      return rows.rows.map((c) => ({
        loc: `${BASE_URL}/collections/${c.slug}`,
        lastmod: now,
        changefreq: "weekly",
        priority: 0.7,
      }));
    }
  } catch {}

  return staticCollections.map((c) => ({
    loc: `${BASE_URL}/collections/${c.slug}`,
    lastmod: now,
    changefreq: "weekly",
    priority: 0.7,
  }));
}

export async function getPageItems(): Promise<SitemapItem[]> {
  const now = new Date().toISOString();
  const items: SitemapItem[] = STATIC_PAGES.map((p) => ({
    loc: `${BASE_URL}${p}`,
    lastmod: now,
    changefreq: p === "/" ? "daily" : "monthly",
    priority: p === "/" ? 1.0 : 0.6,
  }));

  try {
    const rows = await query<{ schema_json: any }>(
      "select schema_json from builder_pages where id = 'main' and site_id = $1 limit 1",
      ["quirkyhome"],
    );
    const schema = rows.rows[0]?.schema_json;
    const pages = schema?.pages && typeof schema.pages === "object" ? Object.values(schema.pages) : [];
    for (const page of pages as Array<{ slug?: string }>) {
      const slug = String(page?.slug || "").trim().replace(/^\/+/, "");
      if (!slug || slug === "home") continue;
      items.push({
        loc: `${BASE_URL}/${slug}`,
        lastmod: now,
        changefreq: "monthly",
        priority: 0.6,
      });
    }
  } catch {}

  return dedupe(items);
}

export async function getPostItems(): Promise<SitemapItem[]> {
  const now = new Date().toISOString();
  const candidates = [
    "select slug, coalesce(updated_at, created_at) as changed_at from posts where slug is not null",
    "select slug, coalesce(updated_at, created_at) as changed_at from blog_posts where slug is not null",
  ];

  for (const sql of candidates) {
    try {
      const rows = await query<{ slug: string; changed_at: string | null }>(sql);
      if (rows.rows.length > 0) {
        return rows.rows.map((p) => ({
          loc: `${BASE_URL}/posts/${p.slug}`,
          lastmod: p.changed_at ? new Date(p.changed_at).toISOString() : now,
          changefreq: "weekly",
          priority: 0.6,
        }));
      }
    } catch {}
  }

  return [];
}

