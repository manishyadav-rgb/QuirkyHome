"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/data/products";
import { getRecentlyViewedProducts } from "@/lib/recently-viewed";

type RecentlyViewedSectionProps = {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
};

export function RecentlyViewedSection({
  eyebrow = "Recently Viewed Products",
  heading = "",
  subheading = "",
}: RecentlyViewedSectionProps) {
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewedProducts().slice(0, 4));
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="qh-container qh-section-pad">
      <div className="mb-4 md:mb-5">
        {eyebrow ? (
          <p className="text-xs font-bold uppercase tracking-wide text-brand-primary md:text-sm">
            {eyebrow}
          </p>
        ) : null}
        {heading ? <h2 className="mt-1 font-display text-[22px] font-black leading-tight text-text-main">{heading}</h2> : null}
        {subheading ? <p className="mt-2 text-sm text-text-muted md:text-base">{subheading}</p> : null}
      </div>
      <div className="rounded-2xl border border-[rgba(212,180,131,0.28)] bg-[rgba(212,180,131,0.10)] p-1.5 sm:p-2">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
          {items.map((product) => (
            <ProductCard key={`recent-${product.slug}`} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
