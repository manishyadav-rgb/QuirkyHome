import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { signToken } from "@/lib/auth";

export const runtime = "nodejs";

type TeamRow = {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  is_active: boolean;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const result = await query<TeamRow>(
      `select id, email, password_hash, full_name, role, is_active
       from team_users
       where email = $1
       limit 1`,
      [email],
    );

    const user = result.rows[0];
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: "Account is deactivated. Contact admin." }, { status: 403 });
    }

    // Verify password: format is "salt:hash"
    const [salt, storedHash] = user.password_hash.split(":");
    if (!salt || !storedHash) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const computedHash = createHash("sha256").update(`${salt}:${password}`).digest("hex");
    // Also check the simpler format used by the SQL migration
    const simpleMigrationHash = createHash("sha256")
      .update(Buffer.from(`${salt}:${password}`, "utf8"))
      .digest("hex");

    if (storedHash !== computedHash && storedHash !== simpleMigrationHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    // Update last login
    await query("update team_users set last_login_at = now() where id = $1", [user.id]);

    // Sign JWT
    const token = signToken({
      sub: user.id,
      role: user.role as "team" | "admin",
      email: user.email,
    }, 60 * 60 * 24 * 7); // 7 days for team

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.full_name,
        role: user.role,
      },
      token,
    });

    response.cookies.set("qh_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Login failed." }, { status: 500 });
  }
}
