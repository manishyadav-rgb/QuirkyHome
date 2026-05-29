import { notFound, redirect } from "next/navigation";
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
    const categorySlug = product.category || "bedsheet";
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
    redirect(`/${product.category || "bedsheet"}/${product.slug}`);
  }

  // 4. Not Found
  notFound();
}
