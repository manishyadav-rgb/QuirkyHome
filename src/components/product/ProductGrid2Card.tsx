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
  const productHref = `/${product.category || "bedsheet"}/${product.slug}`;

  return (
    <article
      className="bg-white p-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      style={{ borderRadius: `${Math.max(radius - 2, 8)}px` }}
    >
      <Link href={productHref} className="block">
        <div className="relative overflow-hidden" style={{ borderRadius: `${radius}px`, aspectRatio: "3 / 4" }}>
          {product.image ? (
            <img src={product.image} alt={product.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#432F83]/20 to-[#5A31DD]/10" />
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
        className={`mt-2 w-full rounded-[10px] py-2 text-[12px] font-bold transition-all md:text-[13px] border ${
          inCart
            ? "bg-[#E8F8F5] border-[#129C80] text-[#129C80]"
            : "bg-white border-[#432F83] text-[#432F83] hover:bg-[#F3EDFE]"
        }`}
      >
        {inCart ? "Remove" : buttonText}
      </button>
    </article>
  );
}

