import { query } from "@/lib/db";

export async function GET() {
  try {
    const result = await query(
      `SELECT id, phone_e164, full_name, email, is_active, last_login_at, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    return Response.json(result.rows);
  } catch (error) {
    console.error("Admin users error:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
