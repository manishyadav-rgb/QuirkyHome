import { getPageItems, sitemapXml } from "@/lib/sitemaps";

export async function GET() {
  const xml = sitemapXml(await getPageItems());
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

