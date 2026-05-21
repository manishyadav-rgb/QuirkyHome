import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

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

export async function GET(request: NextRequest) {
  try {
    await ensureCouponsTable();
    
    const result = await query(`
      select code, discount_type, discount_value::text, min_order_amount::text, max_discount_amount::text
      from discount_coupons
      where site_id = 'quirkyhome' and is_active = true
      order by created_at desc
    `);

    return NextResponse.json({
      success: true,
      coupons: result.rows,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to list coupons." }, { status: 500 });
  }
}
