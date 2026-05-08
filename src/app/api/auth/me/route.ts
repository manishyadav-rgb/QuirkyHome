import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const payload = await getAuthFromCookies();
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: payload.sub,
      role: payload.role,
      phone: payload.phone,
      email: payload.email,
    },
  });
}
