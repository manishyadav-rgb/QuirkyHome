"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import type { Product } from "@/data/products";
import { discountFor, formatPrice } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";
import { RatingStars } from "./RatingStars";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountFor(product.price, product.mrp);
  const { addToCart, isInCart, isWishlisted, toggleWishlist } = useShop();
  const inCart = isInCart(product.slug);
  const wishlisted = isWishlisted(product.slug);

  return (
    <article className="group qh-card overflow-hidden transition-all duration-base hover:-translate-y-1 hover:shadow-dropdown">
      <div className="qh-image-shell aspect-square w-full relative rounded-b-none rounded-t-xl">
        <Link href={`/${product.slug}`} aria-label={product.title}>
          <Image src={product.image} alt={product.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw" className="object-cover transition-transform duration-slow group-hover:scale-105" />
        </Link>
        {/* Discount Badge — top-left */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <Badge variant="sale">{discount}% Off</Badge>
          <Badge variant="accent">{product.badge}</Badge>
        </div>
        {/* Rating — top-right on image */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-yellow-400 shadow-sm">
          ★ {product.rating}
        </div>
        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`qh-focus absolute right-3 bottom-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background-elevated shadow-soft transition-all duration-base ${
            wishlisted 
              ? "text-[#d7462f] hover:scale-110" 
              : "text-brand-primary hover:bg-brand-primary hover:text-text-inverse"
          }`}
          aria-label={`${wishlisted ? "Remove" : "Add"} ${product.title} ${wishlisted ? "from" : "to"} wishlist`}
        >
          <Heart className={`h-5 w-5 transition-transform duration-fast ${wishlisted ? "scale-110" : ""}`} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        {/* Quick View (desktop only) */}
        <Link 
          href={`/${product.slug}`}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-2 opacity-0 transition-all duration-base group-hover:translate-y-0 group-hover:opacity-100 hidden md:inline-flex items-center gap-1.5 rounded-full bg-background-elevated/95 backdrop-blur-sm px-4 py-2 text-xs font-semibold text-text-main shadow-dropdown hover:bg-brand-primary hover:text-text-inverse"
        >
          <Eye className="h-3.5 w-3.5" />
          Quick View
        </Link>
      </div>
      <div className="space-y-3 p-4">
        <Link href={`/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-lg font-black leading-snug text-text-main transition-colors duration-fast group-hover:text-brand-primary">{product.title}</h3>
        </Link>
        {/* Price Row */}
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-xl font-bold text-text-main">{formatPrice(product.price)}</span>
          <span className="text-sm text-text-soft line-through">{formatPrice(product.mrp)}</span>
          <span className="rounded bg-[#e3f1df] px-1.5 py-0.5 text-xs font-bold text-[#078653]">{discount}% off</span>
        </div>
        {/* Add to Cart */}
        <Button 
          className={`w-full transition-all duration-base ${inCart ? "!bg-brand-primary !text-text-inverse" : ""}`} 
          variant={inCart ? "primary" : "outline"} 
          onClick={() => addToCart(product)}
        >
          <ShoppingBag className="h-4 w-4" /> {inCart ? "Added ✓" : "Add to Cart"}
        </Button>
      </div>
    </article>
  );
}
