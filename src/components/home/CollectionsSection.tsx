import Link from "next/link";
import { query } from "@/lib/db";
import { SectionHeader } from "@/components/ui/SectionHeader";

type CollectionWithProducts = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  products: { slug: string; title: string; image_url: string | null }[];
};

async function getActiveCollections(): Promise<CollectionWithProducts[]> {
  try {
    const colResult = await query<{ id: string; name: string; slug: string; description: string | null; image_url: string | null }>(
      "select id, name, slug, description, image_url from collections where is_active = true order by sort_order, created_at desc limit 6",
    );

    const collections: CollectionWithProducts[] = [];
    for (const col of colResult.rows) {
      const prodResult = await query<{ product_slug: string }>(
        "select product_slug from collection_products where collection_id = $1 order by sort_order limit 8",
        [col.id],
      );

      // Get product details from store_products
      const productSlugs = prodResult.rows.map((r) => r.product_slug);
      let products: { slug: string; title: string; image_url: string | null }[] = [];

      if (productSlugs.length > 0) {
        const placeholders = productSlugs.map((_, i) => `$${i + 1}`).join(",");
        const detailResult = await query<{ slug: string; title: string; image_url: string | null }>(
          `select p.slug, p.title, coalesce(pi.image_url, null) as image_url
           from products p
           left join lateral (
             select image_url from product_images where product_id = p.id order by sort_order asc limit 1
           ) pi on true
           where p.slug in (${placeholders}) and p.is_active = true`,
          productSlugs,
        );
        products = detailResult.rows;
      }

      collections.push({ ...col, products });
    }

    return collections;
  } catch {
    return [];
  }
}

async function getCollectionBySlug(slug: string): Promise<CollectionWithProducts | null> {
  try {
    const colResult = await query<{ id: string; name: string; slug: string; description: string | null; image_url: string | null }>(
      "select id, name, slug, description, image_url from collections where slug = $1 and is_active = true limit 1",
      [slug]
    );
    if (colResult.rows.length === 0) return null;
    const col = colResult.rows[0];

    const prodResult = await query<{ product_slug: string }>(
      "select product_slug from collection_products where collection_id = $1 order by sort_order limit 8",
      [col.id],
    );

    const productSlugs = prodResult.rows.map((r) => r.product_slug);
    let products: { slug: string; title: string; image_url: string | null }[] = [];

    if (productSlugs.length > 0) {
      const placeholders = productSlugs.map((_, i) => `$${i + 1}`).join(",");
      const detailResult = await query<{ slug: string; title: string; image_url: string | null }>(
        `select p.slug, p.title, coalesce(pi.image_url, null) as image_url
         from products p
         left join lateral (
           select image_url from product_images where product_id = p.id order by sort_order asc limit 1
         ) pi on true
         where p.slug in (${placeholders}) and p.is_active = true`,
        productSlugs,
      );
      products = detailResult.rows;
    }

    return { ...col, products };
  } catch {
    return null;
  }
}

interface CollectionsSectionProps {
  settings?: Record<string, any>;
}

export async function CollectionsSection({ settings }: CollectionsSectionProps) {
  const collectionSlug = settings?.collectionSlug || "";
  const eyebrow = settings?.eyebrow || "Collections";
  const heading = settings?.heading || "Shop by collection";
  const description = settings?.subheading || "Curated product sets to help you discover your style.";

  if (collectionSlug) {
    const col = await getCollectionBySlug(collectionSlug);
    if (!col) return null;
    return (
        <section className="qh-container qh-section-pad">
          <SectionHeader
            eyebrow={eyebrow}
            title={heading}
            description={description}
          />
          <div className="mt-8">
            <Link
              href={`/collections/${col.slug}`}
              className="group block rounded-2xl border border-border bg-background-elevated overflow-hidden shadow-soft transition-all duration-base hover:-translate-y-1 hover:shadow-dropdown"
            >
              <div className="grid md:grid-cols-12 items-stretch divide-y md:divide-y-0 md:divide-x divide-border">
                {/* Info and Banner block */}
                <div className="md:col-span-5 p-6 flex flex-col justify-between bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent">
                  <div>
                    <span className="rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-bold text-brand-primary">Collection Spotlight</span>
                    <h3 className="mt-4 font-display text-2xl font-black text-text-main group-hover:text-brand-primary transition-colors">{col.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-4">
                      {col.description || "Explore our carefully handpicked items curated for high quality and beautiful aesthetics."}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
                    <span className="text-xs font-semibold text-text-soft">{col.products.length} product(s) inside</span>
                    <span className="text-sm font-bold text-brand-primary group-hover:translate-x-1 transition-transform">View Collection →</span>
                  </div>
                </div>
                {/* Products grid preview */}
                <div className="md:col-span-7 bg-background-soft p-6 flex items-center justify-center">
                  {col.products && col.products.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 w-full">
                      {col.products.slice(0, 3).map((p, i) => (
                        <div key={p.slug} className="aspect-square bg-background-elevated rounded-xl border border-border/40 overflow-hidden relative shadow-soft">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-text-soft bg-background-muted">
                              No image
                            </div>
                          )}
                          <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white">#{i+1}</span>
                        </div>
                      ))}
                      {col.products.length < 3 && Array.from({ length: 3 - col.products.length }).map((_, i) => (
                        <div key={i} className="aspect-square bg-background-elevated/40 border border-dashed border-border rounded-xl" />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-text-soft text-sm">No products in this collection yet.</div>
                  )}
                </div>
              </div>
            </Link>
          </div>
        </section>
      );
  }

  const collections = await getActiveCollections();
  if (collections.length === 0) return null;

  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader
        eyebrow={eyebrow}
        title={heading}
        description={description}
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((col) => (
          <Link
            key={col.id}
            href={`/collections/${col.slug}`}
            className="group qh-card overflow-hidden transition-all duration-base hover:-translate-y-1 hover:shadow-dropdown"
          >
            {/* Image Grid */}
            <div className="grid h-48 grid-cols-3 gap-px bg-background-muted">
              {col.products.slice(0, 3).map((p, i) => (
                <div key={p.slug} className="relative overflow-hidden bg-background-soft">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-text-soft">No image</div>
                  )}
                </div>
              ))}
              {col.products.length < 3 &&
                Array.from({ length: 3 - col.products.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-background-soft" />
                ))}
            </div>
            {/* Info */}
            <div className="p-4">
              <h3 className="text-lg font-black text-text-main group-hover:text-brand-primary transition-colors duration-fast">
                {col.name}
              </h3>
              {col.description && (
                <p className="mt-1 text-sm text-text-muted line-clamp-2">{col.description}</p>
              )}
              <p className="mt-2 text-sm font-semibold text-brand-primary">
                {col.products.length} product{col.products.length !== 1 ? "s" : ""} →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
