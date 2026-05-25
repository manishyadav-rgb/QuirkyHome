import { notFound } from "next/navigation";
import { getBuilderSchema } from "@/lib/builder/fetch-schema";
import { getCatalogProducts } from "@/lib/catalog";
import { ProductGrid } from "@/components/product/ProductGrid";

export default async function AllProductPage({
  params,
}: {
  params: Promise<{ sectionId: string }>;
}) {
  const { sectionId } = await params;
  const schema = await getBuilderSchema("quirkyhome");
  if (!schema) notFound();

  const section = Object.values(schema.pages || {})
    .flatMap((p) => p.sections || [])
    .find((s) => s.id === sectionId && s.type === "ProductGrid2");

  if (!section) notFound();

  const settings = section.settings || {};
  const source = settings.productSource || "manual";
  const selectedIds: string[] = settings.productIds || [];

  const allProducts = await getCatalogProducts();
  let products = allProducts;
  if (source === "manual" && selectedIds.length > 0) {
    products = allProducts.filter((p) => selectedIds.includes(p.id || "") || selectedIds.includes(p.slug));
  } else if (source === "latest") {
    products = allProducts.slice(0, 30);
  }

  return (
    <section className="qh-container py-5 md:py-8">
      <h1 className="font-display text-lg font-black text-text-main sm:text-xl md:text-2xl">
        All Products
      </h1>
      {settings.subheading && (
        <p className="mt-1.5 max-w-3xl text-xs text-text-muted sm:text-sm md:text-base">{settings.subheading}</p>
      )}
      <div className="mt-4 md:mt-6">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
