"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, Grid2X2, Layers, Menu, RotateCcw, Sparkles, Truck, UserRound, X } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { categories as fallbackCategories, type Category } from "@/data/categories";
import { collections as fallbackCollections, type Collection } from "@/data/collections";
import { Button } from "@/components/ui/Button";

export function MobileMenuTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="qh-focus inline-flex h-11 w-11 shrink-0 items-center justify-center text-text-main lg:hidden md:rounded-full md:border md:border-border md:bg-background-elevated" onClick={onOpen} aria-label="Open menu">
      <Menu className="h-7 w-7 md:h-5 md:w-5" />
    </button>
  );
}

export function MobileMenuDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [isCustomerAuthed, setIsCustomerAuthed] = useState(false);
  const [menuCategories, setMenuCategories] = useState<Category[]>(fallbackCategories);
  const [menuCollections, setMenuCollections] = useState<Collection[]>(fallbackCollections);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);

  const processedMenuCategories = useMemo(() => {
    const list: Category[] = [];
    menuCategories.forEach((cat) => {
      const slug = cat.slug?.toLowerCase();
      const name = cat.name?.toLowerCase();
      if (slug === "bedsheet" || name === "bedsheet" || slug === "bedsheets" || name === "bedsheets" || slug?.includes("bedsheet") || name?.includes("bedsheet")) return; // Skip
      if (slug === "bath-gifts" || name === "bath-gifts" || name === "bath gifts") {
        list.push({
          name: "Bath",
          slug: "bath",
          image: cat.image || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=900&q=80",
          description: "Bath linens, towels, and self-care essentials."
        });
        list.push({
          name: "Gifts",
          slug: "gifts",
          image: cat.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?auto=format&fit=crop&w=900&q=80",
          description: "Thoughtful gifting picks for occasions and festivals."
        });
      } else {
        list.push(cat);
      }
    });
    return list;
  }, [menuCategories]);

  useEffect(() => {
    let active = true;

    const loadDrawerData = async () => {
      if (!open) return;
      try {
        const [authRes, categoryRes, collectionRes] = await Promise.all([
          fetch("/api/auth/me", { cache: "no-store" }),
          fetch("/api/categories", { cache: "no-store" }),
          fetch("/api/collections", { cache: "no-store" }),
        ]);

        if (authRes.ok) {
          const authData = await authRes.json();
          if (active) {
            setIsCustomerAuthed(Boolean(authData?.authenticated && authData?.user?.role === "customer"));
          }
        } else if (active) {
          if (active) setIsCustomerAuthed(false);
        }

        if (categoryRes.ok) {
          const categoryData = await categoryRes.json();
          if (active && Array.isArray(categoryData?.categories) && categoryData.categories.length > 0) {
            setMenuCategories(categoryData.categories);
          }
        }

        if (collectionRes.ok) {
          const collectionData = await collectionRes.json();
          if (active && Array.isArray(collectionData?.collections) && collectionData.collections.length > 0) {
            setMenuCollections(collectionData.collections);
          }
        }
      } catch {
        if (active) setIsCustomerAuthed(false);
      }
    };

    loadDrawerData();
    return () => {
      active = false;
    };
  }, [open]);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-[120] qh-scrim lg:hidden">
          <div className="flex h-full qh-panel-mobile flex-col overflow-y-auto bg-background-elevated shadow-dropdown">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background-elevated px-5 py-5 shadow-soft">
              <Link href="/" className="qh-logo" onClick={onClose} aria-label="QuirkyHome">
                <img
                  src="https://res.cloudinary.com/dd4hmahlm/image/upload/v1774697521/rw9xm5nnegmsigzcke5q.png"
                  alt="QuirkyHome Logo"
                  className="h-14 w-auto object-contain mix-blend-multiply"
                />
              </Link>
              <button className="qh-focus inline-flex h-10 w-10 items-center justify-center rounded-full" onClick={onClose} aria-label="Close menu">
                <X className="h-7 w-7" />
              </button>
            </div>

            <div className="shrink-0 border-b border-border/60 bg-background-elevated px-5 py-5">
              <div className="hide-scrollbar flex gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {processedMenuCategories.slice(0, 8).map((category) => (
                <Link key={category.slug} href={`/${category.slug}`} className="group w-[72px] shrink-0 text-center" onClick={onClose} aria-label={category.name}>
                  <div className="relative mx-auto h-16 w-16 overflow-hidden rounded-full bg-background-soft ring-1 ring-border/80">
                    <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-base group-hover:scale-105" />
                  </div>
                </Link>
              ))}
              </div>
            </div>

            <div className="border-y border-border bg-background-soft/70 py-4">
              <div className="flex items-center gap-4 px-6 py-3">
                <UserRound className="h-7 w-7 text-text-main" />
                {isCustomerAuthed ? (
                  <>
                    <span className="flex-1 text-base font-bold text-text-main">My Account</span>
                    <Link href="/account" onClick={onClose}>
                      <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-secondary">Open</Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-base font-bold text-text-main">Login / Register</span>
                    <Link href="/account" onClick={onClose}>
                      <Button size="sm" className="bg-brand-primary text-white hover:bg-brand-secondary">Sign In</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="border-b border-border bg-white">
              <button
                type="button"
                onClick={() => setCategoriesOpen((value) => !value)}
                className="flex w-full items-center gap-4 px-6 py-5 text-left text-base font-bold text-text-main transition-colors hover:bg-background-soft/70"
                aria-expanded={categoriesOpen}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Grid2X2 className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block leading-tight">Categories</span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-text-soft">
                    Browse curated home collections
                  </span>
                </span>
                <ChevronDown className={`h-5 w-5 text-text-soft transition-transform ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>

              {categoriesOpen ? (
                <div className="grid gap-2 px-4 pb-4">
                  {processedMenuCategories.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/${category.slug}`}
                      onClick={onClose}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-background-elevated p-2.5 shadow-tiny transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5"
                    >
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-border/70"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-text-main">{category.name}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-text-soft" />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border-b border-border bg-white">
              <button
                type="button"
                onClick={() => setCollectionsOpen((value) => !value)}
                className="flex w-full items-center gap-4 px-6 py-5 text-left text-base font-bold text-text-main transition-colors hover:bg-background-soft/70"
                aria-expanded={collectionsOpen}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Layers className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block leading-tight">Collections</span>
                  <span className="mt-0.5 block text-[11px] font-semibold text-text-soft">
                    Shop curated product stories
                  </span>
                </span>
                <ChevronDown className={`h-5 w-5 text-text-soft transition-transform ${collectionsOpen ? "rotate-180" : ""}`} />
              </button>

              {collectionsOpen ? (
                <div className="grid gap-2 px-4 pb-4">
                  {menuCollections.map((collection) => (
                    <Link
                      key={collection.slug}
                      href={`/collections/${collection.slug}`}
                      onClick={onClose}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-background-elevated p-2.5 shadow-tiny transition-colors hover:border-brand-primary/30 hover:bg-brand-primary/5"
                    >
                      <img
                        src={collection.image}
                        alt={collection.title}
                        className="h-12 w-12 shrink-0 rounded-lg object-cover ring-1 ring-border/70"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-text-main">{collection.title}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-text-soft" />
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="grid bg-background-elevated">
              <Link href="/search" onClick={onClose} className="flex items-center gap-4 border-b border-border px-6 py-5 text-base font-bold text-text-main">
                <Sparkles className="h-6 w-6" />
                <span className="flex-1">Quirky Vibe - Find The Look</span>
                <span className="rounded-lg bg-brand-primary/10 px-4 py-1 text-sm font-bold text-brand-primary">NEW</span>
                <ChevronRight className="h-6 w-6" />
              </Link>
              <Link href="/account" onClick={onClose} className="flex items-center gap-4 px-6 py-5 text-base font-bold text-text-main">
                <Truck className="h-6 w-6" />
                <span className="flex-1">Track Your Order</span>
                <ChevronRight className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

