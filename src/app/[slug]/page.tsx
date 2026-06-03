import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { getBuilderSchema } from "@/lib/builder/fetch-schema";
import { RenderSections } from "@/components/storefront/SectionRenderer";
import { PuckContentRenderer } from "@/components/storefront/PuckContentRenderer";

import { categories } from "@/data/categories";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryCard } from "@/components/home/CategoryCard";
import { getCatalogProducts, getCatalogProduct } from "@/lib/catalog";
import { ProductDetail } from "@/components/product/ProductDetail";

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

  return false;
}

function htmlToPlainText(input: string) {
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // 1. Try Category first so category pages are never overridden by builder pages.
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
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const builderSchema = await getBuilderSchema("quirkyhome");
  const builderPage = Object.values(builderSchema?.pages || {}).find((p) => p.slug === slug);

  // 1. Check Category first so category product listing always works.
  const category = categories.find((item) => item.slug === slug);
  if (category) {
    const products = await getCatalogProducts();
    const categoryProducts = products.filter((p) => categoryMatches(p.category || "", slug));
    const pageNumberRaw = Number.parseInt(String(resolvedSearchParams.page || "1"), 10);
    const pageNumber = Number.isFinite(pageNumberRaw) && pageNumberRaw > 0 ? pageNumberRaw : 1;
    const productsPerPage = 12;
    const totalPages = Math.max(1, Math.ceil(categoryProducts.length / productsPerPage));
    const currentPage = Math.min(pageNumber, totalPages);
    const pageStart = (currentPage - 1) * productsPerPage;
    const paginatedProducts = categoryProducts.slice(pageStart, pageStart + productsPerPage);

    const pageWindowStart = Math.max(1, currentPage - 2);
    const pageWindowEnd = Math.min(totalPages, pageWindowStart + 4);
    const pageNumbers = Array.from(
      { length: Math.max(0, pageWindowEnd - pageWindowStart + 1) },
      (_, idx) => pageWindowStart + idx
    );

    return (
      <>
        <section className="qh-container qh-section-pad">
          <SectionHeader eyebrow="Category" title={category.name} description={category.description} />
          {categoryProducts.length ? (
            <>
              <ProductGrid products={paginatedProducts} />
              {totalPages > 1 ? (
                <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Category product pagination">
                  {currentPage > 1 ? (
                    <a href={`/${slug}?page=${currentPage - 1}`} className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary">
                      Prev
                    </a>
                  ) : null}
                  {pageNumbers.map((page) => (
                    <a
                      key={page}
                      href={`/${slug}?page=${page}`}
                      aria-current={page === currentPage ? "page" : undefined}
                      className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${
                        page === currentPage
                          ? "border-brand-primary bg-brand-primary text-text-inverse"
                          : "border-border text-text-main hover:border-brand-primary hover:text-brand-primary"
                      }`}
                    >
                      {page}
                    </a>
                  ))}
                  {currentPage < totalPages ? (
                    <a href={`/${slug}?page=${currentPage + 1}`} className="rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary">
                      Next
                    </a>
                  ) : null}
                </nav>
              ) : null}
            </>
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
