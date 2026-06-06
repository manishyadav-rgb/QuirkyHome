import type { MetadataRoute } from "next";
import {
  BASE_URL,
  getCategoryItems,
  getCollectionItems,
  getPageItems,
  getPostItems,
  getProductItems,
} from "@/lib/sitemaps";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, collections, pages, posts] = await Promise.all([
    getProductItems(),
    getCategoryItems(),
    getCollectionItems(),
    getPageItems(),
    getPostItems(),
  ]);

  const all = [...pages, ...categories, ...collections, ...products, ...posts];
  const seen = new Set<string>();

  return all
    .filter((item) => item.loc.startsWith(BASE_URL))
    .filter((item) => {
      if (seen.has(item.loc)) return false;
      seen.add(item.loc);
      return true;
    })
    .map((item) => ({
      url: item.loc,
      lastModified: item.lastmod ? new Date(item.lastmod) : new Date(),
      changeFrequency: item.changefreq,
      priority: item.priority,
    }));
}
