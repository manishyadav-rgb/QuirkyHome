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
  return <RenderSections sections={homePage.sections || []} theme={theme} />;
}
