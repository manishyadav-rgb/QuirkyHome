import { NextResponse } from "next/server";
import { getStoreCategories } from "@/lib/categories";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("site_id") || "quirkyhome";
  const categories = await getStoreCategories(siteId);

  return NextResponse.json({ categories });
}
