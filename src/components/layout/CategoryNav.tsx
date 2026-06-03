"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories as fallbackCategories, type Category } from "@/data/categories";

function displayCategoryName(category: Category) {
  const raw = (category.name || category.slug || "").replace(/[-_]+/g, " ").trim();
  return raw.replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

export function CategoryNav() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);

  useEffect(() => {
    let active = true;
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

  return (
    <nav className="hide-scrollbar hidden overflow-x-auto border-t border-border bg-background-elevated lg:block" aria-label="Product categories">
      <div className="qh-container">
        <div className="hide-scrollbar flex w-full items-center justify-center gap-6 overflow-x-auto py-2 text-sm font-semibold text-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <Link key={category.slug} href={`/${category.slug}`} className="whitespace-nowrap text-black transition-colors duration-fast hover:text-brand-primary">
            {displayCategoryName(category)}
          </Link>
        ))}
        </div>
      </div>
    </nav>
  );
}

