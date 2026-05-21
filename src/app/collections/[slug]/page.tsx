import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { query } from "@/lib/db";
import { getCatalogProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeader } from "@/components/ui/SectionHeader";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getCollectionData(slug: string) {
  try {
    const colResult = await query<{
      id: string;
      name: string;
      slug: string;
      description: string | null;
      image_url: string | null;
    }>(
      "select id, name, slug, description, image_url from collections where slug = $1 and is_active = true limit 1",
      [slug]
    );

    if (colResult.rows.length === 0) return null;
    const collection = colResult.rows[0];

    const prodResult = await query<{ product_slug: string }>(
      "select product_slug from collection_products where collection_id = $1 order by sort_order",
      [collection.id]
    );

    const productSlugs = prodResult.rows.map((r) => r.product_slug);
    const allProducts = await getCatalogProducts();
    const collectionProducts = allProducts.filter((p) => productSlugs.includes(p.slug));

    return {
      collection,
      products: collectionProducts,
    };
  } catch (err) {
    console.error("Error fetching collection data:", err);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCollectionData(slug);
  if (!data) return { title: "Collection Not Found" };

  const { collection } = data;
  return {
    title: `${collection.name} Collection | QuirkyHome`,
    description: collection.description || `Explore our handpicked curation of products in the ${collection.name} collection on QuirkyHome.`,
    alternates: { canonical: `/collections/${slug}` },
    openGraph: {
      title: `${collection.name} Collection | QuirkyHome`,
      description: collection.description || `Explore our handpicked curation of products in the ${collection.name} collection.`,
      images: collection.image_url ? [{ url: collection.image_url, alt: collection.name }] : [],
    },
  };
}

export default async function CollectionPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getCollectionData(slug);

  if (!data) {
    notFound();
  }

  const { collection, products } = data;

  return (
    <div className="qh-page-container">
      {collection.image_url ? (
        /* Spotlight Hero Banner for collections with images */
        <div className="relative h-[250px] md:h-[350px] w-full overflow-hidden bg-background-soft border-b border-border">
          <img
            src={collection.image_url}
            alt={collection.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
            <div className="qh-container w-full">
              <span className="rounded-full bg-brand-primary/90 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider shadow-sm">
                Collection
              </span>
              <h1 className="mt-3 font-display text-3xl md:text-5xl font-black text-white drop-shadow-md">
                {collection.name}
              </h1>
              {collection.description && (
                <p className="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-white/95 drop-shadow-sm font-medium">
                  {collection.description}
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Regular section header if no banner image */
        <div className="qh-container pt-8 md:pt-12">
          <SectionHeader
            eyebrow="Collection"
            title={collection.name}
            description={collection.description || undefined}
          />
        </div>
      )}

      {/* Product List Section */}
      <section className="qh-container qh-section-pad">
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="text-lg font-black text-text-main">
            Items ({products.length})
          </h2>
          <span className="text-xs font-medium text-text-soft">
            Showing curated finds
          </span>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border py-16 text-center bg-background-elevated">
            <p className="text-base font-semibold text-text-muted">
              No products found in this collection yet.
            </p>
            <p className="mt-1 text-sm text-text-soft">
              Check back soon for new arrivals!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
