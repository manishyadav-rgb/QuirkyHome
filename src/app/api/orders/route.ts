import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { markSingleUseCouponUsed, validateCouponForCheckout } from "@/lib/coupons";

export const runtime = "nodejs";

type CartItemRow = {
  product_slug: string;
  product_title: string;
  product_image: string | null;
  unit_price: string;
  mrp: string | null;
  quantity: number;
};

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_mrp: string | null;
  product_discount: string | null;
  coupon_code: string | null;
  discount_amount: string | null;
  subtotal: string;
  shipping_total: string;
  grand_total: string;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  placed_at: string;
  created_at: string;
};

function generateOrderNumber() {
  const date = new Date();
  const prefix = `QH${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}

async function ensureUserProfileColumns() {
  await query("alter table users add column if not exists shipping_address text");
  await query("alter table users add column if not exists shipping_city varchar(100)");
  await query("alter table users add column if not exists shipping_state varchar(100)");
  await query("alter table users add column if not exists shipping_pincode varchar(10)");
}

async function ensureOrderPricingColumns() {
  await query("alter table customer_orders add column if not exists total_mrp numeric(12,2)");
  await query("alter table customer_orders add column if not exists product_discount numeric(12,2)");
  await query("alter table customer_orders add column if not exists coupon_code varchar(60)");
  await query("alter table customer_orders add column if not exists discount_amount numeric(12,2)");
}

export async function GET() {
  const auth = await getAuthFromCookies();
  if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  await ensureOrderPricingColumns();

  const orders = await query<OrderRow>(
    `select id, order_number, status, payment_status, total_mrp::text, product_discount::text, coupon_code, discount_amount::text,
            subtotal::text, shipping_total::text, grand_total::text,
            shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode,
            placed_at, created_at
     from customer_orders
     where user_id = $1
     order by created_at desc
     limit 50`,
    [auth.sub],
  );

  const result = [];
  for (const order of orders.rows) {
    const items = await query(
      `select product_slug, product_title, product_image, unit_price::text, quantity, line_total::text
       from customer_order_items where order_id = $1`,
      [order.id],
    );
    result.push({ ...order, items: items.rows });
  }

  return NextResponse.json({ orders: result });
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { name, email, phone, address, city, state, pincode, notes, couponCode } = body;

    if (!name || !phone || !address || !city || !state || !pincode) {
      return NextResponse.json({ error: "Complete shipping address is required." }, { status: 400 });
    }

    await ensureUserProfileColumns();
    await ensureOrderPricingColumns();

    await query(
      `update users
       set full_name = coalesce(nullif($1, ''), full_name),
           email = coalesce(nullif($2, ''), email),
           shipping_address = coalesce(nullif($3, ''), shipping_address),
           shipping_city = coalesce(nullif($4, ''), shipping_city),
           shipping_state = coalesce(nullif($5, ''), shipping_state),
           shipping_pincode = coalesce(nullif($6, ''), shipping_pincode),
           updated_at = now()
       where id = $7`,
      [String(name || "").trim(), String(email || "").trim(), String(address || "").trim(), String(city || "").trim(), String(state || "").trim(), String(pincode || "").trim(), auth.sub],
    );

    const cartResult = await query<{ id: string }>(
      "select id from customer_carts where user_id = $1 limit 1",
      [auth.sub],
    );

    if (!cartResult.rows[0]) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const cartItems = await query<CartItemRow>(
      `select product_slug, product_title, product_image, unit_price::text, mrp::text, quantity
       from customer_cart_items where cart_id = $1`,
      [cartResult.rows[0].id],
    );

    if (cartItems.rows.length === 0) {
      return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
    }

    const subtotal = cartItems.rows.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0);
    const totalMrp = cartItems.rows.reduce((sum, item) => {
      const unitPrice = Number(item.unit_price || 0);
      const mrp = Number(item.mrp || 0);
      return sum + Math.max(unitPrice, mrp || unitPrice) * item.quantity;
    }, 0);
    const productDiscount = Math.max(0, totalMrp - subtotal);
    const shippingTotal = subtotal >= 499 ? 0 : 49;

    let discountAmount = 0;
    let normalizedCouponCode: string | null = null;
    if (couponCode) {
      const validation = await validateCouponForCheckout({ code: couponCode, subtotal, userId: auth.sub });
      if (!validation.ok) return NextResponse.json({ error: validation.error }, { status: 400 });
      discountAmount = validation.discountAmount;
      normalizedCouponCode = validation.coupon.code;
    }

    const grandTotal = Number(Math.max(0, subtotal + shippingTotal - discountAmount).toFixed(2));
    const orderNumber = generateOrderNumber();

    const orderResult = await query<{ id: string }>(
    `insert into customer_orders (order_number, user_id, total_mrp, product_discount, coupon_code, discount_amount, subtotal, shipping_total, grand_total,
     shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, notes)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     returning id`,
    [orderNumber, auth.sub, totalMrp, productDiscount, normalizedCouponCode, discountAmount, subtotal, shippingTotal, grandTotal, name, phone, address, city, state, pincode, notes || null],
  );

    const orderId = orderResult.rows[0].id;
    await markSingleUseCouponUsed(normalizedCouponCode, orderId);

    for (const item of cartItems.rows) {
      const lineTotal = parseFloat(item.unit_price) * item.quantity;
      await query(
        `insert into customer_order_items (order_id, product_slug, product_title, product_image, unit_price, quantity, line_total)
         values ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, item.product_slug, item.product_title, item.product_image, item.unit_price, item.quantity, lineTotal],
      );
    }

    await query("delete from customer_cart_items where cart_id = $1", [cartResult.rows[0].id]);

    return NextResponse.json({
      ok: true,
      order: {
        id: orderId,
        orderNumber,
        grandTotal,
        status: "pending",
        couponCode: normalizedCouponCode,
        discountAmount,
        totalMrp,
        productDiscount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to place test order." }, { status: 500 });
  }
}
