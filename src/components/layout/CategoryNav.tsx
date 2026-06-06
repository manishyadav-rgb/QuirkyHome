"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { categories as fallbackCategories, type Category } from "@/data/categories";

function displayCategoryName(category: Category) {
  const raw = (category.name || category.slug || "")
    .replace(/[▼▽▾▿▲▲▼↓]/g, "")
    .replace(/[-_]+/g, " ")
    .trim();
  return raw.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    let active = true;
    setPathname(window.location.pathname);
    fetch("/api/categories", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.categories) && data.categories.length > 0) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const processedCategories = useMemo(() => {
    const list: Category[] = [];
    categories.forEach((cat) => {
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
  }, [categories]);

  return (
    <nav className="hide-scrollbar hidden overflow-x-auto border-t border-border bg-background-elevated lg:block lg:overflow-visible" aria-label="Product categories">
      <div className="qh-container lg:overflow-visible">
        <div className="hide-scrollbar flex w-full items-center justify-center gap-6 overflow-x-auto py-2 text-sm font-medium text-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:overflow-visible">
        {processedCategories.map((category) => {
          const name = displayCategoryName(category);
          const slug = category.slug?.toLowerCase();
          const lowerName = name.toLowerCase();
          const isBedding = lowerName === "bedding" || category.slug === "bedding";
          const isFurnishing = lowerName === "furnishing" || category.slug === "furnishing";
          const isBath = lowerName === "bath" || category.slug === "bath";
          const isGifts = name.toLowerCase() === "gifts" || category.slug === "gifts";
          const isBathGifts = name.toLowerCase() === "bath gifts" || category.slug === "bath-gifts";

          const isActive = pathname === `/${category.slug}` || pathname.startsWith(`/${category.slug}/`);

          if (isBedding) {
            return (
              <div key={category.slug} className="group relative lg:overflow-visible">
                <Link href={`/${category.slug}`} className={cn("whitespace-nowrap transition-colors duration-fast py-1 flex items-center gap-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-primary after:transition-transform after:duration-200 after:origin-left", isActive ? "text-brand-primary after:scale-x-100" : "text-black hover:text-brand-primary after:scale-x-0 hover:after:scale-x-100")}>
                  {name}
                </Link>
                {/* Mega Hover Dropdown for Bedding */}
                <div className="absolute left-0 top-full z-[200] mt-0 w-[600px] invisible opacity-0 translate-y-2 transition-all duration-240 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                  <div className="mt-2 rounded-2xl border border-border bg-white p-6 shadow-xl text-left">
                    <div className="grid grid-cols-3 gap-6">
                      
                      {/* Section 1: Bedsheets */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Bedsheets
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Double%20Bedsheet" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Double Bedsheets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=King%20Bedsheet" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> King Size Bedsheets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Fitted%20Bedsheet" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Fitted Bedsheets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Cotton%20Bedsheet" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Cotton Bedsheets
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Section 2: Quilts & Dohars */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Quilts & Dohars
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Dohar" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Cotton Dohars
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Quilt" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> AC Quilts
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Quilted" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Quilted Bedsheets
                            </Link>
                          </li>
                          <li>
                            <Link href="/comforters" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Cozy Comforters
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Section 3: Covers & Accessories */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Pillows & Covers
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Pillow%20Cover" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Pillow Covers
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Cushion%20Cover" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Cushion Covers
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Protector" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Mattress Protectors
                            </Link>
                          </li>
                        </ul>

                        {/* Banner image or promo card */}
                        <div className="mt-4 rounded-xl overflow-hidden relative group/banner border border-border h-16 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 flex items-center justify-between p-3">
                          <div className="z-10">
                            <span className="text-[9px] font-bold text-brand-primary uppercase">Explore Bedding</span>
                            <p className="text-[10px] font-extrabold text-text-main">300+ TC Cotton</p>
                          </div>
                          <span className="text-lg">🛏️</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (isFurnishing) {
            return (
              <div key={category.slug} className="group relative lg:overflow-visible">
                <Link href={`/${category.slug}`} className={cn("whitespace-nowrap transition-colors duration-fast py-1 flex items-center gap-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-primary after:transition-transform after:duration-200 after:origin-left", isActive ? "text-brand-primary after:scale-x-100" : "text-black hover:text-brand-primary after:scale-x-0 hover:after:scale-x-100")}>
                  {name}
                </Link>
                {/* Mega Hover Dropdown for Furnishing */}
                <div className="absolute left-1/2 top-full z-[200] mt-0 w-[540px] -translate-x-1/2 invisible opacity-0 translate-y-2 transition-all duration-240 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                  <div className="mt-2 rounded-2xl border border-border bg-white p-6 shadow-xl text-left">
                    <div className="grid grid-cols-3 gap-6">
                      
                      {/* Section 1: Cushions */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Cushions
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Cushion%20Cover" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> All Cushion Covers
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Cushion%20Cover%20Set" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Cushion Cover Sets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Cushion%20Filler" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Cushion Fillers
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Section 2: Curtains & Drapery */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Curtains & Rods
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Curtain" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Curtains
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Curtain%20Rod" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Curtain Rods
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Section 3: Decor Furnishing */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          More Furnishings
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Floor%20Cushion" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Floor Cushions
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Throw" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Throws
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Diwan%20Set" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Diwan Sets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Sofa%20Cover" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Sofa & Chair Covers
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Chair%20Pad" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Chair Pads
                            </Link>
                          </li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (isBath) {
            return (
              <div key={category.slug} className="group relative lg:overflow-visible">
                <Link href={`/${category.slug}`} className={cn("whitespace-nowrap transition-colors duration-fast py-1 flex items-center gap-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-primary after:transition-transform after:duration-200 after:origin-left", isActive ? "text-brand-primary after:scale-x-100" : "text-black hover:text-brand-primary after:scale-x-0 hover:after:scale-x-100")}>
                  {name}
                </Link>
                {/* Mega Hover Dropdown for Bath */}
                <div className="absolute left-1/2 top-full z-[200] mt-0 w-[500px] -translate-x-1/2 invisible opacity-0 translate-y-2 transition-all duration-240 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                  <div className="mt-2 rounded-2xl border border-border bg-white p-6 shadow-xl text-left">
                    <div className="grid grid-cols-2 gap-6">
                      
                      {/* Section 1: Bath Linens */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Bath Linens
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Towel" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> All Towels
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Bath%20Towel" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Bath Towels
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Hand%20Towel" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Hand & Face Towels
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Towel%20Set" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Towel Sets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Wrap" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Hair & Bath Wraps
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Bath%20Mat" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Bath Mats
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Section 2: Bathroom Accessories */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Bathroom Accessories
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Soap%20Dispenser" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Soap Dish & Dispensers
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Bathroom%20Set" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Bathroom Sets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Bathroom%20Tray" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Bathroom Trays
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Towel%20Hanger" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Towel Hanger
                            </Link>
                          </li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (isGifts) {
            return (
              <div key={category.slug} className="group relative lg:overflow-visible">
                <Link href={`/${category.slug}`} className={cn("whitespace-nowrap transition-colors duration-fast py-1 flex items-center gap-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-primary after:transition-transform after:duration-200 after:origin-left", isActive ? "text-brand-primary after:scale-x-100" : "text-black hover:text-brand-primary after:scale-x-0 hover:after:scale-x-100")}>
                  {name}
                </Link>
                {/* Mega Hover Dropdown for Gifts */}
                <div className="absolute left-1/2 top-full z-[200] mt-0 w-[640px] -translate-x-1/2 invisible opacity-0 translate-y-2 transition-all duration-240 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                  <div className="mt-2 rounded-2xl border border-border bg-white p-6 shadow-xl text-left">
                    <div className="grid grid-cols-3 gap-6">
                      
                      {/* Section 1: Gifts by Occasion & Special Days */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Occasions & Special Days
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Friendship%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Friendship Day Gifts
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=New%20Year%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> New Year Gifts
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Birthday%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Birthday Gifts
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Wedding%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Wedding & Anniversary
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Valentine%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> {"Valentine's Day Gifts"}
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=House%20Warming%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> House Warming Gifts
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Return%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Return & Baby Shower
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Section 2: Gifts for Recipients */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Recipient Specials
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Gift%20Women" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Gifts for Women
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift%20Men" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Gifts for Men
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift%20Couple" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Gifts for Couples
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift%20Best%20Friend" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Friends & Best Friends
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Diwali%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Diwali & Rakhi Gifts
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Christmas%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Christmas Gifts
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Section 3: Gifts by Budget */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Gifts by Budget
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> {"Gifts < ₹499"}
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> {"Gifts < ₹999"}
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> {"Gift < ₹1499"}
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> {"Gifts < ₹1999"}
                            </Link>
                          </li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            );
          }

          if (isBathGifts) {
            return (
              <div key={category.slug} className="group relative lg:overflow-visible">
                <Link href={`/${category.slug}`} className={cn("whitespace-nowrap transition-colors duration-fast py-1 flex items-center gap-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-primary after:transition-transform after:duration-200 after:origin-left", isActive ? "text-brand-primary after:scale-x-100" : "text-black hover:text-brand-primary after:scale-x-0 hover:after:scale-x-100")}>
                  {name}
                </Link>
                {/* Mega Hover Dropdown for combined Bath & Gifts */}
                <div className="absolute left-1/2 top-full z-[200] mt-0 w-[780px] -translate-x-1/2 invisible opacity-0 translate-y-2 transition-all duration-240 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0">
                  <div className="mt-2 rounded-2xl border border-border bg-white p-6 shadow-xl text-left">
                    <div className="grid grid-cols-4 gap-6">
                      
                      {/* Column 1: Bath Linens */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Bath Linens
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Towel" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> All Towels
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Bath%20Towel" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Bath Towels
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Hand%20Towel" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Hand & Face Towels
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Towel%20Set" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Towel Sets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Wrap" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Hair & Bath Wraps
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Bath%20Mat" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Bath Mats
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Column 2: Bathroom Accessories */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Bathroom Decor
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Soap%20Dispenser" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Soap & Dispensers
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Bathroom%20Set" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Bathroom Sets
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Bathroom%20Tray" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Bathroom Trays
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Towel%20Hanger" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Towel Hanger
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Column 3: Gifts & Occasions */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Gift Occasions
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Birthday%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Birthday Gifts
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Wedding%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Wedding & Anniversary
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Valentine%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> {"Valentine's Gifts"}
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=House%20Warming%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> House Warming
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Return%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Return & Baby Shower
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Diwali%20Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Festivals & Rakhi
                            </Link>
                          </li>
                        </ul>
                      </div>

                      {/* Column 4: Recipients & Budget */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary border-b border-border pb-1">
                          Recipients & Budget
                        </h4>
                        <ul className="space-y-2 text-xs font-semibold text-text-muted">
                          <li>
                            <Link href="/search?q=Gift%20Women" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Gifts for Women
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift%20Men" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Gifts for Men
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift%20Couple" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> Gifts for Couples
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> {"Gifts < ₹499"}
                            </Link>
                          </li>
                          <li>
                            <Link href="/search?q=Gift" className="hover:text-brand-primary transition-all flex items-center gap-1.5 hover:translate-x-1 duration-150 transform">
                              <span>•</span> {"Gifts < ₹999"}
                            </Link>
                          </li>
                        </ul>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Link key={category.slug} href={`/${category.slug}`} className={cn("whitespace-nowrap transition-colors duration-fast py-1 relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-full after:bg-brand-primary after:transition-transform after:duration-200 after:origin-left", isActive ? "text-brand-primary after:scale-x-100" : "text-black hover:text-brand-primary after:scale-x-0 hover:after:scale-x-100")}>
              {name}
            </Link>
          );
        })}
        </div>
      </div>
    </nav>
  );
}

