"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { products, type Product } from "@/data/products";

type CartLine = {
  slug: string;
  quantity: number;
  product?: Product;
};

type CartProductLine = {
  product: Product;
  quantity: number;
  lineTotal: number;
};

type ShopContextValue = {
  cart: CartProductLine[];
  wishlist: Product[];
  cartCount: number;
  wishlistCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  toggleCartItem: (product: Product) => void;
  removeFromCart: (slug: string) => void;
  updateCartQuantity: (slug: string, quantity: number) => void;
  isInCart: (slug: string) => boolean;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (slug: string) => boolean;
};

type MeResponse = {
  authenticated?: boolean;
  user?: { role?: "customer" | "team" | "admin" };
};

type ApiCartItem = {
  product_slug: string;
  quantity: number;
  product_title?: string;
  product_image?: string | null;
  unit_price?: string;
  mrp?: string | null;
};

type ApiWishlistItem = {
  slug?: string;
  product_slug?: string;
  title?: string;
  product_title?: string;
  image?: string;
  product_image?: string | null;
  price?: number | string;
  unit_price?: string;
  mrp?: number | string | null;
};

const ShopContext = createContext<ShopContextValue | null>(null);

function productBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

function toCartProduct(item: ApiCartItem): Product {
  const fromCatalog = productBySlug(item.product_slug);
  const unitPrice = Number(item.unit_price || 0);
  const mrp = Number(item.mrp || item.unit_price || 0);
  const image = item.product_image || fromCatalog?.image || "";

  return {
    id: fromCatalog?.id,
    slug: item.product_slug,
    title: item.product_title || fromCatalog?.title || item.product_slug,
    category: fromCatalog?.category || "misc",
    sku: fromCatalog?.sku,
    size: fromCatalog?.size,
    collection: fromCatalog?.collection,
    stock: fromCatalog?.stock,
    image,
    gallery: image ? [image] : fromCatalog?.gallery || [],
    rating: fromCatalog?.rating || 0,
    reviews: fromCatalog?.reviews || 0,
    price: unitPrice,
    mrp,
    badge: fromCatalog?.badge || "",
    description: fromCatalog?.description || "",
  };
}

function toProductFromWishlistItem(item: ApiWishlistItem): Product | null {
  const slug = item.slug || item.product_slug;
  if (!slug) return null;
  const fromCatalog = productBySlug(slug);
  if (fromCatalog) return fromCatalog;

  const title = item.title || item.product_title || slug;
  const image = item.image || item.product_image || "";
  const price = Number(item.price ?? item.unit_price ?? 0);
  const mrp = Number(item.mrp ?? item.price ?? item.unit_price ?? 0);

  return {
    slug,
    title,
    category: "misc",
    sku: undefined,
    collection: undefined,
    stock: undefined,
    image,
    gallery: image ? [image] : [],
    rating: 0,
    reviews: 0,
    price,
    mrp,
    badge: "",
    description: "",
  };
}

async function getCustomerAuth(): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    if (!res.ok) return false;
    const data = (await res.json()) as MeResponse;
    return !!data.authenticated && data.user?.role === "customer";
  } catch {
    return false;
  }
}

