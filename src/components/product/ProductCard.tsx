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
  const productHref = `/${product.category || "bedsheet"}/${product.slug}`;

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#E6E7E8] bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Image & Badges Block */}
      <div className="relative overflow-hidden bg-[#F9FAFC] aspect-square w-full">
        <Link href={productHref} aria-label={product.title} className="absolute inset-0 block">
          <Image
            src={primaryImage}
            alt={product.title}
            fill
            sizes="(min-width: 1200px) 20vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute left-2.5 top-2.5 rounded bg-emerald-50 border border-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 tracking-wide">
            {discount}% OFF
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={`absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-200 shadow-tiny z-10 ${
            wishlisted
              ? "border-[#432F83]/25 bg-[#F3EDFE] text-[#432F83] shadow-[0_4px_12px_rgba(67,47,131,0.16)]"
              : "bg-white/95 border-[#E7E0FC] text-[#7A6AAE] hover:scale-105 hover:border-[#432F83]/35 hover:bg-[#F8F4FF] hover:text-[#432F83]"
          }`}
          aria-label={`${wishlisted ? "Remove" : "Add"} ${product.title} to wishlist`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        </button>

        {/* Extra Images Count */}
        {extraImages > 0 && (
          <div className="absolute bottom-2.5 left-2.5 rounded bg-black/50 px-1.5 py-0.5 text-[8.5px] font-bold text-white backdrop-blur-xs">
            +{extraImages} Photos
          </div>
        )}
      </div>

      {/* Details Block */}
      <div className="flex flex-col gap-1.5 p-3 flex-1 justify-between">
        <div className="flex flex-col gap-1">
          {/* Rating Summary */}
          <div className="flex items-center gap-1 text-[9.5px] font-semibold text-gray-500">
            <span className="flex items-center gap-0.5 text-gray-900 bg-amber-50 border border-amber-100 px-1 rounded">
              <span className="font-extrabold text-[10px]">{product.rating}</span>
              <Star className="h-2.5 w-2.5 fill-[#FBBF24] text-[#FBBF24]" />
            </span>
            <span>({pseudoReviews} reviews)</span>
          </div>

          {/* Title */}
          <Link href={productHref} className="block mt-0.5">
            <h3 className="line-clamp-2 text-[11px] md:text-xs font-bold leading-snug text-gray-800 transition-colors duration-200 group-hover:text-[#432F83]">
              {product.title}
            </h3>
          </Link>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {/* Pricing */}
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-[13px] md:text-sm font-extrabold text-[#432F83]">
              {formatPrice(product.price)}
            </span>
            {product.mrp > product.price && (
              <>
                <span className="text-[9.5px] md:text-[10px] text-gray-400 line-through font-medium">
                  {formatPrice(product.mrp)}
                </span>
                <span className="text-[9.5px] md:text-[10px] font-bold text-[#129C80]">
                  ({discount}% off)
                </span>
              </>
            )}
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={() => toggleCartItem(product)}
            className={`w-full flex items-center justify-center gap-1 h-9 rounded-lg text-[11px] font-bold transition-all ${
              inCart
                ? "bg-[#E8F8F5] border border-[#129C80] text-[#129C80]"
                : "bg-white border border-[#432F83] text-[#432F83] hover:bg-[#F3EDFE]"
            }`}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
