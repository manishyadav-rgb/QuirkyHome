"use client";

import { CheckCircle2, ChevronLeft, ChevronRight, Headset, Heart, LogOut, Package, ShieldCheck, Smartphone, Star, Ticket, UserRound, Mail, MapPin } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useShop } from "@/components/shop/ShopProvider";
import Link from "next/link";

type LoginStep = "phone" | "otp" | "name" | "done";
type UserInfo = {
  id: string;
  phone: string;
  name: string | null;
  email: string | null;
  role: string;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingState?: string | null;
  shippingPincode?: string | null;
};
type BrandingInfo = { brandName: string; logoText: string; brandColor: string };

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
  const [orderCount, setOrderCount] = useState(0);
  const [branding, setBranding] = useState<BrandingInfo>({ brandName: "QuirkyHome", logoText: "QH", brandColor: "#432F83" });
  const { wishlistCount } = useShop();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editPincode, setEditPincode] = useState("");

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

  useEffect(() => {
    if (step !== "done") return;
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        const total = Array.isArray(data?.orders) ? data.orders.length : 0;
        setOrderCount(total);
      })
      .catch(() => setOrderCount(0));
  }, [step]);

  useEffect(() => {
    fetch("/api/branding")
      .then((r) => r.json())
      .then((data) => {
        if (data?.brandName) {
          setBranding({
            brandName: data.brandName,
            logoText: data.logoText || data.brandName.slice(0, 2).toUpperCase(),
            brandColor: data.brandColor || "#432F83",
          });
        }
      })
      .catch(() => {});
  }, []);

  async function handleSendOtp(event?: FormEvent<HTMLFormElement>, method: "sms" | "voice" = "sms") {
    if (event) event.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, method }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not send OTP.");

      setNormalizedPhone(data.phone);
      setDevOtp(data.devOtp ?? "");
      setStep("otp");
      setOtp("");
      if (method === "voice") {
        setMessage("Calling you now with the OTP... Please listen carefully.");
      } else {
        setMessage("OTP code sent successfully via SMS.");
      }
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

  const startEditingProfile = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setIsEditingProfile(true);
    setMessage("");
  };

  async function handleUpdateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, email: editEmail }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update profile.");
      setUser(data.user);
      setIsEditingProfile(false);
      setMessage("Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update profile.");
    } finally {
      setLoading(false);
    }
  }

  const startEditingAddress = () => {
    setEditAddress(user?.shippingAddress || "");
    setEditCity(user?.shippingCity || "");
    setEditState(user?.shippingState || "");
    setEditPincode(user?.shippingPincode || "");
    setIsEditingAddress(true);
    setMessage("");
  };

  async function handleUpdateAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: editAddress,
          shippingCity: editCity,
          shippingState: editState,
          shippingPincode: editPincode,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not update address.");
      setUser(data.user);
      setIsEditingAddress(false);
      setMessage("Address updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update address.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteAddress() {
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress: " ",
          shippingCity: " ",
          shippingState: " ",
          shippingPincode: " ",
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not delete address.");
      setUser(data.user);
      setMessage("Address deleted successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete address.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <section className="qh-container py-20">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand-primary" />
        </div>
      </section>
    );
  }

  // STEP: Enter Name Profile Personalization
  if (step === "name") {
    return (
      <section className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-background-soft to-transparent font-sans">
        <div className="w-full max-w-md space-y-6 bg-white p-8 sm:p-10 border border-border shadow-dropdown rounded-3xl relative overflow-hidden">
          {/* Ambient top decoration */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-primary" />
          
          <div className="text-center space-y-4">
            <div className="mx-auto relative flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary shadow-inner border border-brand-primary/20">
              <UserRound className="h-9 w-9 stroke-[1.5]" />
              <div className="absolute bottom-0.5 right-0.5 h-4.5 w-4.5 rounded-full bg-green-500 border-4 border-white" />
            </div>
            
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-text-main">
                Personalize Your Profile
              </h2>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-xs mx-auto">
                Welcome to {branding.brandName}! Please enter your name to complete your premium dashboard setup.
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
                  placeholder="Enter your name"
                  type="text"
                  autoFocus
                  className="qh-focus h-12 w-full rounded-2xl border border-border bg-white pl-11 pr-4 text-text-main placeholder:text-text-soft focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200 text-sm font-semibold"
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              size="lg" 
              disabled={loading || !name.trim()} 
              className="w-full h-12 rounded-2xl bg-[#432F83] hover:bg-[#5A31DD] text-white shadow-md flex items-center justify-center gap-2 font-bold text-sm tracking-wide mt-2"
            >
              {loading ? (
                <>
                  <div className="h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving profile...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  <span>Explore {branding.brandName}</span>
                </>
              )}
            </Button>
          </form>

          {message && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-semibold text-accent-sale mt-4">
              {message}
            </div>
          )}

          <div className="text-center pt-2">
            <p className="text-[10px] text-text-soft font-bold tracking-wide uppercase flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-[#129C80]" /> Secured Encrypted Connection
            </p>
          </div>
        </div>
      </section>
    );
  }

  // STEP: Login / Register (Phone and OTP)
  if (step !== "done") {
    return (
      <section className="min-h-[72vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-background-soft to-transparent font-sans">
        <div className="w-full max-w-sm space-y-6 bg-white p-6 sm:p-8 border border-border shadow-dropdown rounded-3xl">
          
          <div className="text-center space-y-3">
            <div
              className="mx-auto inline-flex h-9 min-w-14 items-center justify-center rounded-lg px-3.5 text-xs font-black tracking-wider text-white shadow-sm"
              style={{ backgroundColor: branding.brandColor }}
            >
              {branding.logoText}
            </div>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary shadow-sm">
              <UserRound className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-text-main sm:text-2xl">
              {step === "phone" ? `Login to ${branding.brandName}` : "Verify Your Number"}
            </h2>
            <p className="text-xs text-text-muted leading-relaxed max-w-xs mx-auto">
              {step === "phone" && "Enter your phone number to access saved favorites, track live orders, and unlock exclusive discounts."}
              {step === "otp" && `We've sent a 6-digit OTP code to ${normalizedPhone || phone}.`}
            </p>
          </div>

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="grid gap-4 mt-4">
              <div className="grid gap-1.5">
                <label htmlFor="phone" className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-text-soft" />
                  <input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit mobile number"
                    inputMode="tel"
                    className="qh-focus h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3.5 text-sm text-text-main placeholder:text-text-soft focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all duration-200 font-semibold"
                  />
                </div>
              </div>
              <Button type="submit" size="lg" disabled={loading || phone.length < 10} className="w-full h-11 rounded-xl bg-[#432F83] hover:bg-[#5A31DD] text-white text-xs font-bold tracking-wide transition-all shadow-md">
                {loading ? "Sending..." : "Send OTP"}
              </Button>
            </form>
          ) : null}

          {step === "otp" ? (
            <form onSubmit={handleVerifyOtp} className="grid gap-4 mt-4">
              <div className="grid gap-1.5">
                <label htmlFor="otp" className="text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Enter 6-Digit OTP</label>
                <input
                  id="otp"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  inputMode="numeric"
                  className="qh-focus h-11 w-full min-w-0 rounded-xl border border-border bg-white px-3.5 text-center text-xl font-bold tracking-[0.2em] text-text-main placeholder:tracking-normal placeholder:text-sm placeholder:font-semibold placeholder:text-text-soft sm:px-4 transition-all duration-200"
                />
              </div>
              <Button type="submit" size="lg" disabled={loading || otp.length !== 6} className="w-full h-11 rounded-xl bg-[#432F83] hover:bg-[#5A31DD] text-white text-xs font-bold tracking-wide transition-all shadow-md flex items-center justify-center gap-2">
                <ShieldCheck className="h-4.5 w-4.5" /> {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <div className="flex flex-col gap-2">
                <Button type="button" size="lg" variant="ghost" onClick={() => setStep("phone")} className="w-full h-10 rounded-xl text-xs font-bold text-text-muted hover:text-brand-primary flex items-center justify-center gap-1">
                  <ChevronLeft className="h-4 w-4" /> Change Number
                </Button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleSendOtp(undefined, "voice")}
                  className="w-full h-10 rounded-xl border border-dashed border-brand-primary/30 hover:border-brand-primary/60 text-[10px] font-bold text-brand-primary hover:bg-brand-primary/5 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  📞 Didn't receive SMS? Get OTP via Phone Call
                </button>
              </div>
              
              {/* Dev Helper Block */}
              {devOtp && (
                <div className="rounded-2xl bg-background-soft border border-brand-primary/20 p-3 text-center">
                  <p className="text-[10px] font-bold text-brand-secondary uppercase tracking-wider mb-1">Developer Testing OTP</p>
                  <p className="text-lg font-black text-brand-primary tracking-widest">{devOtp}</p>
                </div>
              )}
            </form>
          ) : null}

          {message && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-xs font-semibold text-accent-sale mt-4">
              {message}
            </div>
          )}

        </div>
      </section>
    );
  }

  // STEP: Dashboard Home (Flipkart-Style UI/UX Structure)
  return (
    <section className="qh-container py-8 sm:py-12 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Flipkart-style Sidebar Menu) */}
        <div className="order-2 md:order-1 md:col-span-4 lg:col-span-3 space-y-4">
          
          {/* Hello User Welcome Widget */}
          <div className="flex items-center gap-4 bg-white border border-border p-4 rounded-2xl shadow-sm">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-brand-primary to-brand-secondary text-lg font-black text-white shadow-sm border border-brand-primary/20">
              {user?.name ? user.name.trim().charAt(0).toUpperCase() : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-text-soft uppercase tracking-wide">Hello,</p>
              <h3 className="font-sans text-sm font-extrabold text-text-main truncate">
                {user?.name ?? "Quirky Decorator"}
              </h3>
            </div>
          </div>

          {/* Flipkart-Style Option Directory Box */}
          <div className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden divide-y divide-border/50">
            {/* Direct Link 1: My Orders */}
            <div className="py-3">
              <Link href="/account/orders" className="flex items-center gap-3 px-5 py-1 text-sm font-bold text-brand-primary hover:bg-background-soft transition-all duration-200">
                <Package className="h-4.5 w-4.5" />
                <span className="flex-1">MY ORDERS</span>
                <ChevronRight className="h-4 w-4 text-brand-primary" />
              </Link>
            </div>

            {/* Direct Link 2: Account Settings */}
            <div className="py-3">
              <div className="flex items-center gap-3 px-5 py-1 text-xs font-black text-text-soft uppercase tracking-wider">
                <UserRound className="h-4 w-4" />
                <span>Account Settings</span>
              </div>
              <div className="mt-2.5 flex flex-col gap-0.5">
                <Link href="/account" className="px-12 py-2 text-xs font-bold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all">
                  Profile Information
                </Link>
                <Link href="/account" className="px-12 py-2 text-xs font-bold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all">
                  Manage Addresses
                </Link>
              </div>
            </div>

            {/* Direct Link 3: My Stuff */}
            <div className="py-3">
              <div className="flex items-center gap-3 px-5 py-1 text-xs font-black text-text-soft uppercase tracking-wider">
                <Heart className="h-4 w-4" />
                <span>My Stuff</span>
              </div>
              <div className="mt-2.5 flex flex-col gap-0.5">
                <Link href="/wishlist" className="flex justify-between items-center px-12 py-2 text-xs font-bold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all">
                  <span>My Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-brand-primary/10 text-brand-primary text-[9px] font-black px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <Link href="/account/coupons" className="px-12 py-2 text-xs font-bold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all">
                  My Coupons
                </Link>
                <Link href="/account/reviews" className="px-12 py-2 text-xs font-bold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all">
                  My Reviews & Ratings
                </Link>
              </div>
            </div>

            {/* Direct Link 4: Support */}
            <div className="py-3">
              <Link href="/account/help" className="flex items-center gap-3 px-5 py-1 text-xs font-bold text-text-main hover:bg-background-soft hover:text-brand-primary transition-all duration-200">
                <Headset className="h-4.5 w-4.5 text-text-soft" />
                <span className="flex-1 uppercase tracking-wider text-xs">Help Center</span>
                <ChevronRight className="h-4 w-4 text-text-soft" />
              </Link>
            </div>

            {/* Direct Link 5: Sign Out */}
            <div className="p-3 bg-background-muted/40">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200/50 text-xs font-bold text-red-600 bg-red-50/50 hover:bg-red-100/60 transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (Main Premium Details Panel) */}
        <div className="order-1 md:order-2 md:col-span-8 lg:col-span-9 space-y-6">
          
          {/* Welcome Banner Card (Now renders beautiful white text!) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-secondary to-brand-primary p-5 sm:p-8 text-white shadow-md border border-brand-primary/20">
            {/* Ambient decoration blur circles */}
            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight mb-2 leading-tight">
                  Welcome back{user?.name ? `, ${user.name}` : ""}!
                </h2>
                <p className="text-xs sm:text-sm text-white/90 max-w-lg leading-relaxed font-semibold">
                  Manage your personal details, secure addresses, active orders, and explore premium curated home styling parameters.
                </p>
              </div>
              <div className="hidden lg:flex bg-white/20 backdrop-blur-sm h-14 w-14 items-center justify-center rounded-2xl border border-white/30 shadow-inner">
                <Star className="h-7 w-7 text-white fill-white" />
              </div>
            </div>
          </div>

          {/* Quick Dashboard Stat Cards */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            <div className="bg-white border border-border p-3 sm:p-4 min-w-0 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
              <span className="text-[9px] sm:text-[11px] font-bold text-text-soft uppercase tracking-wider leading-tight">My Orders</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl sm:text-2xl font-black text-brand-primary">{orderCount}</span>
                <span className="text-[9px] text-[#909090] font-bold">Placed</span>
              </div>
            </div>
            <div className="bg-white border border-border p-3 sm:p-4 min-w-0 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
              <span className="text-[9px] sm:text-[11px] font-bold text-text-soft uppercase tracking-wider leading-tight">Wishlist</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl sm:text-2xl font-black text-brand-primary">{wishlistCount}</span>
                <span className="text-[9px] text-[#909090] font-bold">Items</span>
              </div>
            </div>
            <div className="bg-white border border-border p-3 sm:p-4 min-w-0 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200 rounded-2xl">
              <span className="text-[9px] sm:text-[11px] font-bold text-text-soft uppercase tracking-wider leading-tight">Vouchers</span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-xl sm:text-2xl font-black text-brand-primary">3</span>
                <span className="text-[9px] text-[#909090] font-bold">Available</span>
              </div>
            </div>
          </div>

          {/* High Fidelity Profile details form block (Flipkart Style Card) */}
          <div className="bg-white border border-border rounded-2xl shadow-sm p-6 space-y-6">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                <UserRound className="h-5 w-5 text-brand-primary" /> Personal Information
              </h3>
              {!isEditingProfile && (
                <button
                  onClick={startEditingProfile}
                  className="text-xs font-bold text-brand-primary hover:underline cursor-pointer bg-transparent border-0"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {isEditingProfile ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-soft uppercase tracking-wider block">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="qh-focus h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-bold text-text-main focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-soft uppercase tracking-wider block">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="qh-focus h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-semibold text-text-main focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-text-muted hover:bg-background-soft transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#432F83] text-white rounded-lg text-xs font-bold hover:bg-[#5A31DD] transition-colors"
                  >
                    {loading ? "Saving..." : "Save Details"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2">
                {/* Name Details Field */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-soft uppercase tracking-wider">First Name / Full Name</span>
                  <div className="h-10 flex items-center bg-background-muted px-3.5 rounded-lg border border-border/80 text-xs font-bold text-text-main">
                    {user?.name || "Not Configured"}
                  </div>
                </div>

                {/* Phone Details Field */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-soft uppercase tracking-wider">Mobile Number</span>
                  <div className="h-10 flex items-center bg-background-muted px-3.5 rounded-lg border border-border/80 text-xs font-bold text-[#575757]">
                    {user?.phone || "Not Registered"}
                  </div>
                </div>

                {/* Mock Gender Details Selection */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold text-text-soft uppercase tracking-wider block mb-1">Your Gender</span>
                  <div className="flex gap-4">
                    {["Male", "Female", "Other"].map((g) => {
                      const isSelected = g === "Male";
                      return (
                        <label key={g} className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#575757]">
                          <input
                            type="radio"
                            name="gender"
                            checked={isSelected}
                            readOnly
                            className="h-3.5 w-3.5 text-brand-primary focus:ring-brand-primary border-border"
                          />
                          <span>{g}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Email Address Field */}
                <div className="space-y-1 sm:col-span-2">
                  <span className="text-[10px] font-bold text-text-soft uppercase tracking-wider flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" /> Email Address
                  </span>
                  <div className="h-10 flex items-center bg-background-muted px-3.5 rounded-lg border border-border/80 text-xs font-semibold text-text-main">
                    {user?.email || "Not Configured"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Flipkart settings address book directory box */}
          <div className="bg-white border border-border rounded-2xl shadow-sm p-6 space-y-4">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2 pb-3 border-b border-border/60">
              <MapPin className="h-5 w-5 text-brand-primary" /> Delivery Addresses
            </h3>

            {isEditingAddress ? (
              <form onSubmit={handleUpdateAddress} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-soft uppercase tracking-wider block">Detailed Address</label>
                  <textarea
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    className="qh-focus w-full rounded-lg border border-border bg-white p-3 text-xs font-bold text-text-main focus:border-brand-primary min-h-[60px]"
                    required
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-soft uppercase tracking-wider block">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="qh-focus h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-bold text-text-main focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-soft uppercase tracking-wider block">State</label>
                    <input
                      type="text"
                      value={editState}
                      onChange={(e) => setEditState(e.target.value)}
                      className="qh-focus h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-bold text-text-main focus:border-brand-primary"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-text-soft uppercase tracking-wider block">Pincode</label>
                    <input
                      type="text"
                      value={editPincode}
                      onChange={(e) => setEditPincode(e.target.value)}
                      className="qh-focus h-10 w-full rounded-lg border border-border bg-white px-3 text-xs font-bold text-text-main focus:border-brand-primary"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingAddress(false)}
                    className="px-4 py-2 border border-border rounded-lg text-xs font-bold text-text-muted hover:bg-background-soft transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-[#432F83] text-white rounded-lg text-xs font-bold hover:bg-[#5A31DD] transition-colors"
                  >
                    {loading ? "Saving..." : "Save Address"}
                  </button>
                </div>
              </form>
            ) : user?.shippingAddress && user.shippingAddress.trim() ? (
              <div className="rounded-xl border border-border bg-background-soft p-4 space-y-2 relative overflow-hidden">
                <span className="absolute top-4 right-4 bg-brand-primary/10 text-brand-primary text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  HOME / WORK
                </span>
                <p className="text-xs font-bold text-text-main">{user?.name}</p>
                <p className="text-xs text-text-muted leading-relaxed">
                  {user?.shippingAddress}
                  {user?.shippingCity ? `, ${user.shippingCity}` : ""}
                  {user?.shippingState ? `, ${user.shippingState}` : ""}
                  {user?.shippingPincode ? ` - ${user.shippingPincode}` : ""}
                </p>
                <p className="text-xs text-text-muted mt-1 font-semibold">
                  📞 Phone: {user?.phone}
                </p>
                <div className="flex gap-3 mt-3 pt-3 border-t border-border/60">
                  <button
                    onClick={startEditingAddress}
                    className="text-xs font-bold text-brand-primary hover:underline bg-transparent border-0"
                  >
                    Edit Address
                  </button>
                  <button
                    onClick={handleDeleteAddress}
                    className="text-xs font-bold text-red-600 hover:underline bg-transparent border-0"
                  >
                    Delete Address
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-background-muted/40 p-4 text-center">
                <p className="text-xs font-bold text-text-soft">No saved addresses found.</p>
                <p className="text-[10px] text-text-soft mt-0.5">Addresses entered during checkout will appear here for 1-click orders.</p>
                <button
                  onClick={startEditingAddress}
                  className="mt-3 text-xs font-bold text-white bg-brand-primary hover:bg-brand-secondary px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  + Add New Address
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
