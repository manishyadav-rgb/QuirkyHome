import { URLSearchParams } from "url";

const TWO_FACTOR_BASE_URL = "https://2factor.in/API/V1";

type TwoFactorResponse = {
  Status?: string;
  Details?: string;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function toTwoFactorPhone(phoneE164: string): string {
  const digits = phoneE164.replace(/\D/g, "");
  // 2Factor expects 10-digit mobile number (without country code) for India.
  if (digits.length === 10) return digits;
  if (digits.length > 10) return digits.slice(-10);
  throw new Error("Invalid phone number for 2Factor. Expected 10-digit mobile.");
}

export function isTwoFactorEnabled(): boolean {
  return Boolean(process.env.TWOFACTOR_API_KEY);
}

export async function sendTwoFactorOtp(phoneE164: string): Promise<string> {
  const apiKey = requireEnv("TWOFACTOR_API_KEY");
  const cleaned = toTwoFactorPhone(phoneE164);

  const url = `${TWO_FACTOR_BASE_URL}/${encodeURIComponent(apiKey)}/SMS/${encodeURIComponent(cleaned)}/AUTOGEN`;
  const response = await fetch(url, { method: "GET" });
  const data = (await response.json()) as TwoFactorResponse;

  if (!response.ok || data.Status !== "Success" || !data.Details) {
    throw new Error(`2Factor send OTP failed: ${data.Details || response.statusText}`);
  }

  return data.Details;
}

export async function sendTwoFactorVoiceOtp(phoneE164: string, otp: string): Promise<string> {
  const apiKey = requireEnv("TWOFACTOR_API_KEY");
  const cleaned = toTwoFactorPhone(phoneE164);
  const url = `${TWO_FACTOR_BASE_URL}/${encodeURIComponent(apiKey)}/VOICE/${encodeURIComponent(cleaned)}/${encodeURIComponent(otp)}`;
  const response = await fetch(url, { method: "GET" });
  const data = (await response.json()) as TwoFactorResponse;

  if (!response.ok || data.Status !== "Success") {
    throw new Error(`2Factor voice OTP failed: ${data.Details || response.statusText}`);
  }

  return data.Details || "";
}

export async function verifyTwoFactorOtp(sessionId: string, otp: string): Promise<boolean> {
  const apiKey = requireEnv("TWOFACTOR_API_KEY");
  const url = `${TWO_FACTOR_BASE_URL}/${encodeURIComponent(apiKey)}/SMS/VERIFY/${encodeURIComponent(sessionId)}/${encodeURIComponent(otp)}`;
  const response = await fetch(url, { method: "GET" });
  const data = (await response.json()) as TwoFactorResponse;

  if (!response.ok) return false;
  return data.Status === "Success" && (data.Details || "").toLowerCase().includes("otp matched");
}
