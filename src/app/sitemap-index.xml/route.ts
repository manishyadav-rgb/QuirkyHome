import { BASE_URL, sitemapIndexXml } from "@/lib/sitemaps";

export async function GET() {
  const xml = sitemapIndexXml([
    `${BASE_URL}/products-sitemap.xml`,
    `${BASE_URL}/categories-sitemap.xml`,
    `${BASE_URL}/collections-sitemap.xml`,
    `${BASE_URL}/pages-sitemap.xml`,
    `${BASE_URL}/posts-sitemap.xml`,
  ]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

