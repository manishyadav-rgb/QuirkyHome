import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { syncRecommendationsIndex } from "@/lib/recommendations";

export const runtime = "nodejs";

export async function POST() {
  const auth = await getAuthFromCookies();
  if (!auth || (auth.role !== "admin" && auth.role !== "team")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncRecommendationsIndex();
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.reason || "Sync failed" }, { status: 400 });
    }
    return NextResponse.json({ ok: true, indexed: result.indexed });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message || "Sync failed" }, { status: 500 });
  }
}
