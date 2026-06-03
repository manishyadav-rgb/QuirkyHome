"use client";

import { load } from "@cashfreepayments/cashfree-js";
import { useEffect, useMemo, useState } from "react";
import { useShop } from "@/components/shop/ShopProvider";
import { 
  Check, MapPin, Truck, Percent, Tag, ShieldCheck, 
  Lock, Info, ArrowRight, Trash2, Sparkles, ChevronRight, X,
  ShoppingBag
} from "lucide-react";

type CouponState = {
  code: string;
  discountAmount: number;
  discountType?: "percent" | "flat";
  discountValue?: number;
  error: string;
  applying: boolean;
  applied: boolean;
};

export default function CheckoutPage() {
  const { cart, subtotal, updateCartQuantity, removeFromCart } = useShop();
  const [loading, setLoading] = useState(false);
  const [placingTestOrder, setPlacingTestOrder] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponState>({ code: "", discountAmount: 0, error: "", applying: false, applied: false });
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalMrp = useMemo(() => cart.reduce((sum, item) => sum + Math.max(item.product.price, item.product.mrp || 0) * item.quantity, 0), [cart]);
  const mrpDiscount = useMemo(() => Math.max(0, totalMrp - subtotal), [totalMrp, subtotal]);
  const savingsPercentage = useMemo(() => {
    if (totalMrp <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((mrpDiscount / totalMrp) * 100)));
  }, [mrpDiscount, totalMrp]);
  const payableTotal = useMemo(() => Math.max(0, subtotal - coupon.discountAmount), [subtotal, coupon.discountAmount]);
  const totalSavings = useMemo(() => mrpDiscount + coupon.discountAmount, [mrpDiscount, coupon.discountAmount]);
  const featuredCoupon = useMemo(() => {
    if (!availableCoupons.length) return null;
    return availableCoupons[0];
  }, [availableCoupons]);

  async function fetchCoupons() {
    try {
      const res = await fetch("/api/coupons/list");
      const data = await res.json();
      if (data.success) setAvailableCoupons(data.coupons || []);
    } catch (err) {
      console.error("Failed to load coupons", err);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Autofill address info if user is authenticated
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data?.authenticated || !data?.user) return;
        const u = data.user;
        setFormData((prev) => ({
          ...prev,
          name: prev.name || u.name || "",
          email: prev.email || u.email || "",
          phone: prev.phone || (u.phone ? String(u.phone).replace(/\D/g, "").slice(-10) : ""),
          address: prev.address || u.shippingAddress || "",
          city: prev.city || u.shippingCity || "",
          state: prev.state || u.shippingState || "",
          pincode: prev.pincode || u.shippingPincode || "",
        }));
        if (u.shippingAddress || u.shippingCity || u.shippingPincode) {
          setAutoFilled(true);
        }
      })
      .catch(() => {});
  }, []);

  // Pincode look-up API integration
  useEffect(() => {
    const pin = formData.pincode.trim();
    if (pin.length === 6 && /^\d+$/.test(pin)) {
      fetch(`https://api.postalpincode.in/pincode/${pin}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0]?.Status === "Success") {
            const postOffice = data[0].PostOffice[0];
            const city = postOffice.District || postOffice.Block || "";
            const state = postOffice.State || "";
            setFormData((prev) => ({
              ...prev,
              city: prev.city || city,
              state: prev.state || state,
            }));
          }
        })
        .catch((err) => {
          console.error("Pincode API error:", err);
        });
    }
  }, [formData.pincode]);

  async function applyCoupon(codeToApply?: string) {
    const targetCode = (codeToApply || couponCode).trim().toUpperCase();
    if (!targetCode) return;
    setCoupon((prev) => ({ ...prev, applying: true, error: "" }));
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: targetCode, subtotal }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCoupon({ code: "", discountAmount: 0, error: data.error || "Invalid coupon code.", applying: false, applied: false });
        return;
      }
      const normalizedCode = String(data.code || targetCode).toUpperCase();
      setCoupon({
        code: normalizedCode,
        discountAmount: Number(data.discountAmount || 0),
        discountType: data.discountType,
        discountValue: Number(data.discountValue || 0),
        error: "",
        applying: false,
        applied: true,
      });
      setCouponCode(normalizedCode);
      if (typeof window !== "undefined") window.localStorage.setItem("qh_coupon_code", normalizedCode);
    } catch {
      setCoupon({ code: "", discountAmount: 0, error: "Could not validate coupon right now.", applying: false, applied: false });
    }
  }

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("qh_coupon_code") : "";
    if (stored && subtotal > 0) {
      setCouponCode(stored);
      applyCoupon(stored);
    }
  }, [subtotal]);

  function clearCoupon() {
    setCouponCode("");
    setCoupon({ code: "", discountAmount: 0, error: "", applying: false, applied: false });
    if (typeof window !== "undefined") window.localStorage.removeItem("qh_coupon_code");
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.phone || subtotal === 0) return;

    setLoading(true);
    try {
      await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingState: formData.state,
          shippingPincode: formData.pincode,
        }),
      });

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.name,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          notes: formData.notes,
          couponCode: coupon.applied ? coupon.code : undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        alert("Payment initialization failed: " + data.error);
        setLoading(false);
        return;
      }

      if (data.payment_session_id) {
        const cashfree = await load({ mode: "sandbox" });
        cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_self" });
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong");
      setLoading(false);
    }
  };

  const handlePlaceTestOrder = async () => {
    if (!formData.phone || subtotal === 0) return;
    setPlacingTestOrder(true);
    try {
      await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          shippingAddress: formData.address,
          shippingCity: formData.city,
          shippingState: formData.state,
          shippingPincode: formData.pincode,
        }),
      });

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          notes: formData.notes,
          couponCode: coupon.applied ? coupon.code : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error || "Unable to place test order.");
        setPlacingTestOrder(false);
        return;
      }
      alert(`Test order placed: ${data.order?.orderNumber || "Order Created"}`);
      window.location.assign("/account/orders");
    } catch (error) {
      console.error("Test order error:", error);
      alert("An error occurred while placing the test order.");
    } finally {
      setPlacingTestOrder(false);
    }
  };

  return (
    <section className="qh-container pb-20 pt-8 font-sans">
      {/* Checkout Progress Stepper */}
      <div className="mx-auto mb-8 max-w-xl px-4">
        <div className="flex items-center justify-between relative">
          {/* Progress Connecting Line */}
          <div className="absolute left-0 right-0 top-[18px] h-[3px] bg-border z-0">
            <div className="h-[3px] bg-[#432F83] transition-all duration-500 w-[50%]" />
          </div>

          {/* Step 1: Cart */}
          <div className="flex flex-col items-center z-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#129C80] text-sm font-bold text-white shadow-[0_0_12px_rgba(18,156,128,0.2)]">
              <Check className="h-4 w-4" />
            </div>
            <span className="mt-2 text-xs font-semibold text-[#129C80]">Shopping Cart</span>
          </div>

          {/* Step 2: Address */}
          <div className="flex flex-col items-center z-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#432F83] text-sm font-bold text-white shadow-[0_0_12px_rgba(67,47,131,0.3)]">
              2
            </div>
            <span className="mt-2 text-xs font-bold text-[#432F83]">Delivery Details</span>
          </div>

          {/* Step 3: Payment */}
          <div className="flex flex-col items-center z-10">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-border bg-white text-sm font-bold text-text-soft">
              3
            </div>
            <span className="mt-2 text-xs font-semibold text-text-soft">Secure Payment</span>
          </div>
        </div>
      </div>

      <div className="checkout-wrap">
        {cart.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center max-w-md mx-auto shadow-sm">
            <ShoppingBag className="h-12 w-12 text-text-soft mx-auto mb-4" />
            <h2 className="text-lg font-bold text-text-main">Your checkout is empty</h2>
            <p className="text-xs text-text-soft mt-1.5 mb-5">Looks like you haven't added anything to your shopping cart yet.</p>
            <a href="/" className="inline-block bg-[#432F83] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all hover:bg-[#5A31DD]">
              Browse Products
            </a>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start max-w-5xl mx-auto">
            {/* Left Column: Cart items & shipping address */}
            <div className="space-y-6">
              
              {/* Cart review list card */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4.5 w-4.5 text-[#432F83]" />
                    <h2 className="text-sm font-black text-[#231F20] uppercase tracking-wider">Review Items ({cartCount})</h2>
                  </div>
                  <span className="text-xs font-bold text-text-soft">Free Shipping Included</span>
                </div>

                <div className="space-y-4 divide-y divide-border/40">
                  {cart.map((item, idx) => {
                    const itemMrp = item.product.mrp || item.product.price;
                    const off = Math.max(0, Math.round(((itemMrp - item.product.price) / itemMrp) * 100));
                    return (
                      <div className={`flex gap-4 ${idx > 0 ? "pt-4" : ""}`} key={item.product.slug}>
                        <img 
                          className="h-20 w-20 rounded-xl border border-border object-cover flex-shrink-0"
                          src={(item.product.gallery && item.product.gallery[0]) || item.product.image} 
                          alt={item.product.title} 
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-text-main line-clamp-1">{item.product.title}</h3>
                            {item.product.size && (
                              <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-wider text-brand-primary bg-brand-primary/5 px-2 py-0.5 rounded">
                                Size: {item.product.size}
                              </span>
                            )}
                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="text-sm font-black text-text-main">INR {item.product.price}</span>
                              {itemMrp > item.product.price && (
                                <>
                                  <span className="text-xs text-text-soft line-through">INR {itemMrp}</span>
                                  <span className="text-[10px] font-black text-[#129C80] bg-[#E8FAF0] px-1.5 py-0.5 rounded-full">{off}% OFF</span>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {/* Quantity Controls & Remove */}
                          <div className="flex items-center justify-between mt-2.5">
                            <div className="flex items-center rounded-lg border border-border overflow-hidden bg-background-muted">
                              <button
                                type="button"
                                className="px-2 py-1 text-brand-primary hover:bg-border/10 font-bold transition-all text-xs"
                                onClick={() => {
                                  const next = item.quantity - 1;
                                  if (next <= 0) removeFromCart(item.product.slug);
                                  else updateCartQuantity(item.product.slug, next);
                                }}
                              >
                                -
                              </button>
                              <span className="px-2 text-xs font-bold text-text-main">{item.quantity}</span>
                              <button
                                type="button"
                                className="px-2 py-1 text-brand-primary hover:bg-border/10 font-bold transition-all text-xs"
                                onClick={() => updateCartQuantity(item.product.slug, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            
                            <button 
                              type="button" 
                              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                              onClick={() => removeFromCart(item.product.slug)}
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address form card */}
              <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4.5 w-4.5 text-[#432F83]" />
                    <h2 className="text-sm font-black text-[#231F20] uppercase tracking-wider">Shipping Details</h2>
                  </div>
                  {autoFilled && (
                    <span className="text-[10px] font-bold text-[#129C80] bg-[#E8FAF0] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      ✓ Profile Auto-filled
                    </span>
                  )}
                </div>

                <form id="checkout-form" onSubmit={handlePayment} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your full name"
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-main placeholder-text-soft/60 outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(67,47,131,0.15)]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">Phone Number *</label>
                      <input
                        type="tel"
                        required
                        pattern="[0-9]{10}"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                        placeholder="10-digit mobile number"
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-main placeholder-text-soft/60 outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(67,47,131,0.15)]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Email for order confirmation"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-main placeholder-text-soft/60 outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(67,47,131,0.15)]"
                    />
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">Detailed Delivery Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Flat/House no, building, street, area details"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-main placeholder-text-soft/60 outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(67,47,131,0.15)]"
                    />
                  </div>

                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">Pincode *</label>
                      <input
                        type="text"
                        required
                        pattern="[0-9]{6}"
                        value={formData.pincode}
                        onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                        placeholder="6-digit pincode"
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-main placeholder-text-soft/60 outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(67,47,131,0.15)]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">City *</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="City"
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-main placeholder-text-soft/60 outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(67,47,131,0.15)]"
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">State *</label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="State"
                        className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-main placeholder-text-soft/60 outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(67,47,131,0.15)]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label className="mb-1 text-xs font-bold uppercase tracking-wider text-text-muted">Delivery Notes (Optional)</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="e.g. Ring the bell, deliver to security, landmark"
                      className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-text-main placeholder-text-soft/60 outline-none transition-all focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(67,47,131,0.15)]"
                    />
                  </div>
                </form>
              </div>

            </div>

            {/* Right Column: Sticky coupons and totals panels */}
            <div className="lg:sticky lg:top-[90px] space-y-6">
              
              {/* Coupons and promo card */}
              <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-4">
                  <Percent className="h-4.5 w-4.5 text-[#432F83]" />
                  <h2 className="text-sm font-black text-[#231F20] uppercase tracking-wider">Coupons & Offers</h2>
                </div>

                <div className="bg-[#F7F5FD]/60 border border-brand-primary/10 rounded-2xl p-4">
                  {coupon.applied ? (
                    <div className="flex items-center justify-between bg-[#E8FAF0] border border-dashed border-[#18A84A] rounded-xl p-3.5 mb-4">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 bg-[#18A84A] text-white p-1 rounded-full">
                          <Check className="h-3 w-3" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-[#129C80] uppercase tracking-wider">{coupon.code} APPLIED</h4>
                          <p className="text-[10px] text-text-muted mt-0.5">Saved: INR {coupon.discountAmount}</p>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={clearCoupon} 
                        className="text-xs font-bold text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null}

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-soft" />
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER PROMO CODE"
                        className="w-full pl-9 pr-3 py-2 text-xs font-bold uppercase tracking-wider border border-border rounded-xl bg-white outline-none focus:border-brand-primary placeholder:text-text-soft/50"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => applyCoupon()}
                      disabled={coupon.applying || !couponCode.trim()}
                      className="bg-[#432F83] text-white hover:bg-[#5A31DD] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {coupon.applying ? "Applying" : "Apply"}
                    </button>
                  </div>

                  {coupon.error && (
                    <p className="mt-2 text-xs font-semibold text-red-500 flex items-center gap-1">
                      <Info className="h-3 w-3 shrink-0" />
                      <span>{coupon.error}</span>
                    </p>
                  )}

                  {featuredCoupon && (
                    <div className="mt-4 border border-dashed border-[#D9D3F4] rounded-xl bg-white p-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="bg-[#F3EDFE] text-[#432F83] font-black text-[10px] px-2 py-0.5 rounded tracking-wide uppercase">
                          {featuredCoupon.code}
                        </span>
                        <button 
                          type="button" 
                          onClick={() => setShowCouponModal(true)} 
                          className="text-xs font-bold text-[#432F83] hover:text-[#5A31DD] flex items-center"
                        >
                          <span>All offers</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="mt-2 text-xs font-black text-text-main">
                        {featuredCoupon.discount_type === "percent"
                          ? `${Number(featuredCoupon.discount_value)}% OFF`
                          : `Flat INR ${Number(featuredCoupon.discount_value)} OFF`}
                      </p>
                      {featuredCoupon.min_order_amount && (
                        <p className="text-[10px] text-text-soft mt-1">
                          Valid on orders above INR {featuredCoupon.min_order_amount}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Order total values card */}
              <div className="bg-white rounded-2xl border border-border shadow-sm p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#432F83]" />
                  <h2 className="text-sm font-black text-[#231F20] uppercase tracking-wider">Order Summary</h2>
                </div>
                
                <div className="divide-y divide-border/60 text-xs">
                  <div className="flex justify-between py-2.5 text-text-muted">
                    <span>Total MRP</span>
                    <span>INR {totalMrp}</span>
                  </div>
                  {mrpDiscount > 0 && (
                    <div className="flex justify-between py-2.5 text-text-muted">
                      <span>Product Discount ({savingsPercentage}%)</span>
                      <span className="text-[#129C80] font-semibold">- INR {mrpDiscount}</span>
                    </div>
                  )}
                  {coupon.applied && (
                    <div className="flex justify-between py-2.5 text-text-muted">
                      <span>Coupon Discount ({coupon.code})</span>
                      <span className="text-[#129C80] font-semibold">- INR {coupon.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2.5 text-text-muted">
                    <span>Shipping Fee</span>
                    <span className="text-[#129C80] font-semibold uppercase">FREE</span>
                  </div>
                  <div className="flex justify-between py-3.5 text-base font-black text-text-main border-t-2 border-dashed border-border">
                    <span>Total Amount</span>
                    <span className="text-brand-primary">INR {payableTotal}</span>
                  </div>
                </div>

                <div className="bg-[#E8FAF0] text-[#129C80] rounded-xl p-3 text-xs font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#129C80]" />
                  <span>Yay! You saved INR {totalSavings} on this order.</span>
                </div>

                <div className="space-y-3 pt-2">
                  <button 
                    type="submit" 
                    form="checkout-form" 
                    disabled={loading}
                    className="w-full bg-[#432F83] text-white hover:bg-[#5A31DD] py-3.5 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(67,47,131,0.2)] text-center text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    <span>{loading ? "Processing..." : `Proceed to Pay INR ${payableTotal}`}</span>
                  </button>

                  <button 
                    type="button" 
                    onClick={handlePlaceTestOrder} 
                    disabled={placingTestOrder || loading}
                    className="w-full border border-border bg-[#F9FAFC] hover:bg-border/30 text-text-main py-3 rounded-xl font-bold transition-all text-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                  >
                    <Truck className="h-4 w-4 text-text-soft" />
                    <span>{placingTestOrder ? "Placing Test Order..." : "Place Test Order (No Payment)"}</span>
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-text-soft uppercase tracking-wider text-center pt-1">
                    <ShieldCheck className="h-4 w-4 text-[#129C80]" />
                    <span>100% Secure & SSL Encrypted Checkout</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Floating bottom action bar on mobile */}
      {cart.length > 0 ? (
        <div className="sm:hidden fixed bottom-[60px] left-0 right-0 bg-white border-t border-border z-40 px-4 py-3 flex items-center justify-between shadow-[0_-4px_16px_rgba(67,47,131,0.08)]">
          <div className="flex flex-col">
            <span className="text-[10px] text-text-soft uppercase tracking-wider font-bold">To Pay</span>
            <span className="text-base font-black text-brand-primary">INR {payableTotal}</span>
          </div>
          <button 
            type="submit" 
            form="checkout-form" 
            disabled={loading} 
            className="bg-[#432F83] text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all hover:bg-[#5A31DD] disabled:opacity-50 flex items-center gap-1.5"
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{loading ? "Processing..." : "Pay Now"}</span>
          </button>
        </div>
      ) : null}

      {/* Available Coupons Modal */}
      {showCouponModal ? (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-border overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text-main text-base">Available Coupons</h3>
                <p className="text-xs text-text-soft">Select a coupon to apply instantly</p>
              </div>
              <button 
                type="button" 
                className="p-1.5 hover:bg-[#F7F5FD] text-text-soft hover:text-text-main rounded-full transition-all"
                onClick={() => setShowCouponModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {availableCoupons.length === 0 ? (
                <div className="text-center py-6 text-text-soft">No active coupons available.</div>
              ) : (
                availableCoupons.map((c) => {
                  const isThisApplied = coupon.applied && coupon.code === c.code;
                  const hasSufficientSubtotal = !c.min_order_amount || subtotal >= Number(c.min_order_amount);
                  return (
                    <button
                      key={c.code}
                      type="button"
                      disabled={!hasSufficientSubtotal}
                      onClick={() => {
                        if (isThisApplied) clearCoupon();
                        else applyCoupon(c.code);
                        setShowCouponModal(false);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${
                        isThisApplied 
                          ? "border-[#18A84A] bg-[#E8FAF0]/30" 
                          : !hasSufficientSubtotal 
                          ? "border-border/60 opacity-50 cursor-not-allowed bg-background-muted/40"
                          : "border-border hover:border-brand-primary bg-white shadow-sm hover:shadow"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="bg-[#F3EDFE] text-[#432F83] font-black text-xs px-2.5 py-1 rounded tracking-wide uppercase border border-brand-primary/10">
                          {c.code}
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isThisApplied ? "text-[#18A84A]" : hasSufficientSubtotal ? "text-brand-primary hover:underline" : "text-text-soft"}`}>
                          {isThisApplied ? "Applied ✓" : hasSufficientSubtotal ? "Apply Code" : "Not eligible"}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-text-main mt-3">
                        {c.discount_type === "percent" ? `${Number(c.discount_value)}% Off` : `Flat INR ${Number(c.discount_value)} Off`}
                      </h4>
                      {c.min_order_amount && (
                        <p className="text-[10px] text-text-soft mt-1 flex items-center gap-1">
                          <Info className="h-3 w-3 shrink-0" />
                          <span>Valid on orders above INR {c.min_order_amount}</span>
                        </p>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
