"use client";

import Image from "next/image";
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import type { Product } from "@/data/products";
import { discountFor, formatPrice } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";
import { RatingStars } from "./RatingStars";

export function ProductDetail({ product }: { product: Product }) {
  const discount = discountFor(product.price, product.mrp);
  const { addToCart, isInCart, isWishlisted, toggleWishlist } = useShop();
  const inCart = isInCart(product.slug);
  const wishlisted = isWishlisted(product.slug);

  return (
    <section className="qh-container qh-section-pad grid gap-8 lg:grid-cols-2 lg:items-start">
      <div className="grid gap-4 qh-detail-gallery-grid">
        <div className="order-2 grid grid-cols-2 gap-3 md:order-1 md:grid-cols-1">
          {product.gallery.map((image) => (
            <div key={image} className="qh-image-shell relative h-20 rounded-lg border border-border">
              <Image src={image} alt={product.title} fill sizes="5rem" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="qh-image-shell relative order-1 qh-product-detail-image rounded-2xl md:order-2">
          <Image src={product.image} alt={product.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
        </div>
      </div>

      <div className="qh-card p-6 lg:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="sale">{discount}% Off</Badge>
          <Badge variant="secondary">{product.badge}</Badge>
        </div>
        <h1 className="font-display text-4xl font-semibold text-text-main text-balance">{product.title}</h1>
        <p className="mt-4 text-text-muted leading-relaxed">{product.description}</p>
        <div className="mt-5">
          <RatingStars rating={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-text-main">{formatPrice(product.price)}</span>
          <span className="text-lg text-text-soft line-through">{formatPrice(product.mrp)}</span>
          <span className="font-semibold text-accent-discount">Inclusive of all taxes</span>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button size="lg" onClick={() => addToCart(product)}>
            <ShoppingBag className="h-5 w-5" /> {inCart ? "Add One More" : "Add to Cart"}
          </Button>
          <Button size="lg" variant="outline" onClick={() => toggleWishlist(product)}>
            <Heart className="h-5 w-5" fill={wishlisted ? "currentColor" : "none"} /> {wishlisted ? "Wishlisted" : "Add to Wishlist"}
          </Button>
        </div>
        <div className="mt-8 grid gap-3 text-sm text-text-muted sm:grid-cols-3">
          <div className="rounded-lg bg-background-soft p-4"><Truck className="mb-2 h-5 w-5 text-brand-primary" />Fast shipping</div>
          <div className="rounded-lg bg-background-soft p-4"><RotateCcw className="mb-2 h-5 w-5 text-brand-primary" />Easy returns</div>
          <div className="rounded-lg bg-background-soft p-4"><ShieldCheck className="mb-2 h-5 w-5 text-brand-primary" />Secure checkout</div>
        </div>
      </div>
    </section>
  );
}

