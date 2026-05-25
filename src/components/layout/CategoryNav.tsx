import Link from "next/link";
import { categories } from "@/data/categories";

export function CategoryNav() {
  return (
    <nav className="hide-scrollbar hidden overflow-x-auto border-t border-border bg-background-elevated lg:block" aria-label="Product categories">
      <div className="qh-container flex items-center justify-center gap-5 py-2 text-sm font-semibold text-black">
        {categories.slice(0, 8).map((category) => (
          <Link key={category.slug} href={`/${category.slug}`} className="whitespace-nowrap text-black transition-colors duration-fast hover:text-[#8a6636]">
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  );
}

