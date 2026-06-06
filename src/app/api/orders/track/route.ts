import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNumber = searchParams.get("orderNumber");

  if (!orderNumber || !orderNumber.trim()) {
    return NextResponse.json({ error: "Order number is required" }, { status: 400 });
  }

  try {
    const orders = await query<OrderRow>(
      `select id, order_number, status, payment_status, subtotal::text, shipping_total::text, grand_total::text,
              shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode,
              placed_at, created_at
       from customer_orders
       where order_number = $1
       limit 1`,
      [orderNumber.trim().toUpperCase()],
    );

    if (orders.rows.length === 0) {
      return NextResponse.json({ error: "Order not found. Please verify the order number." }, { status: 404 });
    }

    const order = orders.rows[0];

    // Load order items
    const items = await query(
      `select product_slug, product_title, product_image, unit_price::text, quantity, line_total::text
       from customer_order_items where order_id = $1`,
      [order.id],
    );

    return NextResponse.json({
      order: {
        ...order,
        items: items.rows
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
