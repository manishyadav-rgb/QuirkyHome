"use client";

import { Camera, Search, ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/data/products";
import { categories } from "@/data/categories";
import Link from "next/link";

type SlimProduct = {
  title: string;
  slug: string;
  image: string;
  price: number;
  mrp: number;
  category: string;
};

export function SearchBar({
  className,
  compact = false,
  withCamera = false,
}: {
  className?: string;
  compact?: boolean;
  withCamera?: boolean;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SlimProduct[]>([]);
  const [filtered, setFiltered] = useState<SlimProduct[]>([]);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // ── Dynamic Typing Placeholder Effect ──
  const typingWords = categories.slice(0, 8).map(c => c.name.toLowerCase() + "s");
  const [wordIdx, setWordIdx] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const activeWord = typingWords[wordIdx] || "bedsheets";
    
    const handleTyping = () => {
      if (!isDeleting) {
        // Typing forward
        setCurrentText(activeWord.substring(0, currentText.length + 1));
        setTypingSpeed(100);

        if (currentText === activeWord) {
          // Pause at full word before deleting
          setTypingSpeed(2500); 
          setIsDeleting(true);
        }
      } else {
        // Erasing back
        setCurrentText(activeWord.substring(0, currentText.length - 1));
        setTypingSpeed(40);

        if (currentText === "") {
          setIsDeleting(false);
          setWordIdx((prev) => (prev + 1) % typingWords.length);
          setTypingSpeed(400); // Pause before next word
        }
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, wordIdx, typingSpeed, typingWords]);

  // Load products list for instant matching
  useEffect(() => {
    async function loadSearchProducts() {
      try {
        const res = await fetch("/api/search-live");
        if (res.ok) {
          const data = await res.json();
          if (data.products) setProducts(data.products);
        }
      } catch (err) {
        console.error("Failed to load instant search data:", err);
      }
    }
    loadSearchProducts();
  }, []);

  // Perform client-side tokenized fuzzy matching instantly on keystroke
  useEffect(() => {
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length < 2) {
      setFiltered([]);
      return;
    }

    const tokens = cleanQuery.split(/[\s,\-_]+/).filter(t => t.length > 1);

    if (tokens.length === 0) {
      // Fallback for single character or short query
      const matches = products.filter(p => p.title.toLowerCase().includes(cleanQuery)).slice(0, 5);
      setFiltered(matches);
      return;
    }

    const scored = products.map((product) => {
      let score = 0;
      const titleLower = product.title.toLowerCase();
      const catLower = (product.category || "").toLowerCase();

      if (titleLower.includes(cleanQuery)) score += 100;
      if (catLower.includes(cleanQuery)) score += 50;

      tokens.forEach((token) => {
        if (titleLower === token || titleLower.startsWith(token + " ") || titleLower.endsWith(" " + token) || titleLower.includes(" " + token + " ")) {
          score += 40;
        } else if (titleLower.includes(token)) {
          score += 20;
        }
        if (catLower.includes(token)) {
          score += 15;
        }
      });

      return { product, score };
    });

    const matches = scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.product)
      .slice(0, 5);

    setFiltered(matches);
  }, [query, products]);

  // Click outside listener to automatically close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = query.trim();
    setFocused(false);
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
  }

  // Calculate unique matching categories to suggest
  const suggestedCategories = Array.from(
    new Set(
      filtered.map((p) => p.category).filter(Boolean)
    )
  ).slice(0, 3);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={onSubmit} className="relative w-full">
        <button
          type="submit"
          className="qh-focus absolute left-4 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center text-text-muted transition-colors hover:text-brand-primary"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder={`Search ${currentText}`}
          className={cn(
            "qh-focus w-full rounded-full border border-border bg-background-elevated pl-12 text-text-main shadow-soft transition-all duration-base placeholder:text-text-soft focus:border-brand-primary",
            compact ? "h-button-sm" : "h-button",
            withCamera ? "pr-16" : "pr-4",
          )}
        />
        {withCamera ? (
          <button
            type="button"
            className="qh-focus absolute right-3 top-1/2 inline-flex h-8 w-9 -translate-y-1/2 items-center justify-center border-l border-border-strong pl-3 text-text-main"
            aria-label="Search by image"
          >
            <Camera className="h-5 w-5" />
          </button>
        ) : null}
      </form>

      {/* ── Vaaree-style Instant Search Dropdown ── */}
      {focused && query.trim().length >= 2 && (
        <div className="absolute left-0 right-0 top-full z-header mt-2 max-h-[480px] overflow-y-auto rounded-2xl border border-border bg-background-main p-4 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Categories Suggestions */}
          {suggestedCategories.length > 0 && (
            <div className="mb-4 border-b border-border pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Suggested Categories</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestedCategories.map((cat) => (
                  <Link
                    key={cat}
                    href={`/${cat}`}
                    onClick={() => setFocused(false)}
                    className="inline-flex items-center gap-1 rounded-full bg-brand-primary/5 border border-brand-primary/10 px-3 py-1 text-xs font-semibold text-brand-primary hover:bg-brand-primary hover:text-text-inverse transition-all"
                  >
                    <Sparkles className="h-3 w-3 shrink-0" />
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Product Results */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Product Matches</span>
              <span className="text-[10px] text-text-soft font-semibold">{filtered.length} found</span>
            </div>
            
            {filtered.length > 0 ? (
              <div className="mt-2 divide-y divide-border">
                {filtered.map((product) => {
                  const discount = product.mrp > product.price 
                    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                    : 0;

                  return (
                    <Link
                      key={product.slug}
                      href={`/${product.slug}`}
                      onClick={() => {
                        setQuery("");
                        setFocused(false);
                      }}
                      className="flex items-center gap-3 py-2.5 hover:bg-background-soft rounded-lg px-2 -mx-2 transition-colors"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-md border border-border bg-background-soft">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      
                      {/* Product Details */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-text-main">{product.title}</p>
                        <p className="mt-0.5 text-[10px] text-text-muted capitalize">{product.category}</p>
                      </div>

                      {/* Pricing */}
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-text-main">{formatPrice(product.price)}</p>
                        {discount > 0 && (
                          <div className="mt-0.5 flex gap-1.5 justify-end items-center text-[10px]">
                            <span className="text-text-soft line-through">{formatPrice(product.mrp)}</span>
                            <span className="font-bold text-accent-discount">{discount}% off</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-text-muted">
                No exact product matches found. Try another word.
              </div>
            )}
          </div>

          {/* View All Search Button */}
          <div className="mt-3 border-t border-border pt-3">
            <button
              onClick={() => {
                setFocused(false);
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-primary/10 py-2.5 text-xs font-bold text-brand-primary hover:bg-brand-primary hover:text-text-inverse transition-all"
            >
              View All Results for "{query}"
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
