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

function htmlToPlainText(input: string) {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  // 1. Try Builder Page
  const builderSchema = await getBuilderSchema("quirkyhome");
  const page = Object.values(builderSchema?.pages || {}).find((p) => p.slug === slug);
  if (page) {
    const seoSection = page.sections?.find((s: any) => s?.type === "SeoArticle" && s?.settings?.content);
    const seoText = seoSection ? htmlToPlainText(String(seoSection.settings.content)) : "";
    const description = seoText
      ? seoText.slice(0, 160)
      : `Explore ${page.name} on QuirkyHome with curated products and easy shopping.`;
    return {
      title: page.name,
      description,
      alternates: { canonical: `/${slug}` },
      openGraph: {
        title: page.name,
        description,
        type: "website",
      },
    };
  }

  // 2. Try Category
  const category = categories.find((item) => item.slug === slug);
  if (category) {
    return {
      title: `Buy ${category.name} Online`,
      description: category.description,
      alternates: { canonical: `/${category.slug}` },
      openGraph: {
        title: `Buy ${category.name} Online`,
        description: category.description,
        images: [{ url: category.image, alt: category.name }],
      },
    };
  }

  // 3. Try Product
  const product = await getCatalogProduct(slug);
  if (product) {
    const fallbackDescription = `Buy ${product.title} online at QuirkyHome. Explore latest pricing, offers and fast delivery across India.`;
    const description = (product.description || "").trim() || fallbackDescription;
    return {
      title: `${product.title} - Buy Online`,
      description,
      alternates: { canonical: `/${product.slug}` },
      openGraph: {
        title: `${product.title} | QuirkyHome`,
        description,
        url: `https://quirkyhome.in/${product.slug}`,
        type: "website",
        images: [{ url: product.image, alt: product.title }],
      },
      twitter: {
        card: "summary_large_image",
        title: `${product.title} | QuirkyHome`,
        description,
        images: [product.image],
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
    const productDescription = (product.description || "").trim() || `Buy ${product.title} online at QuirkyHome.`;
    const inStock = typeof product.stock === "number" ? product.stock > 0 : true;
    const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10);

    const breadcrumbJsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://quirkyhome.in/" },
        { "@type": "ListItem", position: 2, name: product.category || "Products", item: `https://quirkyhome.in/${product.category || ""}` },
        { "@type": "ListItem", position: 3, name: product.title, item: `https://quirkyhome.in/${product.slug}` },
      ],
    };

    const productJsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.title,
      image: product.gallery,
      description: productDescription,
      sku: product.slug,
      brand: {
        "@type": "Brand",
        name: "QuirkyHome",
      },
      offers: {
        "@type": "Offer",
        priceCurrency: "INR",
        price: product.price,
        availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        priceValidUntil,
        seller: {
          "@type": "Organization",
          name: "QuirkyHome",
        },
        url: `https://quirkyhome.in/${product.slug}`,
      },
    } as Record<string, any>;
    if (product.reviews > 0 && product.rating > 0) {
      productJsonLd.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: Number(product.rating.toFixed(1)),
        reviewCount: product.reviews,
      };
    }
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
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
