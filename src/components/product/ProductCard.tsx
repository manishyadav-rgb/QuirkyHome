"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { discountFor, formatPrice } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountFor(product.price, product.mrp);
  const { addToCart, isInCart, isWishlisted, toggleWishlist } = useShop();
  const inCart = isInCart(product.slug);
  const wishlisted = isWishlisted(product.slug);
  const primaryImage = product.gallery?.[0] || product.image;
  const extraImages = Math.max(0, (product.gallery?.length || 0) - 1);

  return (
    <article className="group qh-card overflow-hidden transition-all duration-base hover:-translate-y-1 hover:shadow-dropdown">
      <div className="qh-image-shell relative aspect-square w-full rounded-b-none rounded-t-xl">
        <Link href={`/${product.slug}`} aria-label={product.title}>
          <Image src={primaryImage} alt={product.title} fill sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 90vw" className="object-cover transition-transform duration-slow group-hover:scale-105" />
        </Link>
        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5 sm:left-3 sm:top-3 sm:gap-2">
          <Badge variant="sale">{discount}% Off</Badge>
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-bold text-yellow-400 shadow-sm backdrop-blur-sm sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px]">
          <Star className="h-3 w-3 fill-current text-yellow-400" />
          <span>{product.rating}</span>
        </div>
        {extraImages > 0 && (
          <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold text-white backdrop-blur-sm sm:bottom-3 sm:left-3 sm:px-2.5 sm:py-1 sm:text-[10px]">
            +{extraImages} photos
          </div>
        )}
        <button
          onClick={() => toggleWishlist(product)}
          className={`qh-focus absolute bottom-2 right-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background-elevated shadow-soft transition-all duration-base sm:bottom-3 sm:right-3 sm:h-10 sm:w-10 ${
            wishlisted
              ? "text-[#d7462f] hover:scale-110"
              : "text-brand-primary hover:bg-brand-primary hover:text-text-inverse"
          }`}
          aria-label={`${wishlisted ? "Remove" : "Add"} ${product.title} ${wishlisted ? "from" : "to"} wishlist`}
        >
          <Heart className={`h-4 w-4 transition-transform duration-fast sm:h-5 sm:w-5 ${wishlisted ? "scale-110" : ""}`} fill={wishlisted ? "currentColor" : "none"} />
        </button>
        <Link
          href={`/${product.slug}`}
          className="absolute bottom-3 left-1/2 hidden -translate-x-1/2 translate-y-2 items-center gap-1.5 rounded-full bg-background-elevated/95 px-4 py-2 text-xs font-semibold text-text-main opacity-0 shadow-dropdown transition-all duration-base backdrop-blur-sm group-hover:translate-y-0 group-hover:opacity-100 md:inline-flex hover:bg-brand-primary hover:text-text-inverse"
        >
          <Eye className="h-3.5 w-3.5" />
          Quick View
        </Link>
      </div>
      <div className="space-y-2.5 p-3 sm:space-y-3 sm:p-4">
        <Link href={`/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-[13px] font-black leading-snug text-text-main transition-colors duration-fast group-hover:text-brand-primary sm:text-base md:text-lg">{product.title}</h3>
        </Link>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-text-main sm:text-lg md:text-xl">{formatPrice(product.price)}</span>
          <span className="text-[11px] text-text-soft line-through sm:text-xs md:text-sm">{formatPrice(product.mrp)}</span>
          <span className="rounded bg-[#e3f1df] px-1.5 py-0.5 text-[10px] font-bold text-[#078653] sm:text-[11px] md:text-xs">{discount}% off</span>
        </div>
        <Button
          className={`h-9 w-full !justify-center gap-1.5 px-2 text-[12px] leading-none transition-all duration-base sm:h-10 sm:text-[13px] ${inCart ? "!bg-brand-primary !text-text-inverse" : ""}`}
          variant={inCart ? "primary" : "outline"}
          onClick={() => addToCart(product)}
        >
          <ShoppingBag className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          <span className="inline-flex items-center leading-none">{inCart ? "Added" : "Add to Cart"}</span>
        </Button>
      </div>
    </article>
  );
}
