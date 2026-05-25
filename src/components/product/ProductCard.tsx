"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star, Check } from "lucide-react";
import type { Product } from "@/data/products";
import { discountFor, formatPrice } from "@/data/products";
import { useShop } from "@/components/shop/ShopProvider";

export function ProductCard({ product }: { product: Product }) {
  const discount = discountFor(product.price, product.mrp);
  const { toggleCartItem, isInCart, isWishlisted, toggleWishlist } = useShop();
  const inCart = isInCart(product.slug);
  const wishlisted = isWishlisted(product.slug);
  const primaryImage = product.gallery?.[0] || product.image;
  const extraImages = Math.max(0, (product.gallery?.length || 0) - 1);
  const pseudoReviews = Math.max(18, Math.round(product.rating * 23));

  return (
    <article className="group overflow-hidden rounded-2xl border border-[rgba(212,180,131,0.32)] bg-[rgba(255,255,255,0.96)] shadow-[0_2px_10px_rgba(212,180,131,0.18)] transition-all duration-300 hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-[0_18px_40px_rgba(212,180,131,0.34),0_4px_12px_rgba(0,0,0,0.08)]">
      <div className="relative overflow-hidden bg-[rgba(212,180,131,0.16)]">
        <div className="relative w-full pt-[105%]">
        <Link href={`/${product.slug}`} aria-label={product.title}>
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            sizes="(min-width: 1200px) 20vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </Link>
        </div>

        <div className="absolute left-3 top-3 rounded-md border border-[rgba(212,180,131,0.55)] bg-[rgba(212,180,131,0.26)] px-2 py-1 text-[10px] font-bold text-[#76562a]">
          {discount}% OFF
        </div>

        <button
          onClick={() => toggleWishlist(product)}
          className={`qh-focus absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-200 ${
            wishlisted
              ? "scale-105 border-[#D4B483] bg-[#D4B483] text-white"
              : "border-[rgba(212,180,131,0.45)] bg-white/90 text-[#9b7643] hover:scale-105"
          }`}
          aria-label={`${wishlisted ? "Remove" : "Add"} ${product.title} ${wishlisted ? "from" : "to"} wishlist`}
        >
          <Heart className="h-4 w-4" fill={wishlisted ? "currentColor" : "none"} />
        </button>

        <div className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
          <span className="inline-flex items-center gap-1">
            <Star className="h-3 w-3 fill-current" />
            {product.rating}
          </span>
        </div>

        {extraImages > 0 ? (
          <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            +{extraImages}
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5 p-3 sm:p-3.5">
        <Link href={`/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-[11px] font-semibold leading-snug text-[#2d2417] transition-colors duration-200 group-hover:text-[#9b7643] sm:text-[12px]">
            {product.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-[10px] text-[rgba(77,58,31,0.78)]">
          <span className="inline-flex items-center gap-1 text-[#9b7643]">
            <Star className="h-3 w-3 fill-current" />
            {product.rating}
          </span>
          <span>({pseudoReviews} reviews)</span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-[16px] font-bold leading-none text-[#2d2417] sm:text-[17px]">{formatPrice(product.price)}</span>
          <span className="text-[11px] text-[rgba(155,118,67,0.78)] line-through">{formatPrice(product.mrp)}</span>
        </div>

        <button
          type="button"
          onClick={() => toggleCartItem(product)}
          className={`mt-1.5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[10px] border text-[12px] font-semibold tracking-[0.03em] transition-all duration-200 sm:h-10.5 sm:text-[12.5px] ${
            inCart
              ? "border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]"
              : "border-[#D4B483] bg-transparent text-[#9b7643] hover:bg-[#D4B483] hover:text-white"
          }`}
        >
          {inCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          <span>{inCart ? "Added to Cart" : "Add to Cart"}</span>
        </button>
      </div>
    </article>
  );
}
