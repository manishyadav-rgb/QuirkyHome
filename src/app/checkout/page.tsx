"use client";

import { load } from "@cashfreepayments/cashfree-js";
import { useEffect, useMemo, useState } from "react";
import { useShop } from "@/components/shop/ShopProvider";

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
  const { cart, subtotal } = useShop();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponState>({ code: "", discountAmount: 0, error: "", applying: false, applied: false });
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

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

  const totalMrp = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.mrp || item.product.price) * item.quantity, 0);
  }, [cart]);

  const mrpDiscount = useMemo(() => Math.max(0, totalMrp - subtotal), [totalMrp, subtotal]);

  const savingsPercentage = useMemo(() => {
    if (totalMrp === 0) return 0;
    return Math.round((mrpDiscount / totalMrp) * 100);
  }, [mrpDiscount, totalMrp]);

  const shipping = 0;
  const payableTotal = useMemo(() => Math.max(0, subtotal - coupon.discountAmount), [subtotal, coupon.discountAmount]);

  async function fetchCoupons() {
    try {
      const res = await fetch("/api/coupons/list");
      const data = await res.json();
      if (data.success) {
        setAvailableCoupons(data.coupons || []);
      }
    } catch (err) {
      console.error("Failed to load coupons", err);
    }
  }

  useEffect(() => {
    fetchCoupons();
  }, []);

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
        applied: true
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
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <div className="qh-container qh-section-pad mx-auto max-w-4xl py-12">
      <h1 className="mb-6 font-display text-3xl font-bold text-text-main">Checkout</h1>

      {cart.length === 0 ? (
        <p className="text-text-muted">Your cart is empty.</p>
      ) : (
        <div className="grid gap-8 md:grid-cols-[1fr_350px]">
          <div className="qh-card p-6 h-fit">
            <h2 className="mb-4 text-xl font-semibold">Contact Details</h2>
            <form id="checkout-form" onSubmit={handlePayment} className="grid gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-text-soft">Full Name</label>
                <input type="text" required className="qh-focus w-full rounded-md border border-border bg-background-main px-3 py-2 text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-soft">Email</label>
                <input type="email" required className="qh-focus w-full rounded-md border border-border bg-background-main px-3 py-2 text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-soft">Phone Number</label>
                <input type="tel" required pattern="[0-9]{10}" className="qh-focus w-full rounded-md border border-border bg-background-main px-3 py-2 text-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-text-soft">Address</label>
                <input type="text" required className="qh-focus w-full rounded-md border border-border bg-background-main px-3 py-2 text-sm" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <input type="text" required placeholder="City" className="qh-focus w-full rounded-md border border-border bg-background-main px-3 py-2 text-sm" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                <input type="text" required placeholder="State" className="qh-focus w-full rounded-md border border-border bg-background-main px-3 py-2 text-sm" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} />
                <input type="text" required placeholder="Pincode" className="qh-focus w-full rounded-md border border-border bg-background-main px-3 py-2 text-sm" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} />
              </div>
            </form>
          </div>

          <div className="qh-card flex h-fit flex-col p-6">
            <h2 className="mb-4 text-lg font-semibold border-b border-border pb-2">Order Summary</h2>
            <div className="mb-4 flex flex-col gap-3.5 border-b border-border pb-4">
              {cart.map((item) => {
                const itemMrp = item.product.mrp || item.product.price;
                const lineMrpTotal = itemMrp * item.quantity;
                return (
                  <div key={item.product.slug} className="flex justify-between items-start text-sm">
                    <span className="truncate pr-4 text-text-soft">{item.quantity} x {item.product.title}</span>
                    <div className="flex flex-col items-end shrink-0">
                      {itemMrp > item.product.price && (
                        <span className="text-[11px] text-text-soft/60 line-through">INR {lineMrpTotal}</span>
                      )}
                      <span className="font-medium text-text-main">INR {item.lineTotal}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Details Block - Flipkart / Amazon layout */}
            <div className="mb-4 flex flex-col gap-2.5 text-sm border-b border-border pb-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-text-soft mb-1">
                Price Details ({cartCount} {cartCount > 1 ? "Items" : "Item"})
              </h3>
              
              <div className="flex justify-between text-text-soft">
                <span>Total MRP</span>
                <span className="font-medium text-text-main">INR {totalMrp}</span>
              </div>
              
              {mrpDiscount > 0 && (
                <div className="flex items-center justify-between text-green-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>Discount on MRP</span>
                    <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                      {savingsPercentage}% OFF
                    </span>
                  </div>
                  <span className="shrink-0 font-semibold">-INR {mrpDiscount}</span>
                </div>
              )}
              
              <div className="flex justify-between text-text-soft">
                <span>Subtotal (Selling Price)</span>
                <span className="font-medium text-text-main">INR {subtotal}</span>
              </div>

              {coupon.applied && (
                <div className="flex items-center justify-between text-green-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <span>Coupon Discount ({coupon.code})</span>
                    {coupon.discountType === "percent" && coupon.discountValue && (
                      <span className="rounded bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700 uppercase">
                        {coupon.discountValue}% OFF
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 font-semibold">-INR {coupon.discountAmount}</span>
                </div>
              )}
            </div>

            {/* Coupon Code Input & Application */}
            <div className="mb-4 rounded-xl border border-border p-3 bg-background-soft/40">
              <label className="mb-1 block text-xs font-semibold text-text-soft">Have a Coupon?</label>
              <div className="flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon" className="qh-focus h-10 flex-1 rounded-md border border-border bg-background-main px-3 text-sm" />
                <button type="button" onClick={() => applyCoupon()} disabled={coupon.applying} className="rounded-md bg-brand-primary px-3 text-xs font-semibold text-white hover:bg-brand-secondary disabled:opacity-60">{coupon.applying ? "Applying" : "Apply"}</button>
              </div>
              {coupon.error && <p className="mt-2 text-xs text-red-600 font-medium">{coupon.error}</p>}
              {coupon.applied && (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-green-600">✓ Coupon applied successfully!</span>
                  <button type="button" onClick={clearCoupon} className="text-xs font-semibold text-brand-primary hover:underline">Remove</button>
                </div>
              )}

              {/* Clickable Coupons Drawer/List */}
              {availableCoupons.length > 0 && (
                <div className="mt-4 border-t border-border/80 pt-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-text-soft">Available Coupons</p>
                  <div className="grid gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {availableCoupons.map((c) => {
                      const isThisApplied = coupon.applied && coupon.code === c.code;
                      const hasSufficientSubtotal = !c.min_order_amount || subtotal >= Number(c.min_order_amount);
                      
                      return (
                        <button
                          key={c.code}
                          type="button"
                          disabled={!hasSufficientSubtotal}
                          onClick={() => {
                            if (isThisApplied) {
                              clearCoupon();
                            } else {
                              applyCoupon(c.code);
                            }
                          }}
                          className={`flex flex-col items-start rounded-xl border border-dashed p-3 text-left transition-all duration-200 ${
                            isThisApplied
                              ? "border-green-500 bg-green-50/50 hover:bg-green-50"
                              : hasSufficientSubtotal
                                ? "border-brand-primary/40 bg-brand-primary/5 hover:bg-brand-primary/10 hover:border-brand-primary/80"
                                : "border-border bg-background-soft opacity-60 cursor-not-allowed"
                          }`}
                        >
                          <div className="flex w-full items-center justify-between">
                            <span className="inline-flex items-center gap-1 rounded bg-brand-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                              🏷️ {c.code}
                            </span>
                            <span className={`text-[10px] font-bold uppercase ${isThisApplied ? "text-green-600" : hasSufficientSubtotal ? "text-brand-primary" : "text-text-muted"}`}>
                              {isThisApplied ? "Applied ✓" : hasSufficientSubtotal ? "Tap to Apply" : "Locked 🔒"}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs font-bold text-text-main">
                            {c.discount_type === "percent" ? `${Number(c.discount_value)}% Off` : `Flat INR ${Number(c.discount_value)} Off`}
                          </p>
                          {c.min_order_amount && (
                            <p className="mt-0.5 text-[9px] text-text-muted">
                              Min value: INR {c.min_order_amount}
                              {Number(c.max_discount_amount) > 0 && ` • Max discount: INR ${c.max_discount_amount}`}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mb-6 flex justify-between text-lg font-bold">
              <span>Total Payable</span>
              <span className="text-brand-primary">INR {payableTotal}</span>
            </div>
            <button type="submit" form="checkout-form" disabled={loading} className="qh-focus inline-flex h-12 w-full items-center justify-center rounded-full bg-brand-primary font-semibold text-white transition-all hover:bg-brand-secondary hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:opacity-50">
              {loading ? "Processing..." : `Pay INR ${payableTotal}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
