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

export async function POST(request: Request) {
  try {
    const payload = await getAuthFromCookies();
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = String(body.name ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }

    const result = await query<UserRow>(
      "update users set full_name = $1, updated_at = now() where id = $2 returning id, phone_e164, full_name, email",
      [name, payload.sub]
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
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update name." }, { status: 500 });
  }
}
