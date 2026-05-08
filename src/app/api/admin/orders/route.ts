import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT id, order_number, status, payment_status, grand_total, placed_at, created_at 
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Admin orders error:", error);
    return Response.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}
