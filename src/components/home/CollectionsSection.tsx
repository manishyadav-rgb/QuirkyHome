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
              className="group block overflow-hidden rounded-2xl border border-[rgba(212,180,131,0.35)] bg-[rgba(255,255,255,0.96)] shadow-[0_4px_16px_rgba(212,180,131,0.22)] transition-all duration-base hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(212,180,131,0.30)]"
            >
              <div className="grid items-stretch divide-y divide-[rgba(212,180,131,0.30)] md:grid-cols-12 md:divide-x md:divide-y-0">
                {/* Info and Banner block */}
                <div className="flex flex-col justify-between bg-gradient-to-br from-[rgba(212,180,131,0.22)] via-[rgba(212,180,131,0.08)] to-transparent p-6 md:col-span-5">
                  <div>
                    <span className="rounded-full bg-[rgba(212,180,131,0.22)] px-3 py-1 text-xs font-bold text-[#8a6636]">Collection Spotlight</span>
                    <h3 className="mt-4 font-display text-2xl font-black text-[#2d2417] transition-colors group-hover:text-[#9b7643]">{col.name}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-text-muted line-clamp-4">
                      {col.description || "Explore our carefully handpicked items curated for high quality and beautiful aesthetics."}
                    </p>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-[rgba(212,180,131,0.35)] pt-4">
                    <span className="text-xs font-semibold text-text-soft">{col.products.length} product(s) inside</span>
                    <span className="text-sm font-bold text-[#8a6636] transition-transform group-hover:translate-x-1">View Collection →</span>
                  </div>
                </div>
                {/* Products grid preview */}
                <div className="flex items-center justify-center bg-[rgba(212,180,131,0.12)] p-6 md:col-span-7">
                  {col.products && col.products.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3 w-full">
                      {col.products.slice(0, 3).map((p, i) => (
                        <div key={p.slug} className="relative aspect-square overflow-hidden rounded-xl border border-[rgba(212,180,131,0.40)] bg-[rgba(255,255,255,0.92)] shadow-[0_3px_10px_rgba(212,180,131,0.18)]">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-[rgba(212,180,131,0.18)] text-[10px] text-[#6d552f]">
                              No image
                            </div>
                          )}
                          <span className="absolute top-2 left-2 rounded bg-black/60 px-1.5 py-0.5 text-[8px] font-bold text-white">#{i+1}</span>
                        </div>
                      ))}
                      {col.products.length < 3 && Array.from({ length: 3 - col.products.length }).map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl border border-dashed border-[rgba(212,180,131,0.45)] bg-[rgba(255,255,255,0.65)]" />
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
            className="group overflow-hidden rounded-2xl border border-[rgba(212,180,131,0.35)] bg-[rgba(255,255,255,0.96)] shadow-[0_4px_16px_rgba(212,180,131,0.22)] transition-all duration-base hover:-translate-y-1 hover:shadow-[0_14px_34px_rgba(212,180,131,0.30)]"
          >
            {/* Image Grid */}
            <div className="grid h-48 grid-cols-3 gap-px bg-[rgba(212,180,131,0.20)]">
              {col.products.slice(0, 3).map((p, i) => (
                <div key={p.slug} className="relative overflow-hidden bg-[rgba(212,180,131,0.12)]">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#6d552f]">No image</div>
                  )}
                </div>
              ))}
              {col.products.length < 3 &&
                Array.from({ length: 3 - col.products.length }).map((_, i) => (
                  <div key={`empty-${i}`} className="bg-[rgba(212,180,131,0.12)]" />
                ))}
            </div>
            {/* Info */}
            <div className="p-4">
              <h3 className="text-lg font-black text-[#2d2417] transition-colors duration-fast group-hover:text-[#9b7643]">
                {col.name}
              </h3>
              {col.description && (
                <p className="mt-1 text-sm text-text-muted line-clamp-2">{col.description}</p>
              )}
              <p className="mt-2 text-sm font-semibold text-[#8a6636]">
                {col.products.length} product{col.products.length !== 1 ? "s" : ""} →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
