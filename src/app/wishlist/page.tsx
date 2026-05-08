"use client";

import { Heart } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useShop } from "@/components/shop/ShopProvider";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function WishlistPage() {
  const { wishlist } = useShop();

  return (
    <section className="qh-container qh-section-pad">
      <SectionHeader eyebrow="Wishlist" title="Pieces you are quietly obsessed with" description="Save favourites, compare moods, and come back when the room tells you what it wants." />
      {wishlist.length ? <ProductGrid products={wishlist} /> : (
        <div className="qh-card mx-auto max-w-narrow p-8 text-center">
          <Heart className="mx-auto h-12 w-12 text-brand-primary" />
          <h2 className="mt-4 font-display text-2xl font-semibold">No favourites yet</h2>
          <p className="mt-2 text-text-muted">Tap the heart on product cards to build your decor shortlist.</p>
          <ButtonLink className="mt-6" href="/search">Find Favourites</ButtonLink>
        </div>
      )}
    </section>
  );
}

