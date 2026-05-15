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

  return (
    <section className="qh-container py-8 md:py-12">
      <SectionHeader eyebrow={eyebrow} title={heading} description={description} />
      <div className="grid grid-cols-3 gap-x-3 gap-y-7 md:grid-cols-5 lg:gap-8">
        {categories.map((category, idx) => {
          const customImage = settings?.[`cat${idx + 1}Image`];
          const displayCategory = {
            ...category,
            image: customImage || category.image,
          };
          return <CategoryCard key={displayCategory.slug} category={displayCategory} />;
        })}
      </div>
    </section>
  );
}
