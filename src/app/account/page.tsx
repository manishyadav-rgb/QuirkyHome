"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Headset, Heart, LogOut, Package, ShieldCheck, Smartphone, Star, Ticket, UserRound } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";

type LoginStep = "phone" | "otp" | "name" | "done";
type UserInfo = { id: string; phone: string; name: string | null; email: string | null; role: string };

export default function AccountPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState("");
  const [step, setStep] = useState<LoginStep>("phone");
  const [devOtp, setDevOtp] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { wishlistCount } = useShop();

  // Check if already logged in
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          if (!data.user.name) {
            setStep("name");
          } else {
            setStep("done");
          }
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
      if (data.user.name) {
        setStep("done");
      } else {
        setName("");
        setStep("name");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveName(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not save name.");

      setUser(data.user);
      setStep("done");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save name.");
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
    setName("");
    setMessage("");
  }

  if (checkingAuth) {
    return (
      <section className="qh-container qh-section-pad">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand-primary" />
        </div>
      </section>
    );
  }

  if (step === "name") {
    return (
      <section className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-background-soft/10 to-transparent">
        <div className="w-full max-w-md space-y-6 qh-card bg-background-elevated p-8 sm:p-10 shadow-2xl border border-border/80 transition-all duration-300 rounded-3xl relative overflow-hidden">
          {/* Ambient top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary" />
          
          <div className="text-center space-y-4">
            {/* Beautiful custom avatar placeholder inside Name Step */}
            <div className="mx-auto relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-brand-primary/10 to-brand-secondary/15 text-brand-primary shadow-inner border border-brand-primary/20">
              <UserRound className="h-9 w-9 stroke-[1.5]" />
              <div className="absolute bottom-0.5 right-0.5 h-4.5 w-4.5 rounded-full bg-green-500 border-4 border-background-elevated" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-text-main">
                Personalize Your Profile
              </h2>
              <p className="text-[13px] sm:text-sm text-text-muted leading-relaxed max-w-xs mx-auto">
                Welcome to QuirkyHome! Please enter your name to complete your premium dashboard setup.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveName} className="space-y-4 mt-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-[11px] font-bold text-text-muted uppercase tracking-wider block">
                Full Name
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-soft transition-colors duration-200" />
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder=""
                  type="text"
                  autoFocus
                  className="qh-focus h-12 w-full rounded-2xl border border-border bg-background-elevated pl-11 pr-4 text-text-main placeholder:text-text-soft focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200 text-sm font-medium"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              disabled={loading || !name.trim()} 
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-text-inverse hover:brightness-105 transition-all duration-200 shadow-md flex items-center justify-center gap-2 font-bold text-sm tracking-wide mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-text-inverse border-t-transparent" />
                  <span>Saving profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>Explore QuirkyHome</span>
                </>
              )}
            </Button>
          </form>

          {message ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-center text-xs font-semibold text-accent-sale mt-4">
              {message}
            </div>
          ) : null}

          {/* Security disclaimer */}
          <div className="text-center pt-2">
            <p className="text-[10px] text-text-soft font-semibold tracking-wide uppercase">
              🔒 Secured Encrypted Connection
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (step !== "done") {
    return (
      <section className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-background-soft/10 to-transparent">
        <div className="w-full max-w-md space-y-8 qh-card bg-background-elevated p-8 sm:p-10 shadow-xl border border-border/80 transition-all duration-300">
          
          <div className="text-center space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary text-text-inverse shadow-md">
              <UserRound className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-text-main sm:text-3xl">
              {step === "phone" ? "Login to QuirkyHome" : "Verify Your Number"}
            </h2>
            <p className="text-sm text-text-muted leading-relaxed max-w-xs mx-auto">
              {step === "phone" && "Enter your phone number to access saved favorites, track live orders, and unlock exclusive discounts."}
              {step === "otp" && `We've sent a 6-digit OTP code to ${normalizedPhone || phone}.`}
            </p>
          </div>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="grid gap-4 mt-6">
              <div className="grid gap-2">
                <label htmlFor="phone" className="text-xs font-bold text-text-muted uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-soft" />
                  <input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91 98765 43210"
                    inputMode="tel"
                    className="qh-focus h-12 w-full rounded-2xl border border-border bg-background-elevated pl-11 pr-4 text-text-main placeholder:text-text-soft focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200"
                  />
                </div>
              </div>
              <Button type="submit" size="lg" disabled={loading} className="w-full h-12 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-text-inverse hover:brightness-105 transition-all duration-200 shadow-md">
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : null}

          {step === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="grid gap-4 mt-6">
              <div className="grid gap-2">
                <label htmlFor="otp" className="text-xs font-bold text-text-muted uppercase tracking-wider text-center">Enter 6-Digit OTP</label>
                <input
                  id="otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  className="qh-focus h-14 w-full min-w-0 rounded-2xl border border-border bg-background-elevated px-4 text-center text-2xl font-bold tracking-[0.25em] text-text-main placeholder:tracking-normal placeholder:text-sm placeholder:font-normal placeholder:text-text-soft sm:px-5 sm:text-3xl transition-all duration-200"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading || otp.length !== 6} className="w-full h-12 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-text-inverse hover:brightness-105 transition-all duration-200 shadow-md flex items-center justify-center gap-2">
                <ShieldCheck className="h-5 w-5" /> {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <Button type="button" size="lg" variant="ghost" onClick={() => setStep("phone")} className="w-full h-12 rounded-2xl text-text-muted hover:text-brand-primary">
                <ChevronLeft className="h-4 w-4" /> Change Number
              </Button>
              {devOtp ? (
                <div className="rounded-2xl bg-background-soft border border-brand-primary/20 p-3 text-center">
                  <p className="text-xs font-bold text-brand-secondary uppercase tracking-wider mb-1">Developer Testing OTP</p>
                  <p className="text-lg font-black text-brand-primary tracking-widest">{devOtp}</p>
                </div>
              ) : null}
            </form>
          ) : null}

          {message ? (
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-center text-sm font-semibold text-accent-sale mt-4">
              {message}
            </div>
          ) : null}

        </div>
      </section>
    );
  }

  return (
    <section className="qh-container py-8 sm:py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column (Sidebar) */}
        <div className="md:col-span-4 lg:col-span-3 space-y-6">
          {/* User Profile Card */}
          <div className="qh-card overflow-hidden bg-gradient-to-b from-background-elevated to-background-soft/30 p-6 flex flex-col items-center text-center shadow-md relative group border border-border/80 rounded-2xl">
            {/* Ambient background glow */}
            <div className="absolute -right-16 -top-16 w-32 h-32 bg-brand-primary/10 rounded-full blur-2xl group-hover:bg-brand-primary/20 transition-all duration-300" />
            
            {/* Avatar Circle with name initial */}
            <div className="relative mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-3xl font-extrabold text-text-inverse shadow-md border-4 border-background-elevated">
              {user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
              <div className="absolute bottom-0 right-0 h-4.5 w-4.5 rounded-full bg-green-500 border-3 border-background-elevated shadow-soft" />
            </div>

            <h3 className="font-bold text-lg text-text-main leading-tight mb-1 truncate max-w-full">
              {user?.name ?? "Quirky Decorator"}
            </h3>
            <p className="text-xs text-text-muted mb-3 font-mono">
              {user?.phone ?? user?.email ?? "Premium Member"}
            </p>

            {/* Premium Tier Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background-elevated border border-border text-[11px] font-bold text-brand-primary shadow-soft mb-2 select-none">
              <Star className="h-3 w-3 fill-brand-primary" />
              <span>Elite Member</span>
            </div>

            {/* Divider */}
            <div className="w-full border-t border-border/60 my-4" />

            {/* Sidebar Navigation */}
            <div className="w-full space-y-1 hidden md:block">
              <ButtonLink href="/account/orders" variant="ghost" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-semibold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all duration-200">
                <Package className="h-4.5 w-4.5" />
                <span className="flex-1">My Orders</span>
                <ChevronRight className="h-4 w-4 text-text-soft" />
              </ButtonLink>
              <ButtonLink href="/wishlist" variant="ghost" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-semibold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all duration-200">
                <Heart className="h-4.5 w-4.5" />
                <span className="flex-1">Wishlist</span>
                <ChevronRight className="h-4 w-4 text-text-soft" />
              </ButtonLink>
              <ButtonLink href="/account/coupons" variant="ghost" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-semibold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all duration-200">
                <Ticket className="h-4.5 w-4.5" />
                <span className="flex-1">My Coupons</span>
                <ChevronRight className="h-4 w-4 text-text-soft" />
              </ButtonLink>
              <ButtonLink href="/account/reviews" variant="ghost" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-semibold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all duration-200">
                <Star className="h-4.5 w-4.5" />
                <span className="flex-1">My Reviews</span>
                <ChevronRight className="h-4 w-4 text-text-soft" />
              </ButtonLink>
              <ButtonLink href="/account/help" variant="ghost" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-sm font-semibold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all duration-200">
                <Headset className="h-4.5 w-4.5" />
                <span className="flex-1">Help Center</span>
                <ChevronRight className="h-4 w-4 text-text-soft" />
              </ButtonLink>
            </div>

            {/* Logout button */}
            <button onClick={handleLogout} className="qh-focus mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200/50 text-xs font-bold text-accent-sale bg-red-50/50 hover:bg-red-100/60 transition-all duration-200">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Right Column (Main Panel) */}
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
          
          {/* Welcome Banner Card */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-secondary to-brand-primary p-6 sm:p-8 text-text-inverse shadow-md border border-brand-primary/20">
            {/* Ambient decoration */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-background-elevated/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
                  Welcome back{user?.name ? `, ${user.name}` : ""}!
                </h2>
                <p className="text-sm text-text-inverse/90 max-w-lg leading-relaxed font-medium">
                  Your premium space to discover and decorate with unique collections, track live shipments, and manage your custom decor settings.
                </p>
              </div>
              <div className="hidden lg:block bg-background-elevated/20 backdrop-blur-sm p-4 rounded-xl border border-background-elevated/30">
                <Star className="h-8 w-8 text-brand-accent" />
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="qh-card bg-background-elevated p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 border border-border/80 rounded-2xl">
              <span className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider">My Orders</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl sm:text-2xl font-black text-brand-primary">0</span>
                <span className="text-[10px] text-text-soft font-semibold">Active</span>
              </div>
            </div>
            <div className="qh-card bg-background-elevated p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 border border-border/80 rounded-2xl">
              <span className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider">Wishlist</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl sm:text-2xl font-black text-brand-primary">{wishlistCount}</span>
                <span className="text-[10px] text-text-soft font-semibold">Items</span>
              </div>
            </div>
            <div className="qh-card bg-background-elevated p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 border border-border/80 rounded-2xl">
              <span className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-wider">Coupons</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl sm:text-2xl font-black text-brand-primary">3</span>
                <span className="text-[10px] text-text-soft font-semibold">Available</span>
              </div>
            </div>
          </div>

          {/* Dashboard Options Grid: Refined 2x2 Grid + Full Width Option */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            
            <ButtonLink href="/account/orders" variant="ghost" className="qh-card group bg-background-elevated p-4 sm:p-5 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md hover:bg-background-soft/20 border border-border/80 rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-text-inverse transition-all duration-300">
                <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-text-main group-hover:text-brand-primary transition-all duration-200">My Orders</h4>
                <p className="text-[9px] sm:text-xs text-text-muted leading-tight">Track & manage shipments</p>
              </div>
            </ButtonLink>

            <ButtonLink href="/wishlist" variant="ghost" className="qh-card group bg-background-elevated p-4 sm:p-5 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md hover:bg-background-soft/20 border border-border/80 rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-text-inverse transition-all duration-300">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-text-main group-hover:text-brand-primary transition-all duration-200">Wishlist</h4>
                <p className="text-[9px] sm:text-xs text-text-muted leading-tight">Your saved favorites</p>
              </div>
            </ButtonLink>

            <ButtonLink href="/account/coupons" variant="ghost" className="qh-card group bg-background-elevated p-4 sm:p-5 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md hover:bg-background-soft/20 border border-border/80 rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-text-inverse transition-all duration-300">
                <Ticket className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-text-main group-hover:text-brand-primary transition-all duration-200">My Coupons</h4>
                <p className="text-[9px] sm:text-xs text-text-muted leading-tight">Extra discount vouchers</p>
              </div>
            </ButtonLink>

            <ButtonLink href="/account/reviews" variant="ghost" className="qh-card group bg-background-elevated p-4 sm:p-5 flex flex-col items-center text-center gap-3 shadow-sm hover:shadow-md hover:bg-background-soft/20 border border-border/80 rounded-2xl transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-text-inverse transition-all duration-300">
                <Star className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs sm:text-sm text-text-main group-hover:text-brand-primary transition-all duration-200">My Reviews</h4>
                <p className="text-[9px] sm:text-xs text-text-muted leading-tight">Manage product ratings</p>
              </div>
            </ButtonLink>

            <ButtonLink href="/account/help" variant="ghost" className="qh-card col-span-2 group bg-background-elevated p-4 sm:p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:bg-background-soft/20 border border-border/80 rounded-2xl text-left transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-text-inverse transition-all duration-300">
                <Headset className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-xs sm:text-sm text-text-main group-hover:text-brand-primary transition-all duration-200">24/7 Help Desk</h4>
                <p className="text-[9px] sm:text-xs text-text-muted leading-tight">Need assistance? Talk to our support team</p>
              </div>
            </ButtonLink>
            
          </div>
        </div>

      </div>
    </section>
  );
}
