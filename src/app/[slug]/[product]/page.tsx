import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getCatalogProducts, getCatalogProduct } from "@/lib/catalog";
import { getRecommendedProducts } from "@/lib/recommendations";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string; product: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug: category, product: productSlug } = await params;
  const product = await getCatalogProduct(productSlug);
  if (!product) return { title: "Page Not Found" };

  const categorySlug = product.category || "bedsheet";
  if (category !== categorySlug) {
    return {
      alternates: { canonical: `/${categorySlug}/${product.slug}` },
    };
  }

  const fallbackDescription = `Buy ${product.title} online at QuirkyHome. Explore latest pricing, offers and fast delivery across India.`;
  const description = (product.description || "").trim() || fallbackDescription;
  return {
    title: `${product.title} - Buy Online`,
    description,
    alternates: { canonical: `/${categorySlug}/${product.slug}` },
    openGraph: {
      title: `${product.title} | QuirkyHome`,
      description,
      url: `https://quirkyhome.in/${categorySlug}/${product.slug}`,
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

export default async function CategoryProductPage({ params }: PageProps) {
  const { slug: category, product: productSlug } = await params;
  const product = await getCatalogProduct(productSlug);
  if (!product) notFound();

  const categorySlug = product.category || "bedsheet";
  if (category !== categorySlug) {
    redirect(`/${categorySlug}/${product.slug}`);
  }

  const products = await getCatalogProducts();
  const productDescription = (product.description || "").trim() || `Buy ${product.title} online at QuirkyHome.`;
  const inStock = typeof product.stock === "number" ? product.stock > 0 : true;
  const priceValidUntil = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString().slice(0, 10);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://quirkyhome.in/" },
      { "@type": "ListItem", position: 2, name: categorySlug, item: `https://quirkyhome.in/${categorySlug}` },
      { "@type": "ListItem", position: 3, name: product.title, item: `https://quirkyhome.in/${categorySlug}/${product.slug}` },
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
      url: `https://quirkyhome.in/${categorySlug}/${product.slug}`,
    },
  } as Record<string, any>;
  if (product.reviews > 0 && product.rating > 0) {
    productJsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(product.rating.toFixed(1)),
      reviewCount: product.reviews,
    };
  }

  const relatedProducts = products.filter((item) => item.slug !== productSlug);
  const collectionMatches = product.collection
    ? relatedProducts.filter((item) => item.collection === product.collection)
    : [];

  const linkedSlugs = Array.isArray(product.linkedVariantSlugs) ? product.linkedVariantSlugs : [];
  const linkedVariants = linkedSlugs.length > 0
    ? products.filter((item) => linkedSlugs.includes(item.slug))
    : [];
  const displayCollection = linkedVariants.length > 0
    ? [product, ...linkedVariants.filter((item) => item.slug !== product.slug)]
    : product.collection
    ? products.filter((item) => item.collection === product.collection)
    : [];

  const qdrantRecommended = await getRecommendedProducts(product.slug, 8);
  const displayRelated = qdrantRecommended.length > 0
    ? qdrantRecommended.slice(0, 5)
    : collectionMatches.length > 0
    ? collectionMatches.slice(0, 5)
    : relatedProducts.slice(0, 5);

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
