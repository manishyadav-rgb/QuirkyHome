import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories } from "@/data/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryCard } from "@/components/home/CategoryCard";
import { getCatalogProducts } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `Buy ${category.name} Online`,
    description: `${category.description} Shop ${category.name.toLowerCase()} products online at QuirkyHome with curated styles for Indian homes.`,
    alternates: {
      canonical: `/category/${category.slug}`,
    },
    openGraph: {
      title: `Buy ${category.name} Online | QuirkyHome`,
      description: category.description,
      images: [{ url: category.image, alt: category.name }],
    },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = categories.find((item) => item.slug === slug);
  if (!category) notFound();
  const products = await getCatalogProducts();
  const categoryProducts = products.filter((product) => product.category === slug);

  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader eyebrow="Category" title={category.name} description={category.description} />
      {categoryProducts.length ? <ProductGrid products={categoryProducts} /> : (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, 5).map((item) => <CategoryCard key={item.slug} category={item} />)}
        </div>
      )}
      <article className="qh-seo-copy mt-10 rounded-lg border border-border bg-background-elevated p-6">
        <h2>Buy {category.name} Products Online</h2>
        <p>{category.description} QuirkyHome keeps browsing simple with mobile-friendly product cards, clear prices, wishlist saving and quick cart actions.</p>
      </article>
    </section>
  );
}
