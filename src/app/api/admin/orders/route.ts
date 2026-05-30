import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT id, order_number, status, payment_status, total_mrp, product_discount, coupon_code, discount_amount, subtotal, shipping_total, grand_total,
              shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode,
              notes, placed_at, created_at
       FROM customer_orders
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Admin orders error:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const id = String(body?.id || "").trim();
    const action = String(body?.action || "").trim().toLowerCase();

    if (!id) {
      return Response.json({ error: "Order id is required" }, { status: 400 });
    }

    const allowedActions = new Set(["accept", "cancel", "ship", "deliver"]);
    if (!allowedActions.has(action)) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    const nextStatusByAction: Record<string, string> = {
      accept: "accepted",
      cancel: "cancelled",
      ship: "shipped",
      deliver: "delivered",
    };
    const nextStatus = nextStatusByAction[action];

    const result = await query(
      `update customer_orders
       set status = $1,
           placed_at = coalesce(placed_at, now())
       where id = $2
       returning id, status`,
      [nextStatus, id],
    );

    if (!result.rows[0]) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    return Response.json({ ok: true, id: result.rows[0].id, status: result.rows[0].status });
  } catch (error) {
    console.error("Admin orders PATCH error:", error);
    return Response.json({ error: "Failed to update order status" }, { status: 500 });
  }
}
