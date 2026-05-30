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

export async function POST(request: Request) {
  try {
    const payload = await getAuthFromCookies();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const shippingAddress = String(body.shippingAddress ?? "").trim();
    const shippingCity = String(body.shippingCity ?? "").trim();
    const shippingState = String(body.shippingState ?? "").trim();
    const shippingPincode = String(body.shippingPincode ?? "").trim();

    if (!name && !email && !shippingAddress && !shippingCity && !shippingState && !shippingPincode) {
      return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
    }

    await ensureUserProfileColumns();

    const result = await query<UserRow>(
      `update users
       set full_name = coalesce(nullif($1, ''), full_name),
           email = coalesce(nullif($2, ''), email),
           shipping_address = coalesce(nullif($3, ''), shipping_address),
           shipping_city = coalesce(nullif($4, ''), shipping_city),
           shipping_state = coalesce(nullif($5, ''), shipping_state),
           shipping_pincode = coalesce(nullif($6, ''), shipping_pincode),
           updated_at = now()
       where id = $7
       returning id, phone_e164, full_name, email, shipping_address, shipping_city, shipping_state, shipping_pincode`,
      [name, email, shippingAddress, shippingCity, shippingState, shippingPincode, payload.sub]
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
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
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update name." }, { status: 500 });
  }
}
