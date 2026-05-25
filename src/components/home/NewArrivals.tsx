import { products } from "@/data/products";
import { ProductGrid } from "@/components/product/ProductGrid";

export function NewArrivals() {
  return (
    <section className="qh-container qh-section-pad rounded-2xl border border-[rgba(212,180,131,0.32)] bg-[rgba(212,180,131,0.10)] p-3 sm:p-4">
      <div className="mb-6 md:mb-7">
        <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-[#9b7643] md:text-sm">Fresh drop</p>
        <h2 className="font-display text-2xl font-black text-[#2d2417] text-balance md:text-[30px]">
          New arrivals with main-character energy
        </h2>
      </div>
      <ProductGrid products={products.slice(1, 5)} />
    </section>
  );
}

