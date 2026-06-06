import type { Metadata } from "next";
import { SearchBar } from "@/components/ui/SearchBar";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { categories, searchChips } from "@/data/categories";
import { getCatalogProducts } from "@/lib/catalog";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search Home Decor Products",
  description: "Search bedsheets, wall decor, lamps, dining products, kitchen essentials, gifts and home decor items on QuirkyHome.",
  alternates: {
    canonical: "/search",
  },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const products = await getCatalogProducts();
  const query = q?.toLowerCase().trim() ?? "";
  
  let filtered = products;

  if (query) {
    // Tokenize search query by spaces or punctuation, filter out very short words
    const tokens = query.split(/[\s,\-_]+/).filter(t => t.length > 1);

    if (tokens.length > 0) {
      const scoredProducts = products.map((product) => {
        let score = 0;
        const titleLower = product.title.toLowerCase();
        const descLower = (product.description || "").toLowerCase();
        const catLower = (product.category || "").toLowerCase();
        const collLower = (product.collection || "").toLowerCase();

        // 1. Exact phrase matches (highest priority)
        if (titleLower.includes(query)) score += 100;
        if (catLower.includes(query)) score += 50;

        // 2. Individual token matching
        tokens.forEach((token) => {
          // Exact word match in title
          if (titleLower === token || titleLower.startsWith(token + " ") || titleLower.endsWith(" " + token) || titleLower.includes(" " + token + " ")) {
            score += 40;
          } else if (titleLower.includes(token)) {
            score += 20; // Partial match in title
          }

          // Category & Collection matching
          if (catLower.includes(token) || collLower.includes(token)) {
            score += 15;
          }

          // Description matching
          if (descLower.includes(token)) {
            score += 5;
          }
        });

        return { product, score };
      });

      // Filter out items with 0 score, and sort by relevance score descending
      filtered = scoredProducts
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.product);
    } else {
      // Fallback for single character searches
      filtered = products.filter((product) => 
        product.title.toLowerCase().includes(query) || 
        (product.category || "").toLowerCase().includes(query)
      );
    }
  }

  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader eyebrow="Search" title={q ? `Results for ${q}` : "Find your next home crush"} description="Search across decor, categories, moods, and gifting ideas." />
      <SearchBar className="qh-page-search mb-6" />
      <div className="mb-8 flex flex-wrap gap-3">
        {searchChips.map((chip) => <Link key={chip} href={`/search?q=${encodeURIComponent(chip)}`} className="rounded-full border border-border bg-background-elevated px-4 py-2 text-sm font-semibold text-text-muted hover:text-brand-primary">{chip}</Link>)}
      </div>
      {filtered.length ? <ProductGrid products={filtered} /> : (
        <div className="qh-card p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">No products found</h2>
          <p className="mt-2 text-text-muted">Try a category like {categories[0].name}, {categories[1].name}, or {categories[2].name}.</p>
        </div>
      )}
    </section>
  );
}

