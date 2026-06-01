"use client";

import Image from "next/image";
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Share2, ChevronLeft, ChevronRight, Star, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Product } from "@/data/products";
import { discountFor, formatPrice } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { addRecentlyViewedProduct } from "@/lib/recently-viewed";


export function ProductDetail({
  product,
  collectionProducts = [],
}: {
  product: Product;
  collectionProducts?: Product[];
}) {
  const discount = discountFor(product.price, product.mrp);
  const { addToCart, toggleCartItem, isInCart, isWishlisted, toggleWishlist } = useShop();
  const inCart = isInCart(product.slug);
  const wishlisted = isWishlisted(product.slug);
  const images = useMemo(() => {
    const normalized = (product.gallery && product.gallery.length ? product.gallery : [product.image]).filter(Boolean);
    return Array.from(new Set(normalized)).slice(0, 10);
  }, [product.gallery, product.image]);
  const [activeImage, setActiveImage] = useState(images[0] || product.image);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<"idle" | "ok" | "error">("idle");
  const [pincodeMessage, setPincodeMessage] = useState("");
  const [buying, setBuying] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewList, setReviewList] = useState<Array<{ id: string; rating: number; title: string | null; comment: string | null; user_name: string | null; created_at: string }>>([]);
  const [reviewStats, setReviewStats] = useState<{ average: number; count: number }>({
    average: product.rating || 0,
    count: product.reviews || 0,
  });
  const fetchedReviewsForSlugRef = useRef<string>("");
  const activeIndex = Math.max(0, images.indexOf(activeImage));
  const previewThumbs = images.slice(0, 3);
  const extraCount = Math.max(0, images.length - 3);

  useEffect(() => {
    addRecentlyViewedProduct(product);
  }, [product]);

  useEffect(() => {
    if (activeTab !== "reviews") return;
    if (!product.slug) return;
    if (fetchedReviewsForSlugRef.current === product.slug) return;

    let cancelled = false;
    const controller = new AbortController();
    setReviewLoading(true);

    fetch(`/api/reviews?product_slug=${encodeURIComponent(product.slug)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setReviewList(Array.isArray(data.reviews) ? data.reviews : []);
        if (data.stats) {
          setReviewStats({
            average: Number(data.stats.average || 0),
            count: Number(data.stats.count || 0),
          });
        }
        fetchedReviewsForSlugRef.current = product.slug;
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReviewLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeTab, product.slug]);

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

  function checkPincode() {
    const value = pincode.trim();
    if (!/^\d{6}$/.test(value)) {
      setPincodeStatus("error");
      setPincodeMessage("Enter a valid 6-digit pincode.");
      return;
    }
    if (value.startsWith("0")) {
      setPincodeStatus("error");
      setPincodeMessage("Delivery is currently unavailable for this pincode.");
      return;
    }

    const minDate = new Date();
    const maxDate = new Date();
    minDate.setDate(minDate.getDate() + 3);
    maxDate.setDate(maxDate.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    setPincodeStatus("ok");
    setPincodeMessage(`Delivery between ${fmt(minDate)} - ${fmt(maxDate)}. COD available.`);
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
    <section className="qh-container qh-section-pad grid gap-8 overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-2 lg:items-stretch">
      <div className="grid h-full w-full gap-4 overflow-hidden rounded-[24px] bg-transparent p-0 md:gap-5 qh-detail-gallery-grid">
        <div className="order-2 flex snap-x snap-mandatory gap-2 overflow-x-auto rounded-2xl bg-background-elevated p-2 pb-1 md:order-1 md:grid md:grid-cols-1 md:content-start md:gap-3 md:overflow-visible">
          {previewThumbs.map((image, idx) => {
            const isActive = image === activeImage;
            return (
              <button
                key={`${image}-${idx}`}
                type="button"
                onClick={() => setActiveImage(image)}
                className={`qh-image-shell relative h-14 w-14 shrink-0 snap-start overflow-hidden rounded-lg border md:h-[72px] md:w-[72px] lg:h-20 lg:w-20 ${
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
              className="qh-image-shell relative flex h-14 w-14 shrink-0 snap-start items-center justify-center overflow-hidden rounded-lg border border-border md:h-[72px] md:w-[72px] lg:h-20 lg:w-20"
              aria-label={`View remaining ${extraCount} images`}
            >
              <Image src={images[3]} alt="More images" fill sizes="(min-width: 768px) 150px, 3.5rem" className="object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-[11px] font-semibold text-white md:text-[13px]">
                +{extraCount}
              </div>
            </button>
          )}
        </div>
        <div className="qh-image-shell relative order-1 aspect-square w-full overflow-hidden rounded-[20px] md:order-2 qh-product-detail-image">
          <Image src={activeImage} alt={product.title} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            <Badge variant="sale">{discount}% Off</Badge>
            <Badge variant="secondary">{product.badge}</Badge>
          </div>
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

      <div className="qh-card flex h-full w-full flex-col overflow-hidden rounded-[24px] border-0 bg-background-main p-5 shadow-none lg:p-8">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-[17px] font-semibold leading-tight text-balance text-text-main break-words md:text-[19px] lg:text-[21px]">{product.title}</h1>
          <div className="flex shrink-0 gap-2">
            <button onClick={handleShare} className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-background-soft text-text-muted transition-colors hover:bg-brand-primary hover:text-text-inverse" aria-label="Share product">
              <Share2 className="h-4 w-4" />
            </button>
            <button onClick={() => toggleWishlist(product)} className={`inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors ${wishlisted ? "bg-red-50 text-[#d7462f]" : "bg-background-soft text-text-muted hover:bg-red-50 hover:text-[#d7462f]"}`} aria-label="Toggle wishlist">
              <Heart className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
        {collectionProducts.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-main md:text-xs">Variants</p>
            <div className="flex flex-wrap gap-2">
              {collectionProducts.map((p) => (
                <Link key={p.slug} href={`/${p.category || "bedsheet"}/${p.slug}`} className={`relative h-14 w-14 overflow-hidden rounded-md border-2 transition-all ${p.slug === product.slug ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-border hover:border-text-soft"}`}>
                  <Image src={(p.gallery && p.gallery[0]) || p.image} alt={p.title} fill sizes="3.5rem" className="object-cover" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {product.size && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-main md:text-xs">Size</p>
            <div className="inline-flex items-center justify-center rounded-full border border-brand-primary/40 bg-brand-primary/10 px-4 py-1.5 text-[12px] font-bold tracking-wide text-brand-primary md:text-[13px]">
              {String(product.size).toUpperCase()}
            </div>
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-border bg-gradient-to-br from-background-soft to-background-elevated p-4">
          <div className="flex flex-wrap items-baseline gap-2.5">
            <span className="text-2xl font-black text-brand-primary md:text-3xl">{formatPrice(product.price)}</span>
            <span className="text-sm text-text-soft line-through md:text-base">{formatPrice(product.mrp)}</span>
            <span className="rounded-full bg-accent-discount/10 px-2 py-0.5 text-[11px] font-bold text-accent-discount">{discount}% OFF</span>
          </div>
          <span className="mt-1.5 block text-[11px] font-semibold text-text-muted md:text-xs">Inclusive of all taxes</span>
        </div>
        <div className="mt-4 rounded-xl border border-border bg-gradient-to-br from-background-soft to-background-elevated p-3.5">
          <div className="mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-brand-primary" />
            <p className="text-xs font-semibold uppercase tracking-wider text-text-main">Check Delivery</p>
          </div>
          <div className="flex gap-2">
            <input
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(e) => {
                if (e.key === "Enter") checkPincode();
              }}
              placeholder="Enter 6-digit pincode"
              inputMode="numeric"
              className="qh-focus h-9 flex-1 rounded-lg border border-border bg-background-main px-3 text-[12px]"
            />
            <button
              type="button"
              onClick={checkPincode}
              className="rounded-lg bg-brand-primary px-3 text-xs font-semibold text-white hover:bg-brand-secondary disabled:opacity-60"
            >
              Check
            </button>
          </div>
          {pincodeStatus !== "idle" && (
            <div className={`mt-2 flex items-start gap-2 rounded-lg px-2.5 py-2 text-[11px] ${pincodeStatus === "ok" ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-red-200 bg-red-50 text-red-700"}`}>
              {pincodeStatus === "ok" ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
              <p>{pincodeMessage}</p>
            </div>
          )}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2.5 md:gap-3">
          <Button className="w-full h-9 text-[11px] md:h-10 md:text-[12px]" variant="outline" onClick={() => toggleCartItem(product)}>
            <ShoppingBag className="mr-1.5 h-4 w-4 md:mr-2 md:h-5 md:w-5" /> {inCart ? "Remove" : "Add to Cart"}
          </Button>
          <Button
            className="w-full h-10 text-[12px] md:h-11 md:text-[13px]"
            disabled={buying}
            onClick={async () => {
              setBuying(true);
              try {
                await addToCart(product);
                window.location.href = "/checkout";
              } catch (err) {
                console.error("Buy now redirect failed:", err);
                setBuying(false);
              }
            }}
          >
            {buying ? "Processing..." : "Buy Now"}
          </Button>
        </div>

      </div>
      </div>

      <div className="mx-auto grid w-full max-w-3xl grid-cols-3 gap-3">
        <div className="rounded-2xl border border-border bg-background-elevated p-3 text-center shadow-soft">
          <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-background-soft text-brand-primary">
            <Truck className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight text-text-muted md:text-xs">Fast shipping</span>
        </div>
        <div className="rounded-2xl border border-border bg-background-elevated p-3 text-center shadow-soft">
          <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-background-soft text-brand-primary">
            <RotateCcw className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight text-text-muted md:text-xs">Easy returns</span>
        </div>
        <div className="rounded-2xl border border-border bg-background-elevated p-3 text-center shadow-soft">
          <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-background-soft text-brand-primary">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-tight text-text-muted md:text-xs">Secure checkout</span>
        </div>
      </div>

      <div className="rounded-[24px] border border-border bg-background-elevated p-4 shadow-soft md:p-6">
        <div className="mb-5 flex gap-2 border-b border-border">
          <button onClick={() => setActiveTab("desc")} className={`border-b-2 px-3 py-2 text-sm font-semibold ${activeTab === "desc" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted"}`}>Description</button>
          <button onClick={() => setActiveTab("specs")} className={`border-b-2 px-3 py-2 text-sm font-semibold ${activeTab === "specs" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted"}`}>Specifications</button>
          <button onClick={() => setActiveTab("reviews")} className={`border-b-2 px-3 py-2 text-sm font-semibold ${activeTab === "reviews" ? "border-brand-primary text-brand-primary" : "border-transparent text-text-muted"}`}>Reviews ({reviewStats.count || 0})</button>
        </div>

        {activeTab === "desc" && (
          <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
            <div className="rounded-xl border border-border bg-background-main p-4">
              <h3 className="mb-2 text-base font-bold text-text-main">About this product</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-text-muted">
                {product.description || "Premium quality product curated for modern homes with comfort, durability, and beautiful finish."}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background-main p-4">
              <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-main">Quick Highlights</h4>
              <ul className="space-y-1 text-sm text-text-muted">
                <li>KING BEDSHEET : 108X108 INCHES</li>
                <li>2 PILLOW COVER : 20X30 INCHES</li>
                <li>GSM : 125</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === "specs" && (
          <div className="overflow-hidden rounded-xl border border-border bg-background-main">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-border"><td className="bg-background-soft px-4 py-3 font-semibold text-text-main">Product</td><td className="px-4 py-3 text-text-muted">{product.title}</td></tr>
                <tr className="border-b border-border"><td className="bg-background-soft px-4 py-3 font-semibold text-text-main">Category</td><td className="px-4 py-3 text-text-muted">{product.category || "Home"}</td></tr>
                <tr className="border-b border-border"><td className="bg-background-soft px-4 py-3 font-semibold text-text-main">Collection</td><td className="px-4 py-3 text-text-muted">{product.collection || "-"}</td></tr>
                <tr className="border-b border-border"><td className="bg-background-soft px-4 py-3 font-semibold text-text-main">Size</td><td className="px-4 py-3 text-text-muted">{product.size || "-"}</td></tr>
                <tr><td className="bg-background-soft px-4 py-3 font-semibold text-text-main">SKU</td><td className="px-4 py-3 text-text-muted">{product.slug}</td></tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "reviews" && (
          <div className="grid gap-4 md:grid-cols-[280px_1fr]">
            <div className="rounded-xl border border-border bg-background-main p-4 text-center">
              <p className="text-4xl font-black text-brand-primary">{(reviewStats.average || 0).toFixed(1)}</p>
              <p className="mt-1 text-sm text-text-muted">Based on {reviewStats.count || 0} reviews</p>
            </div>
            <div className="space-y-3">
              {reviewLoading ? (
                <div className="rounded-xl border border-border bg-background-main p-4 text-sm text-text-muted">Loading reviews...</div>
              ) : reviewList.length === 0 ? (
                <div className="rounded-xl border border-border bg-background-main p-4 text-sm text-text-muted">
                  No customer reviews yet. Be the first to review this product from your account orders.
                </div>
              ) : (
                reviewList.slice(0, 8).map((review) => (
                  <div key={review.id} className="rounded-xl border border-border bg-background-main p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex h-9 w-9 min-w-[2.25rem] items-center justify-center rounded-full border border-brand-primary/35 bg-white text-[12px] font-extrabold leading-none text-brand-primary shadow-sm">
                          {String(review.user_name || "VC")
                            .split(" ")
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((part) => part[0]?.toUpperCase() || "")
                            .join("")}
                        </span>
                        <p className="text-sm font-semibold text-text-main">{review.user_name || "Verified Customer"}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-text-soft"}`} />
                        ))}
                      </div>
                    </div>
                    {review.title ? <p className="mt-1 text-sm font-semibold text-text-main">{review.title}</p> : null}
                    {review.comment ? <p className="mt-1 text-sm text-text-muted">{review.comment}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
