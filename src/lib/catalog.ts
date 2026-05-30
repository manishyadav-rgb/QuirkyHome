import type { Product } from "@/data/products";
import { listAdminProducts, type AdminProductRow } from "@/lib/admin-products";
import { query } from "@/lib/db";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://qhbackend.onrender.com/api";
const DEFAULT_CATEGORY = "bedsheet";

/** Convert a DB row to a Product */
function rowToProduct(row: AdminProductRow): Product {
  const rowDescription = (row as { description?: string | null }).description ?? "";
  const gallery = (((row as { gallery_images?: string[] | null }).gallery_images) || []).filter(Boolean);
  const primaryImage = gallery[0] || row.image_url || "https://placehold.co/600x600/f5f5f5/999?text=No+Image";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category || DEFAULT_CATEGORY,
    sku: row.sku || undefined,
    size: row.size || undefined,
    collection: row.collection || undefined,
    stock: row.quantity_available ?? undefined,
    image: primaryImage,
    gallery: gallery.length ? gallery : [primaryImage],
    rating: 4.5,
    reviews: 0,
    price: Number(row.sale_price || row.mrp || 0),
    mrp: Number(row.mrp || row.sale_price || 0),
    badge: "New",
    description: rowDescription && rowDescription !== row.title ? rowDescription : "",
    long_description: (row as any).long_description || null,
  } as Product;
}

/**
 * Always fetch from PostgreSQL directly so we have reliable `id` fields
 * for the builder's product picker matching.
 */
export async function getCatalogProducts(): Promise<Product[]> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await listAdminProducts();
      if (rows && rows.length > 0) return rows.map(rowToProduct);
    } catch (err) {
      console.error("getCatalogProducts DB error:", err);
    }
  }

  // Fallback: try backend API
  try {
    const res = await fetch(`${API_URL}/products?site_id=quirkyhome`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {
    // Nothing we can do
  }

  return [];
}

export async function getCatalogProduct(slug: string): Promise<Product | null> {
  if (process.env.DATABASE_URL) {
    try {
      const rows = await listAdminProducts();
      const row = rows.find((r) => r.slug === slug);
      if (row) {
        const base = rowToProduct(row);
        let variantOptions: Product["variantOptions"] = [];
        if (row.id) {
          const galleryRows = await query<{ image_url: string }>(
            `select image_url
             from product_images
             where product_id = $1
             order by sort_order asc nulls last, created_at asc`,
            [row.id],
          );
          const gallery = galleryRows.rows.map((r) => r.image_url).filter(Boolean);

          const variantRows = await query<{
            sku: string | null;
            title: string | null;
            size: string | null;
            sale_price: string | null;
            mrp: string | null;
          }>(
            `select
               pv.sku,
               pv.title,
               pv.attributes->>'size' as size,
               pv.sale_price::text,
               pv.mrp::text
             from product_variants pv
             where pv.product_id = $1
             order by
               case when coalesce(pv.attributes->>'size', '') <> '' then 0 else 1 end,
               pv.created_at asc`,
            [row.id],
          );

          variantOptions = variantRows.rows.map((variant) => {
            const price = Number(variant.sale_price || variant.mrp || 0);
            const mrp = Number(variant.mrp || variant.sale_price || 0);
            const label = (variant.size || variant.title || variant.sku || "Variant").trim();
            return {
              sku: variant.sku || undefined,
              label,
              price,
              mrp,
              size: variant.size || undefined,
            };
          });

          let linkedVariantSlugs: string[] = [];
          try {
            const linkedRows = await query<{ slug: string }>(
              `select p2.slug
               from product_variant_links pvl
               join products p2 on p2.id = pvl.variant_product_id
               where pvl.product_id = $1
               order by p2.title asc`,
              [row.id],
            );
            linkedVariantSlugs = linkedRows.rows.map((entry) => entry.slug).filter(Boolean);
          } catch {
            linkedVariantSlugs = [];
          }

          if (gallery.length > 0) {
            return { ...base, image: gallery[0], gallery, variantOptions, linkedVariantSlugs };
          }
          return { ...base, variantOptions, linkedVariantSlugs };
        }
        return { ...base, variantOptions };
      }
    } catch {
      // Fall through
    }
  }

  // Fallback: NestJS backend
  try {
    const res = await fetch(`${API_URL}/products/single?slug=${encodeURIComponent(slug)}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.slug) return data;
    }
  } catch {
    // Nothing
  }

  return null;
}
