import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBuilderSchema } from "@/lib/builder/fetch-schema";
import { RenderSections } from "@/components/storefront/SectionRenderer";
import { PuckContentRenderer } from "@/components/storefront/PuckContentRenderer";

import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryCard } from "@/components/home/CategoryCard";
import { getCatalogProducts, getCatalogProduct } from "@/lib/catalog";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getStoreCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
}

function normalizeCategoryValue(value: string) {
  return value.toLowerCase().trim().replace(/[\s_]+/g, "-");
}

function categoryMatches(productCategory: string, slug: string) {
  const normalizedProductCategory = normalizeCategoryValue(productCategory);
  const normalizedSlug = normalizeCategoryValue(slug);
  if (normalizedProductCategory === normalizedSlug) return true;

  // Keep bedding pages compatible with legacy "bedsheet" category data.
  if (normalizedSlug === "bedding" && normalizedProductCategory === "bedsheet") return true;

  // Map virtual separate bath and gifts routes to the combined bath-gifts category in DB
  if ((normalizedSlug === "bath" || normalizedSlug === "gifts") && normalizedProductCategory === "bath-gifts") return true;

  return false;
}

function findCategoryBySlug(categories: any[], slug: string) {
  let category = categories.find((item) => item.slug === slug);
  if (!category && (slug === "bath" || slug === "gifts")) {
    const parent = categories.find(c => c.slug === "bath-gifts");
    category = {
      name: slug === "bath" ? "Bath" : "Gifts",
      slug: slug,
      image: parent?.image || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80",
      description: slug === "bath" ? "Bath linens, towels, and self-care essentials." : "Thoughtful gifting picks for housewarmings, festivals, and surprises."
    };
  }
  return category;
}

function htmlToPlainText(input: string) {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "bedsheet") {
    redirect("/bedding");
  }
  const categories = await getStoreCategories();

  // 1. Try Category first so category pages are never overridden by builder pages.
  const category = findCategoryBySlug(categories, slug);
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

  // 2. Try Builder Page
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

export default async function DynamicPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  if (slug === "bedsheet") {
    redirect("/bedding");
  }
  const categories = await getStoreCategories();
  const builderSchema = await getBuilderSchema("quirkyhome");
  const builderPage = Object.values(builderSchema?.pages || {}).find((p) => p.slug === slug);

  // 1. Check Category first so category product listing always works.
  const category = findCategoryBySlug(categories, slug);
  if (category) {
    const products = await getCatalogProducts();
    const categoryProducts = products.filter((p) => categoryMatches(p.category || "", slug));

    return (
      <>
        <section className="qh-container qh-section-pad">
          <SectionHeader eyebrow="Category" title={category.name} description={category.description} />
          {categoryProducts.length ? (
            <ProductGrid products={categoryProducts} />
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              {categories.slice(0, 5).map((item) => <CategoryCard key={item.slug} category={item} />)}
            </div>
          )}
        </section>
        {builderPage && builderPage.sections && builderPage.sections.length > 0 && builderSchema?.themeSettings ? (
          <div className="qh-page-container">
            {builderPage?.lastPublishedBuilder === "advanced" && builderPage?.puckData ? (
              <PuckContentRenderer data={builderPage.puckData} />
            ) : (
              <RenderSections sections={builderPage.sections} theme={builderSchema.themeSettings} />
            )}
          </div>
        ) : null}
      </>
    );
  }

  // 2. Check Builder Schema
  if (builderPage && builderPage.sections && builderPage.sections.length > 0) {
    return (
      <div className="qh-page-container">
        {builderPage?.lastPublishedBuilder === "advanced" && builderPage?.puckData ? (
          <PuckContentRenderer data={builderPage.puckData} />
        ) : (
          <RenderSections sections={builderPage.sections} theme={builderSchema!.themeSettings} />
        )}
      </div>
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
