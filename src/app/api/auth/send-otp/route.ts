import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { query } from "@/lib/db";
import { hashOtp, normalizePhone } from "@/lib/auth";
import { isTwoFactorEnabled, sendTwoFactorVoiceOtp } from "@/lib/twofactor";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(String(body.phone ?? ""));

    if (!/^\+[1-9]\d{9,14}$/.test(phone)) {
      return NextResponse.json({ error: "Enter a valid phone number with country code." }, { status: 400 });
    }

    if (!isTwoFactorEnabled()) {
      return NextResponse.json(
        { error: "2Factor is not configured. Set TWOFACTOR_API_KEY." },
        { status: 500 },
      );
    }

    const otp = String(randomInt(100000, 999999));
    const sessionId = await sendTwoFactorVoiceOtp(phone, otp);
    await query(`alter table if exists auth_otp_requests add column if not exists provider varchar(32)`);
    await query(`alter table if exists auth_otp_requests add column if not exists external_session_id text`);
    await query(
      `insert into auth_otp_requests (phone_e164, otp_hash, external_session_id, provider, expires_at, user_agent)
       values ($1, $2, $3, $4, now() + interval '10 minutes', $5)`,
      [phone, hashOtp(phone, otp), sessionId, "2factor-voice", request.headers.get("user-agent")],
    );

    return NextResponse.json({
      ok: true,
      phone,
      provider: "2factor-voice",
      sessionId,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not send OTP." }, { status: 500 });
  }
}
