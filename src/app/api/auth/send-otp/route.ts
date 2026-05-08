import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { hashOtp, normalizePhone } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const phone = normalizePhone(String(body.phone ?? ""));

    if (!/^\+[1-9]\d{9,14}$/.test(phone)) {
      return NextResponse.json({ error: "Enter a valid phone number with country code." }, { status: 400 });
    }

    const otp = String(randomInt(100000, 999999));
    await query(
      `insert into auth_otp_requests (phone_e164, otp_hash, expires_at, user_agent)
       values ($1, $2, now() + interval '10 minutes', $3)`,
      [phone, hashOtp(phone, otp), request.headers.get("user-agent")],
    );

    // In production, send OTP via SMS. In dev, return it in response.
    return NextResponse.json({
      ok: true,
      phone,
      devOtp: process.env.NODE_ENV === "production" ? undefined : otp,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not send OTP." }, { status: 500 });
  }
}
