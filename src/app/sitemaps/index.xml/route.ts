import { BASE_URL, sitemapIndexXml } from "@/lib/sitemaps";

export async function GET() {
  const xml = sitemapIndexXml([
    `${BASE_URL}/sitemaps/products.xml`,
    `${BASE_URL}/sitemaps/categories.xml`,
    `${BASE_URL}/sitemaps/collections.xml`,
    `${BASE_URL}/sitemaps/pages.xml`,
    `${BASE_URL}/sitemaps/posts.xml`,
  ]);

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

