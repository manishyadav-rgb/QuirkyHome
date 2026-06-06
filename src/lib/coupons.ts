import { query } from "@/lib/db";

export type CouponRow = {
  id: string;
  code: string;
  discount_type: "percent" | "flat";
  discount_value: string;
  min_order_amount: string | null;
  max_discount_amount: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  user_id: string | null;
  source: string;
  is_single_use: boolean;
  used_at: string | null;
};

export type CouponValidationResult =
  | {
      ok: true;
      coupon: CouponRow;
      discountAmount: number;
    }
  | {
      ok: false;
      error: string;
    };

export async function ensureCouponsTable() {
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
  await query("alter table discount_coupons add column if not exists user_id uuid references users(id) on delete cascade");
  await query("alter table discount_coupons add column if not exists source varchar(40) not null default 'manual'");
  await query("alter table discount_coupons add column if not exists is_single_use boolean not null default false");
  await query("alter table discount_coupons add column if not exists used_at timestamptz");
  await query("alter table discount_coupons add column if not exists used_order_id uuid references customer_orders(id) on delete set null");
  await query("create index if not exists idx_discount_coupons_user_source on discount_coupons(user_id, source)");
  await query("create index if not exists idx_discount_coupons_single_use on discount_coupons(site_id, code, is_single_use, used_at)");
}

export function computeDiscount(subtotal: number, coupon: Pick<CouponRow, "discount_type" | "discount_value" | "max_discount_amount">) {
  const value = Number(coupon.discount_value || 0);
  if (coupon.discount_type === "percent") {
    const raw = subtotal * (value / 100);
    const max = coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null;
    return max != null ? Math.min(raw, max) : raw;
  }
  return Math.min(value, subtotal);
}

export async function validateCouponForCheckout({
  code,
  subtotal,
  userId,
  siteId = "quirkyhome",
}: {
  code: string;
  subtotal: number;
  userId?: string | null;
  siteId?: string;
}): Promise<CouponValidationResult> {
  await ensureCouponsTable();

  const candidate = String(code || "").trim().toUpperCase();
  if (!candidate) return { ok: false, error: "Coupon code is required." };
  if (!Number.isFinite(subtotal) || subtotal <= 0) return { ok: false, error: "Invalid subtotal." };

  const result = await query<CouponRow>(
    `select id, code, discount_type, discount_value::text, min_order_amount::text, max_discount_amount::text,
            starts_at::text, ends_at::text, is_active, user_id::text, source, is_single_use, used_at::text
     from discount_coupons
     where site_id = $1 and code = $2
     limit 1`,
    [siteId, candidate],
  );
  const coupon = result.rows[0];
  if (!coupon || !coupon.is_active) return { ok: false, error: "Invalid coupon code." };

  if (coupon.user_id && coupon.user_id !== userId) {
    return { ok: false, error: "This reward coupon belongs to another account." };
  }

  if (coupon.is_single_use && coupon.used_at) {
    return { ok: false, error: "This coupon has already been used." };
  }

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { ok: false, error: "This coupon is not active yet." };
  }
  if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now) {
    return { ok: false, error: "This coupon has expired." };
  }

  const minOrder = coupon.min_order_amount ? Number(coupon.min_order_amount) : 0;
  if (subtotal < minOrder) {
    return { ok: false, error: `Minimum order amount is INR ${minOrder}.` };
  }

  return {
    ok: true,
    coupon,
    discountAmount: Number(computeDiscount(subtotal, coupon).toFixed(2)),
  };
}

export async function markSingleUseCouponUsed(code: string | null | undefined, orderId: string) {
  if (!code) return;
  await ensureCouponsTable();
  await query(
    `update discount_coupons
     set used_at = now(), used_order_id = $1, is_active = false, updated_at = now()
     where site_id = 'quirkyhome'
       and code = $2
       and is_single_use = true
       and used_at is null`,
    [orderId, String(code).trim().toUpperCase()],
  );
}
