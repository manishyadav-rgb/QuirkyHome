import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

type CouponRow = {
  code: string;
  discount_type: "percent" | "flat";
  discount_value: string;
  min_order_amount: string | null;
  max_discount_amount: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

async function ensureCouponsTable() {
  await query(`
    create table if not exists discount_coupons (
      id uuid primary key default gen_random_uuid(),
      site_id varchar(80) not null default 'quirkyhome',
      code varchar(60) not null,
      discount_type varchar(20) not null check (discount_type in ('percent', 'flat')),
      discount_value numeric(12,2) not null,
      min_order_amount numeric(12,2),
      max_discount_amount numeric(12,2),
      starts_at timestamptz,
      ends_at timestamptz,
      is_active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (site_id, code)
    )
  `);
}

function calculateDiscount(subtotal: number, coupon: CouponRow) {
  const rawValue = Number(coupon.discount_value || 0);
  if (coupon.discount_type === "percent") {
    const computed = subtotal * (rawValue / 100);
    const max = coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null;
    return max != null ? Math.min(computed, max) : computed;
  }
  return Math.min(rawValue, subtotal);
}

export async function POST(request: NextRequest) {
  try {
    await ensureCouponsTable();
    const body = await request.json();
    const code = String(body.code || "").trim().toUpperCase();
    const subtotal = Number(body.subtotal || 0);
    const siteId = String(body.site_id || "quirkyhome");

    if (!code) return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    if (!Number.isFinite(subtotal) || subtotal <= 0) return NextResponse.json({ error: "Invalid subtotal" }, { status: 400 });

    const result = await query<CouponRow>(
      `select code, discount_type, discount_value::text, min_order_amount::text, max_discount_amount::text,
              starts_at::text, ends_at::text, is_active
       from discount_coupons
       where site_id = $1 and code = $2
       limit 1`,
      [siteId, code],
    );
    const coupon = result.rows[0];
    if (!coupon || !coupon.is_active) {
      return NextResponse.json({ valid: false, error: "Invalid coupon code." }, { status: 200 });
    }

    const now = Date.now();
    if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
      return NextResponse.json({ valid: false, error: "This coupon is not active yet." }, { status: 200 });
    }
    if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now) {
      return NextResponse.json({ valid: false, error: "This coupon has expired." }, { status: 200 });
    }

    const minOrder = coupon.min_order_amount ? Number(coupon.min_order_amount) : 0;
    if (subtotal < minOrder) {
      return NextResponse.json({ valid: false, error: `Minimum order amount is INR ${minOrder}.` }, { status: 200 });
    }

    const discountAmount = Number(calculateDiscount(subtotal, coupon).toFixed(2));
    return NextResponse.json({
      valid: true,
      code: coupon.code,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value),
      discountAmount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to validate coupon." }, { status: 500 });
  }
}