function useShopState(): ShopContextValue {
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [isCustomerAuthed, setIsCustomerAuthed] = useState(false);

  const syncFromServer = useCallback(async () => {
    const [cartRes, wishlistRes] = await Promise.all([
      fetch("/api/cart", { cache: "no-store" }),
      fetch("/api/wishlist", { cache: "no-store" }),
    ]);

    if (cartRes.ok) {
      const cartData = await cartRes.json();
      const items = (cartData.items || []) as ApiCartItem[];
      setCartLines(
        items
          .map((item) => ({
            slug: item.product_slug,
            quantity: item.quantity,
            product: toCartProduct(item),
          }))
          .filter((item) => item.product),
      );
    }

    if (wishlistRes.ok) {
      const wishlistData = await wishlistRes.json();
      const items = (wishlistData.items || []) as ApiWishlistItem[];
      const normalized = items
        .map((item) => toProductFromWishlistItem(item))
        .filter((p): p is Product => !!p);
      setWishlistProducts(normalized);
      setWishlistSlugs(normalized.map((p) => p.slug));
    }
  }, []);

  useEffect(() => {
    let active = true;

    const init = async () => {
      const authed = await getCustomerAuth();
      if (!active) return;
      setIsCustomerAuthed(authed);

      if (authed) {
        await syncFromServer();
      } else {
        setCartLines([]);
        setWishlistSlugs([]);
        setWishlistProducts([]);
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [syncFromServer]);

  const requireCustomerLogin = useCallback(async () => {
    const authed = await getCustomerAuth();
    setIsCustomerAuthed(authed);
    if (authed) return true;
    window.location.href = "/account";
    return false;
  }, []);

  const addToCart = useCallback(async (product: Product, quantity = 1) => {
    const ok = await requireCustomerLogin();
    if (!ok) return;

    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: product.slug,
        title: product.title,
        image: product.image,
        price: product.price,
        mrp: product.mrp,
        quantity,
      }),
    });

    if (res.ok) await syncFromServer();
  }, [requireCustomerLogin, syncFromServer]);

  const removeFromCart = useCallback(async (slug: string) => {
    const ok = await requireCustomerLogin();
    if (!ok) return;

    const res = await fetch(`/api/cart?slug=${encodeURIComponent(slug)}`, { method: "DELETE" });
    if (res.ok) await syncFromServer();
  }, [requireCustomerLogin, syncFromServer]);

  const toggleCartItem = useCallback(async (product: Product) => {
    const inCartNow = cartLines.some((line) => line.slug === product.slug);
    if (inCartNow) {
      await removeFromCart(product.slug);
      return;
    }
    await addToCart(product, 1);
  }, [addToCart, cartLines, removeFromCart]);

  const updateCartQuantity = useCallback(async (slug: string, quantity: number) => {
    const ok = await requireCustomerLogin();
    if (!ok) return;

    const res = await fetch("/api/cart", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, quantity }),
    });

    if (res.ok) await syncFromServer();
  }, [requireCustomerLogin, syncFromServer]);

  const toggleWishlist = useCallback(async (product: Product) => {
    const ok = await requireCustomerLogin();
    if (!ok) return;

    const isCurrentlyWishlisted = wishlistSlugs.includes(product.slug);
    const res = isCurrentlyWishlisted
      ? await fetch(`/api/wishlist?slug=${encodeURIComponent(product.slug)}`, { method: "DELETE" })
      : await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: product.slug,
            title: product.title,
            image: product.image,
            price: product.price,
            mrp: product.mrp,
          }),
        });

    if (res.ok) await syncFromServer();
  }, [requireCustomerLogin, syncFromServer, wishlistSlugs]);

  const cart = useMemo(
    () =>
      cartLines.flatMap((line) => {
        const product = line.product ?? productBySlug(line.slug);
        return product ? [{ product, quantity: line.quantity, lineTotal: product.price * line.quantity }] : [];
      }),
    [cartLines],
  );

  const wishlist = useMemo(() => wishlistProducts, [wishlistProducts]);

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  return useMemo<ShopContextValue>(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    wishlistCount: wishlist.length,
    subtotal,
    addToCart,
    toggleCartItem,
    removeFromCart,
    updateCartQuantity,
    isInCart: (slug) => cartLines.some((item) => item.slug === slug),
    toggleWishlist,
    isWishlisted: (slug) => wishlistSlugs.includes(slug),
  }), [addToCart, cart, cartLines, removeFromCart, subtotal, toggleCartItem, toggleWishlist, updateCartQuantity, wishlist, wishlistSlugs]);
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const value = useShopState();
  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  const fallback = useShopState();
  return context || fallback;
}
