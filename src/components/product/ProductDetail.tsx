"use client";

import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Share2,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Percent,
  CreditCard,
  Sparkles,
  Gift,
  Check,
  XCircle
} from "lucide-react";
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
  const { addToCart, toggleCartItem, isInCart, isWishlisted, toggleWishlist } = useShop();

  // ─── 1. Variant / Size State ─────────────────────────────────────────────
  const [selectedVariant, setSelectedVariant] = useState<
    NonNullable<Product["variantOptions"]>[number] | null
  >(() => {
    if (product.variantOptions && product.variantOptions.length > 0) {
      const matching = product.variantOptions.find(
        (v) => v.size?.toLowerCase() === product.size?.toLowerCase()
      );
      return matching || product.variantOptions[0];
    }
    return null;
  });

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentMrp   = selectedVariant ? selectedVariant.mrp   : product.mrp;
  const currentSize  = selectedVariant ? selectedVariant.size || selectedVariant.label : product.size;
  const currentSku   = selectedVariant ? selectedVariant.sku   : product.slug;
  const discount     = discountFor(currentPrice, currentMrp);

  const productToCart = useMemo(() => ({
    ...product,
    price: currentPrice,
    mrp:   currentMrp,
    size:  currentSize ? String(currentSize) : undefined,
    sku:   currentSku,
    title: selectedVariant ? `${product.title} (${currentSize})` : product.title,
  } as Product), [product, currentPrice, currentMrp, currentSize, currentSku, selectedVariant]);

  const inCart    = isInCart(productToCart.slug);
  const wishlisted = isWishlisted(product.slug);

  // ─── 2. Images & Gallery ─────────────────────────────────────────────────
  const images = useMemo(() => {
    const normalized = (product.gallery?.length ? product.gallery : [product.image]).filter(Boolean);
    return Array.from(new Set(normalized)).slice(0, 10);
  }, [product.gallery, product.image]);

  const [activeImage, setActiveImage] = useState(images[0] || product.image);

  useEffect(() => {
    setActiveImage(images[0] || product.image);
  }, [images, product.image]);

  // ─── 3. UI State ─────────────────────────────────────────────────────────
  const [sizeDropdownOpen, setSizeDropdownOpen]   = useState(false);
  const [pincode, setPincode]                     = useState("");
  const [pincodeStatus, setPincodeStatus]         = useState<"idle" | "ok" | "error">("idle");
  const [pincodeMessage, setPincodeMessage]       = useState("");
  const [buying, setBuying]                       = useState(false);
  const [activeTab, setActiveTab]                 = useState<"desc" | "specs" | "reviews">("desc");
  const [showStickyBar, setShowStickyBar]         = useState(false);
  const [faqOpen, setFaqOpen]                     = useState<number | null>(null);

  // ─── 4. Sticky CTA ───────────────────────────────────────────────────────
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!ctaRef.current) return;
      setShowStickyBar(ctaRef.current.getBoundingClientRect().bottom < 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ─── 5. Reviews ──────────────────────────────────────────────────────────
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewList, setReviewList]       = useState<Array<{
    id: string; rating: number; title: string | null;
    comment: string | null; user_name: string | null; created_at: string;
  }>>([]);
  const [reviewStats, setReviewStats] = useState<{ average: number; count: number }>({
    average: product.rating || 0,
    count:   product.reviews || 0,
  });
  const fetchedReviewsForSlugRef = useRef<string>("");

  const distribution = useMemo(() => {
    if (reviewList.length === 0) {
      if (reviewStats.count === 0)
        return [5, 4, 3, 2, 1].map((stars) => ({ stars, pct: 0 }));
      return [
        { stars: 5, pct: 86 }, { stars: 4, pct: 10 },
        { stars: 3, pct: 3  }, { stars: 2, pct: 1  }, { stars: 1, pct: 0 },
      ];
    }
    const counts = [0, 0, 0, 0, 0, 0];
    reviewList.forEach((r) => {
      const rating = Math.round(r.rating);
      if (rating >= 1 && rating <= 5) counts[rating]++;
    });
    const total = reviewList.length;
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      pct: Math.round((counts[stars] / total) * 100),
    }));
  }, [reviewList, reviewStats.count]);

  useEffect(() => {
    addRecentlyViewedProduct(product);
  }, [product]);

  useEffect(() => {
    if (!product.slug || fetchedReviewsForSlugRef.current === product.slug) return;
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
            count:   Number(data.stats.count   || 0),
          });
        }
        fetchedReviewsForSlugRef.current = product.slug;
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setReviewLoading(false); });
    return () => { cancelled = true; controller.abort(); };
  }, [product.slug]);

  // ─── 6. Helpers ──────────────────────────────────────────────────────────
  const activeIndex = Math.max(0, images.indexOf(activeImage));

  function showPrevImage() {
    if (images.length <= 1) return;
    setActiveImage(images[activeIndex <= 0 ? images.length - 1 : activeIndex - 1]);
  }
  function showNextImage() {
    if (images.length <= 1) return;
    setActiveImage(images[activeIndex >= images.length - 1 ? 0 : activeIndex + 1]);
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
    const minDate = new Date(); minDate.setDate(minDate.getDate() + 3);
    const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    setPincodeStatus("ok");
    setPincodeMessage(
      `Delivery expected between ${fmt(minDate)} – ${fmt(maxDate)}. Cash on Delivery (COD) available.`
    );
  }

  const handleShare = () => {
    if (typeof window === "undefined") return;
    if (navigator.share) {
      navigator.share({ title: product.title, text: product.description, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const faqs = [
    {
      q: "Do we need to wash the fitted bedsheets before using them?",
      a: "Yes, we highly recommend washing your bedsheets in cold water with mild detergent before first use to soften the cotton fibers and set the dyes.",
    },
    {
      q: "Is the elastic stitched all around the periphery?",
      a: "Yes, QuirkyHome fitted bedsheets feature a heavy-duty, long-lasting elastic stitched all around the entire border (360-degree), ensuring a snug, tuck-free fit that doesn't slip off the mattress.",
    },
    {
      q: "How do I choose the correct size for my mattress?",
      a: "Measure the exact length, width, and height (thickness) of your mattress. Our fitted sheets have deep pockets to accommodate mattress thicknesses up to 8 inches.",
    },
    {
      q: "What is the thread count (TC) and material?",
      a: "Our fitted bedsheets are crafted from 100% premium long-staple cotton with a 200 Thread Count (TC) in a percale weave, offering a cool, crisp, and breathable sleeping experience.",
    },
    {
      q: "What is your replacement and refund policy?",
      a: "We offer a 10-day replacement window for any manufacturing defects or wrong items received. Refunds are processed to the original payment method upon return verification.",
    },
  ];

  // ─── Coupon copy state ────────────────────────────────────────────────────
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 md:py-8 font-sans pb-28 md:pb-12">

      {/* ═══════════════════════════════════════════════════════════════════
          TOP GRID: Image Gallery  +  Purchase Details
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-10 lg:items-start">

        {/* ── LEFT: Image Gallery ───────────────────────────────────────── */}
        <div className="w-full">
          {/* ── Main Image ── */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#E6E7E8] bg-[#F9FAFC]"
               style={{ aspectRatio: "1 / 1" }}>
            <Image
              src={activeImage}
              alt={product.title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out hover:scale-105 cursor-zoom-in"
            />

            {/* Badges */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-1 z-10">
              {discount > 0 && <Badge variant="sale">{discount}% Off</Badge>}
              {product.badge && <Badge variant="secondary">{product.badge}</Badge>}
            </div>

            {/* Prev / Next arrows */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10
                             h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center
                             rounded-full bg-black/35 text-white hover:bg-black/55
                             transition-colors active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10
                             h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center
                             rounded-full bg-black/35 text-white hover:bg-black/55
                             transition-colors active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10
                            flex gap-1 bg-black/15 px-2 py-1 rounded-full">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(images[i])}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/45"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* ── Thumbnails (7-card viewport, hidden scrollbar) ── */}
          {images.length > 1 && (
            <div className="mt-3 flex w-full max-w-[322px] gap-1.5 overflow-x-auto pb-1
                            hide-scrollbar snap-x snap-mandatory sm:max-w-[364px]
                            md:max-w-[420px] lg:max-w-[454px]">
              {images.map((img, idx) => {
                const isActive = img === activeImage;
                return (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    aria-label={`View image ${idx + 1}`}
                    className={`relative flex-shrink-0 snap-start rounded-xl overflow-hidden
                                border-2 transition-all active:scale-95
                                h-10 w-10 sm:h-11 sm:w-11 md:h-[52px] md:w-[52px] lg:h-[58px] lg:w-[58px]
                                ${isActive
                                  ? "border-[#432F83] ring-2 ring-[#432F83]/20"
                                  : "border-[#E6E7E8] hover:border-[#432F83]/40"
                                }`}
                  >
                    <Image src={img} alt={`${product.title} ${idx + 1}`} fill sizes="80px" className="object-cover" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Purchase Panel ─────────────────────────────────────── */}
        <div className="flex flex-col gap-3 text-[#575757] font-sans">

          {/* Breadcrumbs */}
          <nav className="flex flex-wrap items-center gap-1
                          text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#7d7e7f]">
            <span className="hover:text-[#432F83] cursor-pointer">Home</span>
            <span>/</span>
            <span className="hover:text-[#432F83] cursor-pointer capitalize">{product.category || "bedding"}</span>
            {product.collection && (
              <>
                <span>/</span>
                <span className="hover:text-[#432F83] cursor-pointer capitalize">{product.collection}</span>
              </>
            )}
          </nav>

          {/* Title + Share / Wishlist */}
          <div className="flex items-start justify-between gap-2.5">
            <h1 className="font-sans text-[15px] md:text-base font-bold leading-snug text-[#231F20]">
              {product.title}
            </h1>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={handleShare}
                className="h-7 w-7 flex items-center justify-center rounded-full
                           bg-[#F9FAFC] border border-[#E6E7E8] text-[#575757]
                           hover:bg-[#432F83] hover:text-white transition-all active:scale-95"
                aria-label="Share product"
              >
                <Share2 className="h-3 w-3" />
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`h-7 w-7 flex items-center justify-center rounded-full border transition-all active:scale-95 ${
                  wishlisted
                    ? "border-[#432F83]/25 bg-[#F3EDFE] text-[#432F83] shadow-[0_4px_12px_rgba(67,47,131,0.16)]"
                    : "border-[#E7E0FC] bg-white text-[#7A6AAE] hover:border-[#432F83]/35 hover:bg-[#F8F4FF] hover:text-[#432F83]"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart className={`h-3 w-3 ${wishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* Ratings + SKU row */}
          <div className="flex flex-wrap items-center gap-1.5 pb-2.5 border-b border-[#E6E7E8]/60 text-[9px] sm:text-[10px] font-semibold">
            <a
              href="#customerReviews"
              className="flex items-center gap-0.5 rounded border border-[#E6E7E8]
                         px-1.5 py-0.5 text-[#333333] hover:bg-[#F9FAFC] transition-colors"
            >
              <span className="font-extrabold">{reviewStats.average.toFixed(1)}</span>
              <Star className="h-3 w-3 fill-[#FBBF24] text-[#FBBF24]" />
              <span className="text-[#909090] font-normal">({reviewStats.count})</span>
            </a>
            <span className="text-[#909090] hidden sm:inline">|</span>
            <span className="text-[#333333] hidden sm:inline text-[10px]">SKU: {currentSku}</span>
            <span className="text-[#909090]">|</span>
            <span className="text-[#129C80] bg-[#E8F8F5] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <CheckCircle2 className="h-3 w-3 text-[#129C80]" /> 100% Cotton
            </span>
          </div>

          {/* Promo ticker */}
          <div className="flex items-center rounded-[4px] border border-[#E7E0FC]
                          overflow-hidden text-[9px] sm:text-[10px] bg-[#F7F5FD] h-[26px] sm:h-7">
            <div className="bg-[#E7E0FC] text-[#432F83] font-bold px-2 h-full
                            flex items-center justify-center tracking-wide uppercase shrink-0 text-[9px] sm:text-[10px]">
              HOME SALE
            </div>
            <div className="h-0 w-0 border-y-[14px] border-l-[8px]
                            border-y-[#F7F5FD] border-l-[#E7E0FC] border-r-0 shrink-0" />
            <div className="text-[#432F83] px-2 font-semibold flex-1 flex items-center gap-1.5 overflow-hidden min-w-0">
              <span className="truncate text-[9px] sm:text-[10px]">ENDS SOON!</span>
              <span className="h-1 w-1 rounded-full bg-[#432F83] animate-pulse shrink-0" />
              <span className="font-normal text-[#575757] truncate text-[9px] sm:text-[10px]">
                Use code QuirkyHome
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex flex-wrap items-baseline gap-2 pb-3 border-b border-[#E6E7E8]/60">
            <span className="text-xl sm:text-2xl font-extrabold text-[#432F83]">
              {formatPrice(currentPrice)}
            </span>
            {currentMrp > currentPrice && (
              <>
                <span className="text-sm text-[#909090] line-through font-medium">
                  MRP {formatPrice(currentMrp)}
                </span>
                <span className="text-sm font-bold text-[#129C80]">({discount}% off)</span>
              </>
            )}
            <span className="text-[9px] text-[#909090] font-medium">(Incl of all Taxes)</span>
          </div>

          {/* Delivery + Variant — stacked on mobile, side-by-side on md+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Pincode */}
            <div>
              <p className="text-[10px] font-bold text-[#231F20] mb-1.5">Check Delivery Date</p>
              <div className="flex gap-1.5 h-10">
                <input
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(e) => { if (e.key === "Enter") checkPincode(); }}
                  placeholder="Enter Pincode"
                  inputMode="numeric"
                  className="flex-1 min-w-0 rounded-lg border border-[#E6E7E8] px-3 text-xs
                             text-[#231F20] placeholder-[#909090] focus:outline-none
                             focus:border-[#432F83] focus:ring-2 focus:ring-[#432F83]/15
                             transition-all h-full"
                />
                <button
                  type="button"
                  onClick={checkPincode}
                  className="h-full rounded-lg bg-[#432F83] px-3 sm:px-4 text-[10px] font-bold
                             text-white hover:bg-[#5A31DD] transition-colors active:scale-95 shrink-0"
                >
                  CHECK
                </button>
              </div>
            </div>

            {/* Variant */}
            <div>
              <p className="text-[10px] font-bold text-[#231F20] mb-1.5">Choose Variant</p>
              {product.variantOptions && product.variantOptions.length > 0 ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                    className="flex w-full items-center justify-between h-10 rounded-lg
                               border border-[#E6E7E8] bg-white px-3 text-xs font-medium
                               text-[#231F20] hover:border-[#432F83]/40 transition-colors"
                  >
                    <span className="truncate pr-2">
                      {selectedVariant ? selectedVariant.label : "Select Variant"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 text-[#575757] shrink-0 transition-transform duration-200 ${
                        sizeDropdownOpen ? "rotate-180 text-[#432F83]" : ""
                      }`}
                    />
                  </button>

                  {sizeDropdownOpen && (
                    <div className="absolute top-[42px] left-0 right-0 z-30 bg-white
                                    border border-[#E6E7E8] rounded-lg shadow-lg
                                    max-h-44 overflow-y-auto divide-y divide-[#E6E7E8]/50">
                      {product.variantOptions.map((v, idx) => {
                        const isSelected = selectedVariant?.sku === v.sku;
                        return (
                          <button
                            key={v.sku || idx}
                            type="button"
                            onClick={() => { setSelectedVariant(v); setSizeDropdownOpen(false); }}
                            className={`flex w-full items-center justify-between px-3 py-2.5
                                        text-xs font-semibold text-left transition-colors
                                        active:bg-[#F3EDFE] ${
                                          isSelected
                                            ? "bg-[#F3EDFE] text-[#432F83]"
                                            : "text-[#575757] hover:bg-[#F8FAFC]"
                                        }`}
                          >
                            <span>{v.label}</span>
                            <span className="text-[#909090] font-normal ml-2 shrink-0">
                              {formatPrice(v.price)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center h-10 rounded-lg border border-[#E6E7E8]
                                bg-[#F9FAFC] px-3 text-xs font-bold text-[#333333]">
                  {String(product.size || "STANDARD").toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* Delivery result */}
          {pincodeStatus !== "idle" && (
            <div
              className={`flex items-start gap-2 rounded-lg px-3 py-2.5 text-xs border ${
                pincodeStatus === "ok"
                  ? "border-emerald-100 bg-[#E8F8F5] text-emerald-800"
                  : "border-red-100 bg-[#FDEDEC] text-red-800"
              }`}
            >
              {pincodeStatus === "ok"
                ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                : <AlertCircle   className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              }
              <p className="leading-snug">{pincodeMessage}</p>
            </div>
          )}

          {/* Login cash promo */}
          <div className="flex items-center justify-between gap-3 rounded-xl
                          border border-[#E6E7E8] bg-[#F9FAFC] px-3 py-2.5">
            <p className="text-[10px] text-[#575757] leading-snug min-w-0 truncate">
              Log in to get up to ₹1000 QuirkyHome Cash on your 1st order
            </p>
            <Link href="/account"
              className="text-[#432F83] font-bold hover:underline shrink-0 text-xs">
              Login
            </Link>
          </div>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => toggleCartItem(productToCart)}
              className={`flex w-full items-center justify-center gap-1.5 h-12 rounded-xl
                          border border-[#432F83] text-sm font-bold transition-colors
                          active:scale-[.98] ${
                            inCart
                              ? "bg-[#F3EDFE] text-[#432F83]"
                              : "bg-white text-[#432F83] hover:bg-[#F3EDFE]"
                          }`}
            >
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span>{inCart ? "Remove" : "Add to Cart"}</span>
            </button>
            <button
              type="button"
              disabled={buying}
              onClick={async () => {
                setBuying(true);
                try {
                  await addToCart(productToCart);
                  window.location.href = "/checkout";
                } catch { setBuying(false); }
              }}
              className="flex w-full items-center justify-center h-12 rounded-xl
                         bg-[#432F83] text-sm font-bold text-white
                         hover:bg-[#5A31DD] transition-colors active:scale-[.98]
                         disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {buying ? "Processing…" : "Buy Now"}
            </button>
          </div>

          {/* Coupon Cards */}
          <div className="border-t border-[#E6E7E8]/60 pt-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Percent className="h-3.5 w-3.5 text-[#129C80]" />
              <h3 className="text-[10px] font-bold text-[#333333] uppercase tracking-wider">
                Save Extra with Below Offers
              </h3>
            </div>

            {/* ── Horizontal scrollable coupon row ── */}
            <div className="flex gap-2.5 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory
                            -mx-3 px-3 sm:mx-0 sm:px-0">
              {[
                {
                  icon: <ShoppingBag className="h-3.5 w-3.5 shrink-0" />,
                  label: "MobiKwik",
                  desc: (<>Get up to <strong className="text-[#129C80]">10% Cashback</strong> via MobiKwik.</>),
                  code: "MBK10",
                },
                {
                  icon: <CreditCard className="h-3.5 w-3.5 shrink-0" />,
                  label: "ICICI Bank",
                  desc: (<>Flat <strong className="text-[#129C80]">10% Instant Off</strong> up to ₹1,500.</>),
                  code: "ICICI10",
                },
                {
                  icon: <Sparkles className="h-3.5 w-3.5 shrink-0" />,
                  label: "First Order",
                  desc: (<>Flat <strong className="text-[#129C80]">10% Off</strong> on your 1st order.</>),
                  code: "WELCOME10",
                },
                {
                  icon: <Gift className="h-3.5 w-3.5 shrink-0" />,
                  label: "Combo Save",
                  desc: (<>Buy any <strong className="text-[#129C80]">2 Bedding Items</strong> and save ₹200.</>),
                  code: "COMBOBED",
                },
              ].map((c) => (
                <div
                  key={c.code}
                  className="w-[148px] sm:w-[155px] shrink-0 snap-start bg-white
                             border border-dashed border-[#E7E0FC] hover:border-[#432F83]
                             transition-colors p-2.5 rounded-xl flex flex-col justify-between
                             h-[102px]"
                >
                  <div>
                    <div className="flex items-center gap-1 text-[#432F83] mb-1">
                      {c.icon}
                      <span className="text-[9px] font-bold tracking-tight uppercase">{c.label}</span>
                    </div>
                    <p className="text-[9px] text-[#575757] font-medium leading-snug">{c.desc}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-[#E6E7E8]/60 pt-1.5 mt-1">
                    <span className="text-[8px] font-extrabold text-[#7d7e7f] tracking-wider
                                     bg-[#F9FAFC] px-1.5 py-0.5 rounded border border-[#E6E7E8]
                                     font-mono select-all">
                      {c.code}
                    </span>
                    <button
                      onClick={() => copyCode(c.code)}
                      className="text-[9px] font-bold text-[#432F83] hover:underline active:scale-95
                                 transition-all shrink-0 ml-1"
                    >
                      {copiedCode === c.code ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST BADGES
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="mt-6 rounded-2xl border border-[#432F83]/10 bg-[#F9FAFC] p-4 md:p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-[#E6E7E8]">
          {[
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "10 Days Replacement",
              desc: "For manufacturing defects or wrong items.",
            },
            {
              icon: <RotateCcw className="h-5 w-5" />,
              title: "10 Days Exchange",
              desc: "Bedsheets & protectors exchange for ₹199.",
            },
            {
              icon: <XCircle className="h-5 w-5" />,
              title: "Free Cancellation",
              desc: "Cancel easily till shipment starts.",
            },
            {
              icon: <Truck className="h-5 w-5" />,
              title: "Free Shipping",
              desc: "Free delivery all over India.",
            },
          ].map((item, i) => (
            <div key={i}
              className="flex items-center gap-3 md:flex-col md:items-center md:text-center md:px-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center
                              rounded-full bg-[#432F83]/10 text-[#432F83]">
                {item.icon}
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#231F20] leading-snug">{item.title}</h4>
                <p className="text-[10px] text-[#575757] mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TABS: Description / Specs / Reviews
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="mt-6 rounded-2xl border border-[#E6E7E8] bg-white shadow-sm overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-[#E6E7E8] overflow-x-auto
                        scrollbar-none snap-x snap-mandatory">
          {(["desc", "specs", "reviews"] as const).map((tab) => {
            const labels: Record<string, string> = {
              desc: "Product Details",
              specs: "Specifications",
              reviews: `Reviews (${reviewStats.count})`,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`snap-start shrink-0 border-b-2 px-4 md:px-6 py-3.5
                            text-xs sm:text-sm font-bold transition-all -mb-px
                            hover:text-[#432F83] whitespace-nowrap ${
                              activeTab === tab
                                ? "border-[#432F83] text-[#432F83]"
                                : "border-transparent text-[#909090]"
                            }`}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-4 md:p-6">

          {/* Description */}
          {activeTab === "desc" && (
            <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
              <div className="rounded-xl border border-[#E6E7E8] bg-white p-4 md:p-5">
                <h4 className="mb-3 text-xs font-bold text-[#333333] uppercase tracking-wider">
                  About this product
                </h4>
                <p className="whitespace-pre-line text-sm leading-relaxed text-[#575757]">
                  {product.description ||
                    "Premium quality product curated for modern homes with comfort, durability, and a beautiful finish."}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-[#575757]">
                  Crafted from high-grade cotton yarn, these fitted bedsheets offer a clean percale weave
                  that remains breathable and crisp night after night. Featuring an elastic band stitched
                  all along the 360-degree border, it hugs mattresses snugly up to 8 inches in height,
                  preventing untidy folds or bunching.
                </p>
              </div>

              <div className="rounded-xl border border-[#E6E7E8] bg-[#FDFDFE] p-4 md:p-5">
                <h4 className="mb-3.5 text-xs font-bold uppercase tracking-wider text-[#333333]">
                  Key Highlights
                </h4>
                <ul className="space-y-3 text-xs font-semibold text-[#575757]">
                  {[
                    "200 Thread Count Long-Staple Cotton",
                    "360-Degree Premium Elastic Border",
                    "Breathable and Cool Percale Weave",
                    'Deep Pockets fit up to 8" Mattresses',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-[#129C80] shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Specifications */}
          {activeTab === "specs" && (
            <div className="overflow-x-auto rounded-xl border border-[#E6E7E8] bg-white shadow-sm">
              <table className="w-full text-xs font-medium min-w-[280px]">
                <tbody className="divide-y divide-[#E6E7E8]/60">
                  {[
                    ["Product Name",   product.title],
                    ["Category",       product.category || "Home Decor"],
                    ...(product.collection ? [["Collection", product.collection]] : []),
                    ["Selected Size",  String(currentSize || "-").toUpperCase()],
                    ["Thread Count",   "200 TC"],
                    ["Weave Style",    "Percale"],
                    ["Elastic Stitch", "360-Degree Heavy Elastic"],
                    ["SKU Reference",  currentSku],
                  ].map(([label, value]) => (
                    <tr key={label} className="hover:bg-[#F9FAFC] transition-colors">
                      <td className="bg-[#F9FAFC] px-4 py-3 font-bold text-[#333333] whitespace-nowrap w-2/5">
                        {label}
                      </td>
                      <td className="px-4 py-3 text-[#575757]">
                        {label === "SKU Reference" ? (
                          <span className="font-mono text-[10px] font-bold text-[#432F83]
                                           bg-[#F3EDFE] px-2 py-0.5 rounded
                                           border border-[#E7E0FC] select-all break-all">
                            {value}
                          </span>
                        ) : value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <div id="customerReviews">
              {/* Customer photo strip */}
              <div className="mb-5 bg-[#F9FAFC] p-4 rounded-xl border border-[#E6E7E8]">
                <h4 className="text-[10px] font-bold text-[#333333] uppercase tracking-wider mb-3">
                  Images / Videos posted by Customers
                </h4>
                <div className="flex gap-2.5 overflow-x-auto pb-1 snap-x snap-mandatory
                                scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#E6E7E8]">
                  {[
                    "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=300&q=80",
                    "https://images.unsplash.com/photo-1616627561950-9f746e330187?auto=format&fit=crop&w=300&q=80",
                  ].map((url, idx) => (
                    <div key={idx}
                      className="relative flex-shrink-0 snap-start h-20 w-20 sm:h-24 sm:w-24
                                 overflow-hidden rounded-xl border border-[#E6E7E8] bg-white
                                 cursor-pointer group">
                      <Image
                        src={url}
                        alt={`Customer review media ${idx + 1}`}
                        fill sizes="120px"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-[260px_1fr]">
                {/* Summary box */}
                <div className="rounded-xl border border-[#E6E7E8] bg-white p-4 text-center shadow-sm
                                h-fit self-start sticky top-4">
                  <p className="text-3xl font-black text-[#432F83]">
                    {(reviewStats.average || 0).toFixed(1)}
                  </p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} className={`h-4 w-4 ${
                        n <= Math.round(reviewStats.average)
                          ? "fill-[#FBBF24] text-[#FBBF24]"
                          : "text-[#E6E7E8]"
                      }`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-[#909090] font-bold">
                    Based on {reviewStats.count} {reviewStats.count === 1 ? "review" : "reviews"}
                  </p>
                  <div className="mt-4 space-y-2 text-left border-t border-[#E6E7E8]/60 pt-4">
                    {distribution.map((d) => (
                      <div key={d.stars} className="flex items-center gap-2.5 text-[11px] font-bold text-[#575757]">
                        <span className="w-4 shrink-0">{d.stars}★</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#432F83] rounded-full transition-all duration-500"
                               style={{ width: `${d.pct}%` }} />
                        </div>
                        <span className="w-7 text-right text-gray-400 shrink-0 text-[10px]">{d.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review list */}
                <div className="space-y-3">
                  {reviewLoading ? (
                    <div className="rounded-xl border border-[#E6E7E8] p-5 text-sm text-[#909090] text-center">
                      Loading customer reviews…
                    </div>
                  ) : reviewList.length === 0 ? (
                    <div className="rounded-xl border border-[#E6E7E8] p-5 text-sm text-[#909090] text-center">
                      No customer reviews yet. Be the first to review this product from your account orders.
                    </div>
                  ) : (
                    reviewList.slice(0, 8).map((review) => (
                      <div key={review.id}
                        className="rounded-xl border border-[#E6E7E8] bg-white p-4
                                   hover:border-[#432F83]/30 transition-colors">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center
                                             rounded-full bg-[#F3EDFE] text-[10px] font-black
                                             text-[#432F83] border border-[#432F83]/20">
                              {String(review.user_name || "VC")
                                .split(" ").filter(Boolean).slice(0, 2)
                                .map((p) => p[0]?.toUpperCase() || "").join("")}
                            </span>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <p className="text-xs font-bold text-[#333333] truncate">
                                  {review.user_name || "Verified Customer"}
                                </p>
                                <span className="inline-flex items-center gap-0.5 rounded
                                                 bg-emerald-50 px-1.5 py-0.5 text-[8px]
                                                 font-bold text-emerald-800 border border-emerald-100 shrink-0">
                                  <Check className="h-2 w-2 text-emerald-600 stroke-[3]" /> Verified
                                </span>
                              </div>
                              <p className="text-[9px] text-[#909090] mt-0.5 font-medium">
                                {new Date(review.created_at).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "short", year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star key={n} className={`h-3.5 w-3.5 ${
                                n <= review.rating ? "fill-[#FBBF24] text-[#FBBF24]" : "text-[#E6E7E8]"
                              }`} />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <p className="mt-2.5 text-xs font-bold text-[#333333]">{review.title}</p>
                        )}
                        {review.comment && (
                          <p className="mt-1 text-xs leading-relaxed text-[#575757] whitespace-pre-wrap">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQs
      ═══════════════════════════════════════════════════════════════════ */}
      <div className="mt-8">
        <div className="relative inline-block pb-2.5 mb-5">
          <h3 className="text-lg font-bold text-[#333333] tracking-tight">FAQs</h3>
          <span className="absolute bottom-0 left-0 h-[3px] w-9 rounded-full bg-[#5A31DD]" />
        </div>

        <div className="divide-y divide-[#E6E7E8] rounded-2xl border border-[#E6E7E8]
                        bg-white overflow-hidden shadow-sm">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div key={idx}>
                <button
                  type="button"
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between
                             px-4 md:px-5 py-4 text-left
                             text-xs sm:text-sm font-bold text-[#333333]
                             hover:bg-[#F9FAFC] transition-colors active:bg-[#F3EDFE]"
                >
                  <span className="pr-4 leading-snug">{faq.q}</span>
                  <ChevronDown
                    className={`h-4.5 w-4.5 shrink-0 text-[#909090] transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-[#432F83]" : ""
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-60" : "max-h-0"
                  }`}
                >
                  <p className="border-t border-[#E6E7E8] bg-[#F9FAFC]
                                px-4 md:px-5 py-4 text-xs leading-relaxed
                                text-[#575757] whitespace-pre-line">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY BOTTOM BAR (mobile only)
      ═══════════════════════════════════════════════════════════════════ */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden
                    bg-white border-t border-[#E6E7E8]
                    shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
                    transition-transform duration-300 ease-out
                    ${showStickyBar ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          {/* Price info */}
          <div className="min-w-0 flex-1 max-w-[130px]">
            <p className="text-[9px] font-semibold text-[#7d7e7f] truncate leading-none mb-0.5">
              {product.title}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[13px] font-extrabold text-[#432F83]">
                {formatPrice(currentPrice)}
              </span>
              {currentMrp > currentPrice && (
                <span className="text-[9px] text-[#909090] line-through font-medium">
                  {formatPrice(currentMrp)}
                </span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => toggleCartItem(productToCart)}
              className={`flex items-center justify-center gap-1 h-10 px-4 rounded-xl
                          border border-[#432F83] text-[11px] font-bold transition-colors
                          active:scale-[.97] ${
                            inCart
                              ? "bg-[#F3EDFE] text-[#432F83]"
                              : "bg-white text-[#432F83]"
                          }`}
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              {inCart ? "Remove" : "Cart"}
            </button>
            <button
              type="button"
              disabled={buying}
              onClick={async () => {
                setBuying(true);
                try {
                  await addToCart(productToCart);
                  window.location.href = "/checkout";
                } catch { setBuying(false); }
              }}
              className="flex items-center justify-center h-10 px-5 rounded-xl
                         bg-[#432F83] text-[11px] font-bold text-white
                         hover:bg-[#5A31DD] transition-colors active:scale-[.97]
                         disabled:opacity-70"
            >
              {buying ? "…" : "Buy Now"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
