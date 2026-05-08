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
  removeFromCart: (slug: string) => void;
  updateCartQuantity: (slug: string, quantity: number) => void;
  isInCart: (slug: string) => boolean;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (slug: string) => boolean;
};

const CART_KEY = "qh_cart";
const WISHLIST_KEY = "qh_wishlist";

const ShopContext = createContext<ShopContextValue | null>(null);

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

function productBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [wishlistSlugs, setWishlistSlugs] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCartLines(readJson<CartLine[]>(CART_KEY, []));
    setWishlistSlugs(readJson<string[]>(WISHLIST_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cartLines));
  }, [cartLines, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistSlugs));
  }, [wishlistSlugs, hydrated]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCartLines((current) => {
      const existing = current.find((item) => item.slug === product.slug);
      if (existing) {
        return current.map((item) =>
          item.slug === product.slug
            ? { ...item, quantity: Math.min(item.quantity + quantity, 20), product }
            : item,
        );
      }

      return [...current, { slug: product.slug, quantity: Math.max(1, quantity), product }];
    });
  }, []);

  const removeFromCart = useCallback((slug: string) => {
    setCartLines((current) => current.filter((item) => item.slug !== slug));
  }, []);

  const updateCartQuantity = useCallback((slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(slug);
      return;
    }

    setCartLines((current) =>
      current.map((item) => (item.slug === slug ? { ...item, quantity: Math.min(quantity, 20) } : item)),
    );
  }, [removeFromCart]);

  const toggleWishlist = useCallback((product: Product) => {
    setWishlistSlugs((current) =>
      current.includes(product.slug)
        ? current.filter((slug) => slug !== product.slug)
        : [...current, product.slug],
    );
  }, []);

  const cart = useMemo(
    () =>
      cartLines.flatMap((line) => {
        const product = line.product ?? productBySlug(line.slug);
        return product ? [{ product, quantity: line.quantity, lineTotal: product.price * line.quantity }] : [];
      }),
    [cartLines],
  );

  const wishlist = useMemo(
    () => wishlistSlugs.flatMap((slug) => {
      const product = productBySlug(slug);
      return product ? [product] : [];
    }),
    [wishlistSlugs],
  );

  const subtotal = cart.reduce((sum, item) => sum + item.lineTotal, 0);

  const value = useMemo<ShopContextValue>(() => ({
    cart,
    wishlist,
    cartCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    wishlistCount: wishlist.length,
    subtotal,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    isInCart: (slug) => cartLines.some((item) => item.slug === slug),
    toggleWishlist,
    isWishlisted: (slug) => wishlistSlugs.includes(slug),
  }), [addToCart, cart, cartLines, removeFromCart, subtotal, toggleWishlist, updateCartQuantity, wishlist, wishlistSlugs]);

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used inside ShopProvider");
  return context;
}
