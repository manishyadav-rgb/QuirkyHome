const TWILIO_VERIFY_BASE_URL = "https://verify.twilio.com/v2";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function getTwilioAuthHeader(): string {
  const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
  const authToken = requireEnv("TWILIO_AUTH_TOKEN");
  const basic = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  return `Basic ${basic}`;
}

export function isTwilioVerifyEnabled(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID,
  );
}

export async function sendTwilioVerification(to: string): Promise<void> {
  const serviceSid = requireEnv("TWILIO_VERIFY_SERVICE_SID");
  const response = await fetch(`${TWILIO_VERIFY_BASE_URL}/Services/${serviceSid}/Verifications`, {
    method: "POST",
    headers: {
      Authorization: getTwilioAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      Channel: "sms",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio send OTP failed: ${text}`);
  }
}

export async function checkTwilioVerification(to: string, code: string): Promise<boolean> {
  const serviceSid = requireEnv("TWILIO_VERIFY_SERVICE_SID");
  const response = await fetch(`${TWILIO_VERIFY_BASE_URL}/Services/${serviceSid}/VerificationCheck`, {
    method: "POST",
    headers: {
      Authorization: getTwilioAuthHeader(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      To: to,
      Code: code,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio verify OTP failed: ${text}`);
  }

  const data = (await response.json()) as { status?: string; valid?: boolean };
  return data.valid === true || data.status === "approved";
}
