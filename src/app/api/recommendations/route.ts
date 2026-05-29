import { NextRequest, NextResponse } from "next/server";
import { getRecommendedProducts } from "@/lib/recommendations";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = (searchParams.get("slug") || "").trim();
    const limitRaw = Number(searchParams.get("limit") || 8);
    const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 24) : 8;
    if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

    const products = await getRecommendedProducts(slug, limit);
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to get recommendations" }, { status: 500 });
  }
}
