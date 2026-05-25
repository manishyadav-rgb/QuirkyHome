"use client";

import Link from "next/link";
import { useShop } from "@/components/shop/ShopProvider";
import type { Product } from "@/data/products";

export function ProductGrid2Card({
  product,
  radius,
  buttonText,
}: {
  product: Product;
  radius: number;
  buttonText: string;
}) {
  const { toggleCartItem, isInCart } = useShop();
  const inCart = isInCart(product.slug);

  return (
    <article
      className="rounded-xl border border-[rgba(212,180,131,0.36)] bg-[rgba(212,180,131,0.14)] p-2"
      style={{ borderRadius: `${Math.max(radius - 2, 8)}px` }}
    >
      <Link href={`/${product.slug}`} className="block">
        <div className="relative overflow-hidden" style={{ borderRadius: `${radius}px`, aspectRatio: "3 / 4" }}>
          {product.image ? (
            <img src={product.image} alt={product.title} className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(212,180,131,0.55)] to-[#D4B483]" />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-3 pb-4 pt-8 text-white">
            <div className="mt-0.5 flex items-center gap-2">
              <span className="text-lg font-black leading-none">{`₹${Math.round(Number(product.price || 0))}`}</span>
              {Number(product.mrp) > Number(product.price) && (
                <span className="text-sm text-white/70 line-through">{`₹${Math.round(Number(product.mrp))}`}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggleCartItem(product)}
        className="mt-2 w-full rounded-[10px] border border-[#D4B483] bg-white py-2 text-[12px] font-bold text-[#8a6636] transition-colors hover:bg-[#D4B483] hover:text-white md:text-[13px]"
      >
        {inCart ? "Remove" : buttonText}
      </button>
    </article>
  );
}

