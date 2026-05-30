import type { Metadata } from "next";
import { getBuilderSchema } from "@/lib/builder/fetch-schema";
import { RenderSections } from "@/components/storefront/SectionRenderer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy Home Decor Items & Essentials Online",
  description: "Buy home decor items online at QuirkyHome. Shop bedding, wall decor, lighting, kitchen, dining, bath, garden, gifts and storage essentials.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const builderSchema = await getBuilderSchema("quirkyhome");
  const homePage = builderSchema?.pages?.home;
  const theme = builderSchema?.themeSettings;

  if (!homePage || !theme) return null;

  const sections = homePage.sections || [];
  const hasProductSection = sections.some((section) =>
    section.visible && (section.type === "ProductGrid" || section.type === "ProductGrid2")
  );

  const safeSections = hasProductSection
    ? sections
    : [
        ...sections,
        {
          id: "auto-fallback-product-grid",
          type: "ProductGrid",
          visible: true,
          settings: {
            eyebrow: "Featured",
            heading: "Our Products",
            subheading: "Shop latest home decor picks.",
            productSource: "latest",
            columns: "4",
            mobileColumns: "2",
            rows: "2",
            gap: "20",
          },
        },
      ];

  return <RenderSections sections={safeSections as any} theme={theme} />;
}
