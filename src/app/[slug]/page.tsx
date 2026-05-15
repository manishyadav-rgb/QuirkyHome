import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBuilderSchema } from "@/lib/builder/fetch-schema";
import { RenderSections } from "@/components/storefront/SectionRenderer";

import { categories } from "@/data/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryCard } from "@/components/home/CategoryCard";
import { getCatalogProducts, getCatalogProduct } from "@/lib/catalog";
import { ProductDetail } from "@/components/product/ProductDetail";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // 1. Try Builder Page
  const builderSchema = await getBuilderSchema("quirkyhome");
  const page = Object.values(builderSchema?.pages || {}).find((p) => p.slug === slug);
  if (page) {
    return {
      title: `${page.name} | QuirkyHome`,
      description: `View ${page.name} on QuirkyHome`,
    };
  }

  // 2. Try Category
  const category = categories.find((item) => item.slug === slug);
  if (category) {
    return {
      title: `Buy ${category.name} Online | QuirkyHome`,
      description: category.description,
      alternates: { canonical: `/${category.slug}` },
      openGraph: {
        title: `Buy ${category.name} Online | QuirkyHome`,
        description: category.description,
        images: [{ url: category.image, alt: category.name }],
      },
    };
  }

  // 3. Try Product
  const product = await getCatalogProduct(slug);
  if (product) {
    return {
      title: `${product.title} - Buy Online`,
      description: product.description,
      alternates: { canonical: `/${product.slug}` },
      openGraph: {
        title: `${product.title} | QuirkyHome`,
        description: product.description,
        images: [{ url: product.image, alt: product.title }],
      },
    };
  }

  return { title: "Page Not Found" };
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;

  // 1. Check Builder Schema
  const builderSchema = await getBuilderSchema("quirkyhome");
  const page = Object.values(builderSchema?.pages || {}).find((p) => p.slug === slug);

  if (page && page.sections && page.sections.length > 0) {
    return (
      <div className="qh-page-container">
        <RenderSections sections={page.sections} theme={builderSchema!.themeSettings} />
      </div>
    );
  }

  // 2. Check Category
  const category = categories.find((item) => item.slug === slug);
  if (category) {
    const products = await getCatalogProducts();
    const categoryProducts = products.filter((p) => p.category === slug);
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

  // 3. Check Product
  const product = await getCatalogProduct(slug);
  if (product) {
    const products = await getCatalogProducts();
    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      image: product.gallery,
      description: product.description,
      sku: product.slug,
      brand: {
        "@type": "Brand",
        name: "QuirkyHome",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating,
        reviewCount: product.reviews,
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: product.price,
        availability: "https://schema.org/InStock",
        url: `https://quirkyhome.in/${product.slug}`,
      },
    };
    // Related products logic (prioritize collection)
    const relatedProducts = products.filter((item) => item.slug !== slug);
    const collectionMatches = product.collection 
      ? relatedProducts.filter((item) => item.collection === product.collection)
      : [];
    
    const displayCollection = product.collection 
      ? products.filter((item) => item.collection === product.collection)
      : [];
    
    const displayRelated = collectionMatches.length > 0 
      ? collectionMatches.slice(0, 4) 
      : relatedProducts.slice(0, 4);

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
        <ProductDetail product={product} collectionProducts={displayCollection} />
        <section className="qh-container qh-section-pad">
          <SectionHeader eyebrow="You may also like" title={collectionMatches.length > 0 ? `More from ${product.collection}` : "More pieces for this mood"} />
          <ProductGrid products={displayRelated} />
        </section>
      </>
    );
  }

  // 4. Not Found
  notFound();
}
