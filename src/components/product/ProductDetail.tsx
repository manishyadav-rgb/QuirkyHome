"use client";

import Image from "next/image";
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Share2, ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { Product } from "@/data/products";
import { discountFor, formatPrice } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";
import Link from "next/link";
import { useMemo, useState } from "react";

export function ProductDetail({
  product,
  collectionProducts = [],
}: {
  product: Product;
  collectionProducts?: Product[];
}) {
  const discount = discountFor(product.price, product.mrp);
  const { addToCart, isInCart, isWishlisted, toggleWishlist } = useShop();
  const inCart = isInCart(product.slug);
  const wishlisted = isWishlisted(product.slug);
  const images = useMemo(() => {
    const normalized = (product.gallery && product.gallery.length ? product.gallery : [product.image]).filter(Boolean);
    return Array.from(new Set(normalized)).slice(0, 10);
  }, [product.gallery, product.image]);
  const [activeImage, setActiveImage] = useState(images[0] || product.image);
  const activeIndex = Math.max(0, images.indexOf(activeImage));
  const previewThumbs = images.slice(0, 3);
  const extraCount = Math.max(0, images.length - 3);

  function showPrevImage() {
    if (images.length <= 1) return;
    const nextIndex = activeIndex <= 0 ? images.length - 1 : activeIndex - 1;
    setActiveImage(images[nextIndex]);
  }

  function showNextImage() {
    if (images.length <= 1) return;
    const nextIndex = activeIndex >= images.length - 1 ? 0 : activeIndex + 1;
    setActiveImage(images[nextIndex]);
  }

  const handleShare = () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      navigator
        .share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <section className="qh-container qh-section-pad grid gap-8 overflow-hidden lg:grid-cols-2 lg:items-start">
      <div className="grid w-full gap-4 overflow-hidden md:gap-6 qh-detail-gallery-grid">
        <div className="order-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 md:order-1 md:grid md:grid-cols-1 md:gap-4 md:overflow-visible">
          {previewThumbs.map((image, idx) => {
            const isActive = image === activeImage;
            return (
              <button
                key={`${image}-${idx}`}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`qh-image-shell relative h-14 w-14 shrink-0 snap-start overflow-hidden rounded-lg border md:h-20 md:w-20 lg:h-24 lg:w-24 ${
                  isActive ? "border-brand-primary ring-2 ring-brand-primary/30" : "border-border"
                }`}
                aria-label={`View image ${idx + 1}`}
              >
                <Image src={image} alt={`${product.title} ${idx + 1}`} fill sizes="(min-width: 768px) 150px, 3.5rem" className="object-cover" />
              </button>
            );
          })}
          {extraCount > 0 && (
            <button
              type="button"
              onClick={() => setActiveImage(images[3])}
              className="qh-image-shell relative h-14 w-14 shrink-0 snap-start overflow-hidden rounded-lg border border-border bg-black/65 text-[11px] font-semibold text-white md:h-20 md:w-20 lg:h-24 lg:w-24"
              aria-label={`View remaining ${extraCount} images`}
            >
              +{extraCount}
            </button>
          )}
        </div>
        <div className="qh-image-shell relative order-1 aspect-square w-full overflow-hidden rounded-2xl md:order-2 qh-product-detail-image">
          <Image src={activeImage} alt={product.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevImage}
                className="absolute left-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/65"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={showNextImage}
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/65"
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full border border-white/10 bg-black/60 px-2.5 py-1 text-[12px] font-bold text-yellow-400 shadow-lg backdrop-blur-md">
            <Star className="h-3.5 w-3.5 fill-current text-yellow-400" />
            <span>{product.rating}</span>
            <span className="ml-0.5 text-[10px] font-normal text-white/60">({product.reviews})</span>
          </div>
        </div>
      </div>

      <div className="qh-card w-full overflow-hidden p-6 lg:p-10">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="sale">{discount}% Off</Badge>
          <Badge variant="secondary">{product.badge}</Badge>
        </div>
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-2xl font-semibold leading-tight text-balance text-text-main break-words md:text-3xl lg:text-3xl">{product.title}</h1>
          <div className="flex shrink-0 gap-2">
            <button onClick={handleShare} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background-soft text-text-muted transition-colors hover:bg-brand-primary hover:text-text-inverse" aria-label="Share product">
              <Share2 className="h-4 w-4" />
            </button>
            <button onClick={() => toggleWishlist(product)} className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${wishlisted ? "bg-red-50 text-[#d7462f]" : "bg-background-soft text-text-muted hover:bg-red-50 hover:text-[#d7462f]"}`} aria-label="Toggle wishlist">
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
        {product.description && <p className="mt-4 leading-relaxed text-text-muted">{product.description}</p>}

        {collectionProducts.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-bold uppercase tracking-wider text-text-main">Variants</p>
            <div className="flex flex-wrap gap-2">
              {collectionProducts.map((p) => (
                <Link key={p.slug} href={`/${p.slug}`} className={`relative h-14 w-14 overflow-hidden rounded-md border-2 transition-all ${p.slug === product.slug ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-border hover:border-text-soft"}`}>
                  <Image src={(p.gallery && p.gallery[0]) || p.image} alt={p.title} fill sizes="3.5rem" className="object-cover" />
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
