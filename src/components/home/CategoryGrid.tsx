import { categories } from "@/data/categories";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { CategoryCard } from "./CategoryCard";

interface CategoryGridProps {
  settings?: Record<string, any>;
}

export function CategoryGrid({ settings }: CategoryGridProps) {
  const eyebrow = settings?.eyebrow || "Shop by category";
  const heading = settings?.heading || "Home decor, furnishing and essentials";
  const description = settings?.subheading || "Find bedding, wall decor, lighting, kitchen, dining, bath, garden, gifts, storage and showpieces in one place.";
  const requestedCount = Number(settings?.categoryCount ?? 5);
  const categoryCount = Number.isFinite(requestedCount) ? Math.min(Math.max(requestedCount, 1), 12) : 5;
  const categoryItems = Array.from({ length: categoryCount }, (_, idx) => {
    const baseCategory = categories[idx] ?? {
      name: `Category ${idx + 1}`,
      slug: `category-${idx + 1}`,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
      description: "Add your custom category details from builder.",
    };
    const customImage = settings?.[`cat${idx + 1}Image`];
    const customText = settings?.[`cat${idx + 1}Text`];
    const customLink = settings?.[`cat${idx + 1}Link`];
    return {
      ...baseCategory,
      name: customText || baseCategory.name,
      image: customImage || baseCategory.image,
      href: customLink || `/${baseCategory.slug}`,
    };
  });

  return (
    <section className="qh-container py-8 md:py-12">
      <SectionHeader eyebrow={eyebrow} title={heading} description={description} />
      <div className="grid grid-cols-3 gap-x-3 gap-y-7 md:grid-cols-5 lg:gap-8">
        {categoryItems.map((category, idx) => <CategoryCard key={`${category.slug}-${idx}`} category={category} />)}
      </div>
    </section>
  );
}
