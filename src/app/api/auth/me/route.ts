import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type UserRow = {
  id: string;
  phone_e164: string;
  full_name: string | null;
  email: string | null;
};

export async function GET() {
  try {
    const payload = await getAuthFromCookies();
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const userResult = await query<UserRow>(
      "select id, phone_e164, full_name, email from users where id = $1 limit 1",
      [payload.sub]
    );

    const user = userResult.rows[0];
    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        phone: user.phone_e164,
        name: user.full_name,
        email: user.email,
        role: payload.role,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Database query failed" }, { status: 500 });
  }
}
