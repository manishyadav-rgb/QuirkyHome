"use client";

import Image from "next/image";
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Share2 } from "lucide-react";
import type { Product } from "@/data/products";
import { discountFor, formatPrice } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";
import { RatingStars } from "./RatingStars";

import Link from "next/link";

export function ProductDetail({ 
  product, 
  collectionProducts = [] 
}: { 
  product: Product; 
  collectionProducts?: Product[] 
}) {
  const discount = discountFor(product.price, product.mrp);
  const { addToCart, isInCart, isWishlisted, toggleWishlist } = useShop();
  const inCart = isInCart(product.slug);
  const wishlisted = isWishlisted(product.slug);

  const handleShare = () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <section className="qh-container qh-section-pad grid gap-8 lg:grid-cols-2 lg:items-start overflow-hidden">
      <div className="grid gap-4 md:gap-6 qh-detail-gallery-grid w-full overflow-hidden">
        <div className="order-2 flex flex-wrap gap-2 md:order-1 md:grid md:grid-cols-1 md:gap-4">
          {product.gallery.map((image) => (
            <div key={image} className="qh-image-shell relative h-14 w-14 rounded-lg border border-border overflow-hidden md:h-20 md:w-20 lg:h-24 lg:w-24">
              <Image src={image} alt={product.title} fill sizes="(min-width: 768px) 150px, 3.5rem" className="object-cover" />
            </div>
          ))}
        </div>
        <div className="qh-image-shell relative order-1 aspect-square w-full qh-product-detail-image rounded-2xl md:order-2 overflow-hidden">
          <Image src={product.image} alt={product.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          {/* Floating Rating Badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-[12px] font-bold text-yellow-400 shadow-lg border border-white/10">
            <span>★</span>
            <span>{product.rating}</span>
            <span className="text-white/60 font-normal text-[10px] ml-0.5">({product.reviews})</span>
          </div>
        </div>
      </div>

      <div className="qh-card w-full overflow-hidden p-6 lg:p-10">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="sale">{discount}% Off</Badge>
          <Badge variant="secondary">{product.badge}</Badge>
        </div>
        <div className="flex justify-between items-start gap-4">
          <h1 className="font-display text-2xl md:text-3xl lg:text-3xl font-semibold text-text-main text-balance flex-1 leading-tight break-words">
            {product.title}
          </h1>
          <div className="flex gap-2 shrink-0">
            <button 
              onClick={handleShare}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background-soft text-text-muted hover:bg-brand-primary hover:text-text-inverse transition-colors"
              aria-label="Share product"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button 
              onClick={() => toggleWishlist(product)}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${wishlisted ? "bg-red-50 text-[#d7462f]" : "bg-background-soft text-text-muted hover:bg-red-50 hover:text-[#d7462f]"}`}
              aria-label="Toggle wishlist"
            >
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
        {product.description && (
          <p className="mt-4 text-text-muted leading-relaxed">{product.description}</p>
        )}


        {collectionProducts.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-bold text-text-main mb-3 uppercase tracking-wider">Variants</p>
            <div className="flex flex-wrap gap-2">
              {collectionProducts.map((p) => (
                <Link 
                  key={p.slug} 
                  href={`/${p.slug}`}
                  className={`relative h-14 w-14 rounded-md border-2 overflow-hidden transition-all ${p.slug === product.slug ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-border hover:border-text-soft"}`}
                >
                  <Image src={p.image} alt={p.title} fill sizes="3.5rem" className="object-cover" />
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-baseline gap-3">
          <span className="text-3xl font-bold text-text-main">{formatPrice(product.price)}</span>
          <span className="text-lg text-text-soft line-through">{formatPrice(product.mrp)}</span>
          <span className="font-semibold text-accent-discount">Inclusive of all taxes</span>
        </div>
        <div className="mt-8">
          <Button size="lg" className="w-full" onClick={() => addToCart(product)}>
            <ShoppingBag className="h-5 w-5" /> {inCart ? "Add One More" : "Add to Cart"}
          </Button>
        </div>
        <div className="mt-10 grid grid-cols-3 gap-2 border-t border-border pt-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-background-soft text-brand-primary">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight text-text-muted md:text-xs">Fast shipping</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-background-soft text-brand-primary">
              <RotateCcw className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight text-text-muted md:text-xs">Easy returns</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-background-soft text-brand-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight text-text-muted md:text-xs">Secure checkout</span>
          </div>
        </div>
      </div>
    </section>
  );
}

