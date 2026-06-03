"use client";

import Image from "next/image";
import { Minus, Plus, Trash2, Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { formatPrice } from "@/data/products";
import { useShop } from "@/components/shop/ShopProvider";

export function CartItem({
  product,
  quantity = 1,
  onDecrease,
  onIncrease,
  onRemove,
}: {
  product: Product;
  quantity?: number;
  onDecrease?: () => void;
  onIncrease?: () => void;
  onRemove?: () => void;
}) {
  const { toggleWishlist, isWishlisted } = useShop();
  const wishlisted = isWishlisted(product.slug);

  const mrpTotal = (product.mrp || product.price) * quantity;
  const priceTotal = product.price * quantity;
  const hasSavings = mrpTotal > priceTotal;

  return (
    <div className="flex gap-4 rounded-2xl border border-border bg-background-elevated p-4 shadow-soft hover:border-brand-primary/10 transition-colors duration-base">
      {/* Product Image */}
      <div className="qh-image-shell relative h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-xl border border-border/60 bg-background-muted">
        <Image src={product.image} alt={product.title} fill sizes="7rem" className="object-cover" />
      </div>

      {/* Product Info */}
      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-sans text-sm md:text-base font-bold text-text-main leading-tight line-clamp-2">
              {product.title}
            </h3>
            <button
              onClick={onRemove}
              className="text-text-soft hover:text-red-500 transition-colors duration-fast p-1 rounded-full hover:bg-red-50"
              aria-label="Remove item"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          {/* Size or category details */}
          <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-semibold text-text-muted">
            {product.size && (
              <span className="rounded bg-background-soft px-2 py-0.5 text-brand-primary">
                Size: {product.size}
              </span>
            )}
            <span className="rounded bg-[#E8F8F5] px-2 py-0.5 text-[#129C80]">
              Ships in 2-4 days
            </span>
          </div>
        </div>

        {/* Action Controls & Pricing */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {/* Quantity Controls & Save for Later */}
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center rounded-full border border-border bg-background-main h-8">
              <button
                onClick={onDecrease}
                className="px-2.5 py-1 text-text-soft hover:text-brand-primary transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>
              <span className="min-w-8 text-center text-xs font-bold text-text-main">{quantity}</span>
              <button
                onClick={onIncrease}
                className="px-2.5 py-1 text-text-soft hover:text-brand-primary transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Move to Wishlist / Saved */}
            <button
              onClick={() => toggleWishlist(product)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold transition-all px-2.5 py-1.5 rounded-full hover:bg-background-soft ${
                wishlisted
                  ? "text-[#d7462f]"
                  : "text-text-soft hover:text-brand-primary"
              }`}
              aria-label="Save for later"
            >
              <Heart className={`h-3.5 w-3.5 ${wishlisted ? "fill-current" : ""}`} />
              <span className="hidden sm:inline">{wishlisted ? "Saved" : "Save for Later"}</span>
            </button>
          </div>

          {/* Price details */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5">
              {hasSavings && (
                <span className="text-[11px] text-text-soft line-through font-medium">
                  {formatPrice(mrpTotal)}
                </span>
              )}
              <span className="text-sm md:text-base font-extrabold text-[#432F83]">
                {formatPrice(priceTotal)}
              </span>
            </div>
            {hasSavings && (
              <p className="text-[10px] font-bold text-[#129C80]">
                You save {formatPrice(mrpTotal - priceTotal)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
