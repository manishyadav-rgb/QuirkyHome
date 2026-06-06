import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [
      "https://quirkyhome.in/sitemap.xml",
      "https://quirkyhome.in/sitemap-index.xml",
      "https://quirkyhome.in/sitemaps/index.xml",
    ],
  };
}
