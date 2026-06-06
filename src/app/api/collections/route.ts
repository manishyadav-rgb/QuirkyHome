import { NextResponse } from "next/server";
import { getStoreCollections } from "@/lib/collections";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("site_id") || "quirkyhome";
  const collections = await getStoreCollections(siteId);

  return NextResponse.json({ collections });
}
