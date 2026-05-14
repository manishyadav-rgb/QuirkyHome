import type { Product } from "@/data/products";
import { listAdminProducts, type AdminProductRow } from "@/lib/admin-products";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://qhbackend.onrender.com/api";

/** Convert a DB row to a Product */
function rowToProduct(row: AdminProductRow): Product {
  return {
    title: row.title,
    slug: row.slug,
    category: row.category || "general",
    sku: row.sku || undefined,
    collection: row.collection || undefined,
    stock: row.quantity_available ?? undefined,
    image: row.image_url || "https://placehold.co/600x600/f5f5f5/999?text=No+Image",
    gallery: row.image_url ? [row.image_url] : [],
    rating: 4.5,
    reviews: 0,
    price: Number(row.sale_price || row.mrp || 0),
    mrp: Number(row.mrp || row.sale_price || 0),
    badge: "New",
    description: row.description && row.description !== row.title ? row.description : "",
  };
}

/**
 * Always fetch from PostgreSQL directly so we have reliable `id` fields
 * for the builder's product picker matching.
 */
export async function getCatalogProducts(): Promise<Product[]> {
  try {
    const rows = await listAdminProducts();
    if (!rows || rows.length === 0) return [];
    return rows.map(rowToProduct);
  } catch (err) {
    console.error("getCatalogProducts error:", err);
  }

  // Last resort: try the NestJS backend (won't have IDs)
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
  // Direct DB lookup
  try {
    const rows = await listAdminProducts();
    const row = rows.find((r) => r.slug === slug);
    if (row) return rowToProduct(row);
  } catch {
    // Fall through
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
