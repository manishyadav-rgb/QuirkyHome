"use client";

import { CheckCircle2, ChevronLeft, LogOut, Package, ShieldCheck, Smartphone, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { SectionHeader } from "@/components/ui/SectionHeader";

type LoginStep = "phone" | "otp" | "done";
type UserInfo = { id: string; phone: string; name: string | null; email: string | null; role: string };

export default function AccountPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if already logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setStep("done");
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  async function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not send OTP.");

      setNormalizedPhone(data.phone);
      setDevOtp(data.devOtp ?? "");
      setStep("otp");
      setOtp("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!otp.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: normalizedPhone || phone, otp }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not verify OTP.");

      setUser(data.user);
      setStep("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setStep("phone");
    setPhone("");
    setOtp("");
    setMessage("");
  }

  if (checkingAuth) {
    return (
      <section className="qh-container qh-section-pad">
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand-primary" />
        </div>
      </section>
    );
  }

  return (
    <section className="qh-container qh-section-pad">
      <div className="qh-card mx-auto max-w-narrow p-8">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-background-soft text-brand-primary">
          {step === "done" ? <CheckCircle2 className="h-8 w-8" /> : <UserRound className="h-8 w-8" />}
        </div>
        <SectionHeader
          align="center"
          eyebrow="Account"
          title={step === "phone" ? "Login with Phone Number" : step === "otp" ? "Verify OTP" : `Welcome back${user?.name ? `, ${user.name}` : ""}!`}
          description={
            step === "phone"
              ? "Enter your phone number and verify with OTP to access your QuirkyHome account."
              : step === "otp"
                ? `We sent a 6-digit OTP to ${normalizedPhone || phone}.`
                : `Logged in as ${user?.phone ?? user?.email ?? "user"}`
          }
        />

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="mx-auto grid max-w-narrow gap-3">
            <label htmlFor="phone" className="text-sm font-semibold text-text-main">Phone Number</label>
            <div className="relative">
              <Smartphone className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-soft" />
              <input
                id="phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+91 98765 43210"
                inputMode="tel"
                className="qh-focus h-button-lg w-full rounded-full border border-border bg-background-elevated pl-12 pr-5 text-text-main placeholder:text-text-soft"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading}>{loading ? "Sending..." : "Send OTP"}</Button>
          </form>
        ) : null}

        {step === "otp" ? (
          <form onSubmit={handleVerifyOtp} className="mx-auto mt-6 grid max-w-narrow gap-3">
            <label htmlFor="otp" className="text-sm font-semibold text-text-main">Enter OTP</label>
            <input
              id="otp"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit OTP"
              inputMode="numeric"
              className="qh-focus h-button-lg rounded-full border border-border bg-background-elevated px-5 text-center text-2xl font-bold text-text-main placeholder:text-base placeholder:font-normal placeholder:text-text-soft"
            />
            <Button type="submit" size="lg" disabled={loading || otp.length !== 6}>
              <ShieldCheck className="h-5 w-5" /> {loading ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button type="button" size="lg" variant="ghost" onClick={() => setStep("phone")}>
              <ChevronLeft className="h-5 w-5" /> Change Number
            </Button>
            {devOtp ? <p className="rounded-lg bg-background-soft p-3 text-center text-sm font-semibold text-text-main">Dev OTP: {devOtp}</p> : null}
          </form>
        ) : null}

        {message ? (
          <p className="mx-auto mt-6 max-w-narrow rounded-lg border border-accent-sale/30 bg-background-soft p-3 text-center text-sm font-semibold text-accent-sale">{message}</p>
        ) : null}

        {step === "done" ? (
          <div className="mx-auto mt-6 grid max-w-narrow gap-4">
            <div className="rounded-lg border border-border bg-background-soft p-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Phone</span>
                  <span className="font-semibold">{user?.phone}</span>
                </div>
                {user?.name && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Name</span>
                    <span className="font-semibold">{user.name}</span>
                  </div>
                )}
                {user?.email && (
                  <div className="flex justify-between">
                    <span className="text-text-muted">Email</span>
                    <span className="font-semibold">{user.email}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-text-muted">Status</span>
                  <span className="font-semibold text-accent-discount">Verified ✓</span>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <ButtonLink href="/search" size="lg" variant="outline">Continue Shopping</ButtonLink>
              <ButtonLink href="/cart" size="lg"><Package className="h-4 w-4" /> My Cart</ButtonLink>
            </div>
            <Button size="lg" variant="ghost" onClick={handleLogout} className="text-accent-sale">
              <LogOut className="h-4 w-4" /> Sign Out
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
