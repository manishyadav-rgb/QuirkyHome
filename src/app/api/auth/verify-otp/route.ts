import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashOtp, normalizePhone, signToken, TOKEN_COOKIE } from "@/lib/auth";
import { isTwoFactorEnabled, verifyTwoFactorOtp } from "@/lib/twofactor";

export const runtime = "nodejs";

type UserRow = {
  id: string;
  phone_e164: string;
  full_name: string | null;
  email: string | null;
};

type OtpSessionRow = {
  id: string;
  otp_hash: string;
  external_session_id?: string | null;
  provider?: string | null;
  attempts: number;
  max_attempts: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(String(body.phone ?? ""));
    const otp = String(body.otp ?? "").replace(/\D/g, "");

    if (!/^\+[1-9]\d{9,14}$/.test(phone) || otp.length !== 6) {
      return NextResponse.json({ error: "Enter a valid phone number and 6-digit OTP." }, { status: 400 });
    }

    if (!isTwoFactorEnabled()) {
      return NextResponse.json(
        { error: "2Factor is not configured. Set TWOFACTOR_API_KEY." },
        { status: 500 },
      );
    }

    const sessionResult = await query<OtpSessionRow>(
      `select id, otp_hash, external_session_id, provider, attempts, max_attempts
       from auth_otp_requests
       where phone_e164 = $1
         and purpose = 'login'
         and is_verified = false
         and consumed_at is null
         and expires_at > now()
       order by created_at desc
       limit 1`,
      [phone],
    );

    const otpSession = sessionResult.rows[0];
    if (!otpSession) {
      return NextResponse.json({ error: "OTP expired. Please request a new OTP." }, { status: 400 });
    }

    if (otpSession.attempts >= otpSession.max_attempts) {
      return NextResponse.json({ error: "Too many attempts. Please request a new OTP." }, { status: 429 });
    }

    const provider = otpSession.provider || "2factor-voice";
    let isValid = false;

    if (provider === "2factor-sms") {
      if (otpSession.external_session_id) {
        isValid = await verifyTwoFactorOtp(otpSession.external_session_id, otp);
      }
    } else {
      isValid = otpSession.otp_hash === hashOtp(phone, otp);
    }

    if (!isValid) {
      await query("update auth_otp_requests set attempts = attempts + 1 where id = $1", [otpSession.id]);
      return NextResponse.json({ error: "Incorrect or expired OTP.", provider, sessionId: otpSession.external_session_id || null }, { status: 400 });
    }
    await query(
      "update auth_otp_requests set is_verified = true, consumed_at = now(), attempts = attempts + 1 where id = $1",
      [otpSession.id],
    );

    // Upsert user
    const userResult = await query<UserRow>(
      `insert into users (phone_e164, last_login_at)
       values ($1, now())
       on conflict (phone_e164) do update
       set last_login_at = now(),
           updated_at = now()
       returning id, phone_e164, full_name, email`,
      [phone],
    );

    const user = userResult.rows[0];

    // Sign JWT token
    const token = signToken({
      sub: user.id,
      role: "customer",
      phone: user.phone_e164,
    }, 60 * 60 * 24 * 30); // 30 days

    const response = NextResponse.json({
      ok: true,
      provider,
      user: {
        id: user.id,
        phone: user.phone_e164,
        name: user.full_name,
        email: user.email,
        role: "customer",
      },
      token,
    });

    // Set JWT as httpOnly cookie
    response.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not verify OTP." }, { status: 500 });
  }
}
