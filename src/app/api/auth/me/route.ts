import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type UserRow = {
  id: string;
  phone_e164: string;
  full_name: string | null;
  email: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
};

async function ensureUserProfileColumns() {
  await query("alter table users add column if not exists shipping_address text");
  await query("alter table users add column if not exists shipping_city varchar(100)");
  await query("alter table users add column if not exists shipping_state varchar(100)");
  await query("alter table users add column if not exists shipping_pincode varchar(10)");
}

export async function GET() {
  try {
    const payload = await getAuthFromCookies();
    if (!payload) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    await ensureUserProfileColumns();
    const userResult = await query<UserRow>(
      `select id, phone_e164, full_name, email, shipping_address, shipping_city, shipping_state, shipping_pincode
       from users where id = $1 limit 1`,
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
        shippingAddress: user.shipping_address,
        shippingCity: user.shipping_city,
        shippingState: user.shipping_state,
        shippingPincode: user.shipping_pincode,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false, error: "Database query failed" }, { status: 500 });
  }
}
