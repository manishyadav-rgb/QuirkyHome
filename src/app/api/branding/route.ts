import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type SiteRow = {
  name: string;
  logo_text: string | null;
  brand_color: string | null;
};

type StoreRow = {
  name: string | null;
};

export async function GET() {
  try {
    const siteResult = await query<SiteRow>(
      "select name, logo_text, brand_color from sites where id = 'medusa' limit 1"
    );
    const site = siteResult.rows[0];

    if (site) {
      return NextResponse.json({
        brandName: site.name || "Medusa",
        logoText: site.logo_text || "MD",
        brandColor: site.brand_color || "#0EA5E9",
      });
    }

    const storeResult = await query<StoreRow>("select name from store order by created_at asc limit 1");
    const store = storeResult.rows[0];
    const storeName = store?.name?.trim();

    return NextResponse.json({
      brandName: storeName || "Medusa",
      logoText: storeName ? storeName.slice(0, 2).toUpperCase() : "MD",
      brandColor: "#0EA5E9",
    });
  } catch {
    return NextResponse.json({
      brandName: "Medusa",
      logoText: "MD",
      brandColor: "#0EA5E9",
    });
  }
}
