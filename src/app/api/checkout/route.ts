import { NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

type CartItemRow = {
  product_slug: string;
  product_title: string;
  product_image: string | null;
  unit_price: string;
  quantity: number;
};

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

function makeCashfreeOrderId() {
  return `CF_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
}

async function ensureCheckoutTable() {
  await query(`
    create table if not exists payment_checkout_sessions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null,
      cashfree_order_id varchar(80) not null unique,
      payment_session_id text not null,
      order_amount numeric(12,2) not null,
      currency char(3) not null default 'INR',
      status varchar(20) not null default 'pending',
      shipping_name varchar(120),
      shipping_phone varchar(20),
      shipping_email varchar(180),
      shipping_address text,
      shipping_city varchar(100),
      shipping_state varchar(100),
      shipping_pincode varchar(10),
      notes text,
      cart_snapshot jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      finalized_at timestamptz
    )
  `);
  await query(`alter table payment_checkout_sessions add column if not exists subtotal numeric(12,2)`);
  await query(`alter table payment_checkout_sessions add column if not exists shipping_total numeric(12,2)`);
  await query(`alter table payment_checkout_sessions add column if not exists coupon_code varchar(60)`);
  await query(`alter table payment_checkout_sessions add column if not exists discount_amount numeric(12,2)`);
}

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

function computeDiscount(subtotal: number, coupon: CouponRow) {
  const value = Number(coupon.discount_value || 0);
  if (coupon.discount_type === "percent") {
    const raw = subtotal * (value / 100);
    const max = coupon.max_discount_amount ? Number(coupon.max_discount_amount) : null;
    return max != null ? Math.min(raw, max) : raw;
  }
  return Math.min(value, subtotal);
}

export async function POST(req: Request) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth || auth.role !== "customer") {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { customerName, customerEmail, customerPhone, address, city, state, pincode, notes, couponCode } = body;

    if (!customerName || !customerPhone || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: "Complete shipping details are required." }, { status: 400 });
    }

    const cartResult = await query<{ id: string }>(
      "select id from customer_carts where user_id = $1 limit 1",
      [auth.sub],
    );

    if (!cartResult.rows[0]) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const cartItems = await query<CartItemRow>(
      `select product_slug, product_title, product_image, unit_price::text, quantity
       from customer_cart_items
       where cart_id = $1`,
      [cartResult.rows[0].id],
    );

    if (cartItems.rows.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const subtotal = cartItems.rows.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0);
    const shippingTotal = subtotal >= 499 ? 0 : 49;
    let discountAmount = 0;
    let normalizedCouponCode: string | null = null;

    if (couponCode) {
      await ensureCouponsTable();
      const candidate = String(couponCode).trim().toUpperCase();
      const couponResult = await query<CouponRow>(
        `select code, discount_type, discount_value::text, min_order_amount::text, max_discount_amount::text,
                starts_at::text, ends_at::text, is_active
         from discount_coupons where site_id = 'quirkyhome' and code = $1 limit 1`,
        [candidate],
      );
      const coupon = couponResult.rows[0];
      if (!coupon || !coupon.is_active) {
        return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
      }
      const now = Date.now();
      if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
        return NextResponse.json({ error: "Coupon is not active yet." }, { status: 400 });
      }
      if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now) {
        return NextResponse.json({ error: "Coupon has expired." }, { status: 400 });
      }
      const minOrder = coupon.min_order_amount ? Number(coupon.min_order_amount) : 0;
      if (subtotal < minOrder) {
        return NextResponse.json({ error: `Minimum order amount for this coupon is INR ${minOrder}.` }, { status: 400 });
      }
      discountAmount = Number(computeDiscount(subtotal, coupon).toFixed(2));
      normalizedCouponCode = coupon.code;
    }

    const grandTotal = Number(Math.max(0, subtotal + shippingTotal - discountAmount).toFixed(2));

    const orderId = makeCashfreeOrderId();
    const cashfreeUrl = process.env.CASHFREE_ENVIRONMENT === "SANDBOX"
      ? "https://sandbox.cashfree.com/pg/orders"
      : "https://api.cashfree.com/pg/orders";

    const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || "").trim();
    const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || "").trim();

    if (!appId || !secretKey) {
      return NextResponse.json({ error: "Cashfree credentials missing." }, { status: 500 });
    }

    const payload = {
      order_id: orderId,
      order_amount: grandTotal,
      order_currency: "INR",
      customer_details: {
        customer_id: auth.sub,
        customer_name: customerName,
        customer_email: customerEmail || "guest@quirkyhome.com",
        customer_phone: String(customerPhone).replace(/\D/g, "").slice(-10),
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"}/payment-status?order_id=${orderId}`,
      },
    };

    const response = await fetch(cashfreeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.payment_session_id) {
      return NextResponse.json({ error: data.message || "Failed to create Cashfree order" }, { status: response.status || 500 });
    }

    await ensureCheckoutTable();
    await query(
      `insert into payment_checkout_sessions
       (user_id, cashfree_order_id, payment_session_id, order_amount, currency, status, subtotal, shipping_total, coupon_code, discount_amount,
        shipping_name, shipping_phone, shipping_email, shipping_address, shipping_city, shipping_state, shipping_pincode, notes, cart_snapshot, updated_at)
       values ($1,$2,$3,$4,'INR','pending',$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17::jsonb, now())
       on conflict (cashfree_order_id) do update set
         payment_session_id = excluded.payment_session_id,
         order_amount = excluded.order_amount,
         status = 'pending',
         subtotal = excluded.subtotal,
         shipping_total = excluded.shipping_total,
         coupon_code = excluded.coupon_code,
         discount_amount = excluded.discount_amount,
         shipping_name = excluded.shipping_name,
         shipping_phone = excluded.shipping_phone,
         shipping_email = excluded.shipping_email,
         shipping_address = excluded.shipping_address,
         shipping_city = excluded.shipping_city,
         shipping_state = excluded.shipping_state,
         shipping_pincode = excluded.shipping_pincode,
         notes = excluded.notes,
         cart_snapshot = excluded.cart_snapshot,
         updated_at = now()`,
      [
        auth.sub,
        orderId,
        data.payment_session_id,
        grandTotal,
        subtotal,
        shippingTotal,
        normalizedCouponCode,
        discountAmount,
        customerName,
        customerPhone,
        customerEmail || null,
        address,
        city,
        state,
        pincode,
        notes || null,
        JSON.stringify(cartItems.rows),
      ],
    );

    return NextResponse.json({ payment_session_id: data.payment_session_id, order_id: orderId, amount: grandTotal });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
