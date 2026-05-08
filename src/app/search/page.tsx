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
  const query = q?.toLowerCase() ?? "";
  const filtered = query
    ? products.filter((product) => `${product.title} ${product.description} ${product.category}`.toLowerCase().includes(query))
    : products;

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

