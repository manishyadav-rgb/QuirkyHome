import type { Product } from "@/data/products";
import { listAdminProducts, type AdminProductRow } from "@/lib/admin-products";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://qhbackend.onrender.com/api";

/** Convert a DB row to a Product */
function rowToProduct(row: AdminProductRow): Product {
  const rowDescription = (row as { description?: string | null }).description ?? "";
  const gallery = (((row as { gallery_images?: string[] | null }).gallery_images) || []).filter(Boolean);
  const primaryImage = gallery[0] || row.image_url || "https://placehold.co/600x600/f5f5f5/999?text=No+Image";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    category: row.category || "general",
    sku: row.sku || undefined,
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
  };
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
      if (row) return rowToProduct(row);
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
