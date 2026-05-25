"use client";

import Image from "next/image";
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Share2, ChevronLeft, ChevronRight, Star, ChevronDown, MapPin, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Product } from "@/data/products";
import { discountFor, formatPrice } from "@/data/products";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";
import Link from "next/link";
import { useMemo, useState } from "react";

type DescriptionSections = {
  highlights?: string;
  details?: string;
  care?: string;
};

function parseDescriptionSections(product: Product): DescriptionSections | null {
  const raw = (product as any).long_description || (product as any).longDescription;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && (parsed.highlights || parsed.details || parsed.care)) {
      return parsed;
    }
  } catch {
    // Not JSON; return as highlights
    if (typeof raw === "string" && raw.trim()) {
      return { highlights: raw };
    }
  }
  return null;
}

function DescriptionAccordion({
  title,
  content,
  icon,
  defaultOpen = false,
}: {
  title: string;
  content: any;
  icon?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const hasContent = Array.isArray(content)
    ? content.length > 0 && content.some(r => r.value?.trim())
    : typeof content === "string" && content.trim();

  if (!hasContent) return null;

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-0 py-4 text-left"
      >
        <span className="flex items-center gap-2.5 text-sm font-bold text-text-main md:text-[15px]">
          {icon && <span className="text-base">{icon}</span>}
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-text-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? "max-h-[1000px] pb-5 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="text-sm leading-relaxed text-text-muted md:text-[14px]">
          {Array.isArray(content) ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-2">
              {content.map((row: any, idx: number) => {
                if (!row.value?.trim()) return null;
                return (
                  <div key={idx} className="border-b border-border/40 pb-2.5">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-text-soft">
                      {row.label || "Detail"}
                    </span>
                    <span className="mt-1 block text-sm font-bold text-text-main">
                      {row.value}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="whitespace-pre-line">
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const activeIndex = Math.max(0, images.indexOf(activeImage));
  const previewThumbs = images.slice(0, 3);
  const extraCount = Math.max(0, images.length - 3);

  const descSections = useMemo(() => parseDescriptionSections(product), [product]);

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
    <section className="qh-container qh-section-pad grid gap-8 overflow-hidden lg:grid-cols-2 lg:items-start">
      <div className="grid w-full gap-4 overflow-hidden md:gap-5 qh-detail-gallery-grid">
        <div className="order-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 md:order-1 md:grid md:grid-cols-1 md:content-start md:gap-3 md:overflow-visible">
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

      <div className="qh-card w-full overflow-hidden p-5 lg:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant="sale">{discount}% Off</Badge>
          <Badge variant="secondary">{product.badge}</Badge>
        </div>
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
        {product.description && <p className="mt-2.5 text-[12px] leading-relaxed text-text-muted md:text-[13px]">{product.description}</p>}

        {collectionProducts.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-main md:text-xs">Variants</p>
            <div className="flex flex-wrap gap-2">
              {collectionProducts.map((p) => (
                <Link key={p.slug} href={`/${p.slug}`} className={`relative h-14 w-14 overflow-hidden rounded-md border-2 transition-all ${p.slug === product.slug ? "border-brand-primary ring-2 ring-brand-primary/20" : "border-border hover:border-text-soft"}`}>
                  <Image src={(p.gallery && p.gallery[0]) || p.image} alt={p.title} fill sizes="3.5rem" className="object-cover" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {product.size && (
          <div className="mt-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-text-main md:text-xs">Size</p>
            <div className="inline-flex items-center justify-center rounded-lg border-2 border-brand-primary bg-brand-primary/5 px-4 py-2 text-sm font-semibold text-brand-primary">
              {product.size}
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap items-baseline gap-2.5">
          <span className="text-xl font-bold text-text-main md:text-2xl">{formatPrice(product.price)}</span>
          <span className="text-sm text-text-soft line-through md:text-base">{formatPrice(product.mrp)}</span>
          <span className="text-[11px] font-semibold text-accent-discount md:text-xs">Inclusive of all taxes</span>
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

        {/* ── Description Sections (Myntra/Amazon style accordions) ── */}
        {descSections && (descSections.highlights || descSections.details || descSections.care) && (
          <div className="mt-8 border-t border-border pt-2">
            <DescriptionAccordion
              title="Highlights"
              content={descSections.highlights || ""}
              defaultOpen={true}
            />
            <DescriptionAccordion
              title="Details & Specifications"
              content={descSections.details || ""}
            />
            <DescriptionAccordion
              title="Care Instructions"
              content={descSections.care || ""}
            />
          </div>
        )}

        <div className="mt-8 grid grid-cols-3 gap-2 border-t border-border pt-6">
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
