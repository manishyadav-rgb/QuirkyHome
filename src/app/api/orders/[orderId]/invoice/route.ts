import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

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
  created_at: string;
};

type ItemRow = {
  product_title: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const auth = await getAuthFromCookies();
  if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { orderId } = await params;
  const orderResult = await query<OrderRow>(
    `select id, order_number, status, payment_status, subtotal::text, shipping_total::text, grand_total::text,
            shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, created_at
     from customer_orders
     where id = $1 and user_id = $2
     limit 1`,
    [orderId, auth.sub],
  );

  const order = orderResult.rows[0];
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const allowedStatuses = new Set(["accepted", "shipped", "delivered"]);
  if (!allowedStatuses.has((order.status || "").toLowerCase())) {
    return NextResponse.json({ error: "Invoice is available after admin accepts the order." }, { status: 400 });
  }

  const itemsResult = await query<ItemRow>(
    `select product_title, unit_price::text, quantity, line_total::text
     from customer_order_items
     where order_id = $1
     order by created_at asc`,
    [order.id],
  );

  const itemsText = itemsResult.rows
    .map((item, idx) => `${idx + 1}. ${item.product_title} | Qty: ${item.quantity} | Unit: INR ${Number(item.unit_price)} | Line: INR ${Number(item.line_total)}`)
    .join("\n");

  const invoiceText = [
    "QUIRKYHOME INVOICE",
    "------------------------------",
    `Invoice Date: ${new Date(order.created_at).toLocaleString("en-IN")}`,
    `Order Number: ${order.order_number}`,
    `Order Status: ${order.status}`,
    `Payment Status: ${order.payment_status}`,
    "",
    "BILL TO / SHIP TO",
    `Name: ${order.shipping_name || "-"}`,
    `Phone: ${order.shipping_phone || "-"}`,
    `Address: ${order.shipping_address || "-"}`,
    `City/State/Pincode: ${[order.shipping_city, order.shipping_state, order.shipping_pincode].filter(Boolean).join(", ") || "-"}`,
    "",
    "ITEMS",
    itemsText || "No items found",
    "",
    "TOTALS",
    `Subtotal: INR ${Number(order.subtotal || 0)}`,
    `Shipping: INR ${Number(order.shipping_total || 0)}`,
    `Grand Total: INR ${Number(order.grand_total || 0)}`,
    "------------------------------",
    "Thank you for shopping with QuirkyHome.",
  ].join("\n");

  return new NextResponse(invoiceText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="invoice-${order.order_number}.txt"`,
      "Cache-Control": "no-store",
    },
  });
}
