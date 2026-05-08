import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
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

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
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

// GET - List user's orders
export async function GET() {
  const auth = await getAuthFromCookies();
  if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const orders = await query<OrderRow>(
    `select id, order_number, status, payment_status, subtotal::text, shipping_total::text, grand_total::text,
            shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode,
            placed_at, created_at
     from customer_orders
     where user_id = $1
     order by created_at desc
     limit 50`,
    [auth.sub],
  );

  // Get items for each order
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

// POST - Place a new order from cart
export async function POST(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = await request.json();
  const { name, phone, address, city, state, pincode, notes } = body;

  if (!name || !phone || !address || !city || !state || !pincode) {
    return NextResponse.json({ error: "Complete shipping address is required." }, { status: 400 });
  }

  // Get cart items
  const cartResult = await query<{ id: string }>(
    "select id from customer_carts where user_id = $1 limit 1",
    [auth.sub],
  );

  if (!cartResult.rows[0]) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  const cartItems = await query<CartItemRow>(
    `select product_slug, product_title, product_image, unit_price::text, quantity
     from customer_cart_items where cart_id = $1`,
    [cartResult.rows[0].id],
  );

  if (cartItems.rows.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // Calculate totals
  const subtotal = cartItems.rows.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0);
  const shippingTotal = subtotal >= 499 ? 0 : 49; // Free shipping over ₹499
  const grandTotal = subtotal + shippingTotal;
  const orderNumber = generateOrderNumber();

  // Create order
  const orderResult = await query<{ id: string }>(
    `insert into customer_orders (order_number, user_id, subtotal, shipping_total, grand_total, 
     shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, notes)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     returning id`,
    [orderNumber, auth.sub, subtotal, shippingTotal, grandTotal, name, phone, address, city, state, pincode, notes || null],
  );

  const orderId = orderResult.rows[0].id;

  // Insert order items
  for (const item of cartItems.rows) {
    const lineTotal = parseFloat(item.unit_price) * item.quantity;
    await query(
      `insert into customer_order_items (order_id, product_slug, product_title, product_image, unit_price, quantity, line_total)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [orderId, item.product_slug, item.product_title, item.product_image, item.unit_price, item.quantity, lineTotal],
    );
  }

  // Clear cart
  await query("delete from customer_cart_items where cart_id = $1", [cartResult.rows[0].id]);

  return NextResponse.json({
    ok: true,
    order: {
      id: orderId,
      orderNumber,
      grandTotal,
      status: "pending",
    },
  });
}
