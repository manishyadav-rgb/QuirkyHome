import { NextRequest, NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { ensureCouponsTable } from "@/lib/coupons";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await ensureCouponsTable();
    const auth = await getAuthFromCookies();

    const result = await query(`
      select code, discount_type, discount_value::text, min_order_amount::text, max_discount_amount::text, source, is_single_use
      from discount_coupons
      where site_id = 'quirkyhome'
        and is_active = true
        and (user_id is null or user_id = $1)
        and (is_single_use = false or used_at is null)
      order by created_at desc
    `, [auth?.sub || null]);

    return NextResponse.json({
      success: true,
      coupons: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to list coupons." }, { status: 500 });
  }
}
