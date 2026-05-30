import type { Product } from "@/data/products";

export const RECENTLY_VIEWED_KEY = "qh_recently_viewed_products_v1";
const MAX_RECENTLY_VIEWED = 4;

function toStorableProduct(product: Product): Product {
  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    category: product.category || "bedsheet",
    sku: product.sku,
    size: product.size,
    collection: product.collection,
    stock: product.stock,
    image: product.image,
    gallery: Array.isArray(product.gallery) ? product.gallery.slice(0, 5) : [product.image],
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    price: Number(product.price || 0),
    mrp: Number(product.mrp || 0),
    badge: product.badge || "Viewed",
    description: product.description || "",
  };
}

export function getRecentlyViewedProducts(): Product[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.slug === "string");
  } catch {
    return [];
  }
}

export function addRecentlyViewedProduct(product: Product) {
  if (typeof window === "undefined") return;
  const normalized = toStorableProduct(product);
  const existing = getRecentlyViewedProducts().filter((item) => item.slug !== normalized.slug);
  const next = [normalized, ...existing].slice(0, MAX_RECENTLY_VIEWED);
  window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
}
