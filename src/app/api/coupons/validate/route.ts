import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { validateCouponForCheckout } from "@/lib/coupons";

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthFromCookies();
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0);
    const siteId = String(body.site_id || "quirkyhome");

    if (!code) return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    if (!Number.isFinite(subtotal) || subtotal <= 0) return NextResponse.json({ error: "Invalid subtotal" }, { status: 400 });

    const validation = await validateCouponForCheckout({ code, subtotal, userId: auth?.sub, siteId });
    if (!validation.ok) return NextResponse.json({ valid: false, error: validation.error }, { status: 200 });

    const { coupon, discountAmount } = validation;
    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      discountAmount,
      source: coupon.source,
      singleUse: coupon.is_single_use,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to validate coupon." }, { status: 500 });
  }
}
