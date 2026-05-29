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
  const { cart, subtotal, updateCartQuantity, removeFromCart } = useShop();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponState>({ code: "", discountAmount: 0, error: "", applying: false, applied: false });
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showCouponModal, setShowCouponModal] = useState(false);

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

  return (
    <div className="checkout-page">
      <style jsx>{`
        .checkout-page { background: #f4f3f8; min-height: 100vh; color: #1a1830; }
        .checkout-steps { display: flex; align-items: center; justify-content: center; max-width: 460px; margin: 0 auto; padding: 22px 20px 20px; }
        .step-item { position: relative; display: flex; flex: 1; flex-direction: column; align-items: center; gap: 5px; }
        .step-item::after { content: ""; position: absolute; top: 16px; left: calc(50% + 18px); right: calc(-50% + 18px); height: 2px; background: #e8e6f0; z-index: 0; }
        .step-item:last-child::after { display: none; }
        .step-item.done::after { background: #18a84a; }
        .step-circle { z-index: 1; height: 34px; width: 34px; border-radius: 50%; background: #e8e6f0; color: #7a7890; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
        .step-item.done .step-circle { background: #18a84a; color: #fff; }
        .step-item.active .step-circle { background: #4b2ecc; color: #fff; box-shadow: 0 0 0 4px #eee9ff; }
        .step-label { font-size: 11px; font-weight: 600; color: #7a7890; }
        .step-item.done .step-label { color: #18a84a; }
        .step-item.active .step-label { color: #4b2ecc; }
        .checkout-wrap { max-width: 1020px; margin: 0 auto; padding: 0 14px 88px; display: grid; grid-template-columns: 1fr 332px; gap: 14px; align-items: start; }
        .card { background: #fff; border-radius: 14px; border: 1px solid #e8e6f0; box-shadow: 0 2px 12px rgba(75, 46, 204, 0.06); overflow: hidden; margin-bottom: 12px; }
        .card-head { padding: 12px 14px 11px; border-bottom: 1px solid #e8e6f0; display: flex; align-items: center; gap: 6px; }
        .card-head h2 { font-size: 13px; font-weight: 700; flex: 1; }
        .card-body { padding: 14px; }
        .sidebar { position: sticky; top: 16px; }
        .cart-item { display: flex; gap: 10px; margin-bottom: 12px; }
        .cart-item:last-child { margin-bottom: 0; }
        .item-img { width: 74px; height: 74px; object-fit: cover; border-radius: 10px; border: 1px solid #e8e6f0; flex-shrink: 0; }
        .item-title { font-size: 12px; font-weight: 600; line-height: 1.35; margin-bottom: 6px; }
        .item-pricing { display: flex; align-items: center; flex-wrap: wrap; gap: 7px; }
        .price-now { font-size: 15px; font-weight: 800; }
        .price-mrp { font-size: 11px; color: #7a7890; text-decoration: line-through; }
        .badge-off { background: #e8faf0; color: #18a84a; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 20px; }
        .delivery-row { margin-top: 5px; font-size: 11px; color: #7a7890; }
        .qty-row { margin-top: 8px; display: flex; align-items: center; gap: 8px; }
        .qty-box { display: inline-flex; align-items: center; border: 1px solid #e8e6f0; border-radius: 8px; overflow: hidden; }
        .qty-btn { width: 26px; height: 26px; border: 0; background: #fff; color: #4b2ecc; font-size: 15px; cursor: pointer; }
        .qty-val { width: 30px; text-align: center; font-size: 12px; font-weight: 700; border-left: 1px solid #e8e6f0; border-right: 1px solid #e8e6f0; line-height: 26px; }
        .remove-btn { font-size: 11px; color: #ff6b81; background: transparent; border: 0; cursor: pointer; font-weight: 700; }
        .coupon-applied { display: flex; align-items: center; gap: 10px; background: #e8faf0; border: 1.5px dashed #18a84a; border-radius: 10px; padding: 10px 13px; margin-bottom: 12px; }
        .coupon-info { flex: 1; }
        .coupon-name { font-size: 13px; font-weight: 700; }
        .coupon-exp { font-size: 11px; color: #7a7890; margin-top: 1px; }
        .remove-coupon { font-size: 12px; font-weight: 700; color: #ff6b81; cursor: pointer; background: none; border: none; }
        .muted { color: #7a7890; font-size: 12px; }
        .form-grid { display: grid; gap: 12px; }
        .field label { margin-bottom: 6px; display: block; font-size: 12px; font-weight: 600; color: #7a7890; }
        .field input { width: 100%; border: 1px solid #e8e6f0; border-radius: 10px; background: #fff; padding: 10px 12px; font-size: 14px; color: #1a1830; outline: none; }
        .field input:focus { border-color: #4b2ecc; box-shadow: 0 0 0 3px #eee9ff; }
        .three-cols { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
        .coupon-box { border: 1px solid #e8e6f0; background: #faf9ff; border-radius: 12px; padding: 12px; }
        .coupon-row { display: flex; gap: 8px; }
        .coupon-input { flex: 1; height: 38px; border: 1px solid #e8e6f0; border-radius: 9px; padding: 0 10px; font-size: 13px; }
        .coupon-btn { height: 38px; border: none; border-radius: 9px; padding: 0 14px; background: #4b2ecc; color: #fff; font-weight: 700; cursor: pointer; }
        .coupon-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .avail-coupons { margin-top: 10px; display: grid; gap: 8px; max-height: 170px; overflow: auto; }
        .avail-coupon { border: 1px dashed #d9d3f4; border-radius: 10px; padding: 9px; text-align: left; background: #fff; cursor: pointer; }
        .avail-coupon.applied { border-color: #18a84a; background: #f1fff7; }
        .coupon-teaser { border: 1px dashed #d9d3f4; border-radius: 10px; background: #fff; padding: 10px; margin-top: 10px; }
        .coupon-teaser-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .view-all-offers { border: 0; background: transparent; color: #4b2ecc; font-weight: 700; font-size: 12px; cursor: pointer; }
        .coupon-modal-overlay { position: fixed; inset: 0; background: rgba(18, 16, 40, 0.45); z-index: 130; display: flex; align-items: center; justify-content: center; padding: 16px; }
        .coupon-modal { width: min(560px, 100%); max-height: 86vh; overflow: hidden; background: #fff; border-radius: 14px; border: 1px solid #e8e6f0; box-shadow: 0 14px 36px rgba(30, 24, 90, 0.25); display: flex; flex-direction: column; }
        .coupon-modal-head { padding: 14px 16px; border-bottom: 1px solid #eceaf6; display: flex; align-items: center; justify-content: space-between; }
        .coupon-modal-list { padding: 12px; overflow: auto; display: grid; gap: 9px; }
        .coupon-modal-close { border: 0; background: transparent; font-size: 20px; line-height: 1; color: #7a7890; cursor: pointer; }
        .price-rows .row { display: flex; justify-content: space-between; align-items: center; padding: 9px 14px; border-bottom: 1px solid #e8e6f0; font-size: 12px; }
        .price-rows .row.total { font-size: 15px; font-weight: 800; }
        .green { color: #18a84a; font-weight: 700; }
        .savings-pill { margin: 0 14px 12px; background: #e8faf0; border-radius: 8px; padding: 8px 10px; font-size: 11px; color: #18a84a; font-weight: 700; }
        .cta-wrap { padding: 0 14px 14px; }
        .checkout-btn { width: 100%; border: none; padding: 12px; border-radius: 10px; color: #fff; font-size: 14px; font-weight: 700; background: linear-gradient(115deg, #4b2ecc 0%, #7b52ff 100%); box-shadow: 0 8px 20px rgba(75, 46, 204, 0.28); cursor: pointer; }
        .checkout-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .secure-txt { text-align: center; margin-top: 10px; font-size: 11px; color: #7a7890; }
        .mob-bar { display: none; }
        @media (max-width: 640px) {
          .checkout-wrap { grid-template-columns: 1fr; gap: 0; padding: 0 10px 170px; }
          .sidebar { position: static; }
          .item-img { width: 68px; height: 68px; }
          .price-now { font-size: 14px; }
          .three-cols { grid-template-columns: 1fr; }
          .cta-wrap, .secure-txt { display: none; }
          .mob-bar { display: flex; position: fixed; left: 10px; right: 10px; bottom: calc(68px + env(safe-area-inset-bottom, 0px)); background: #fff; border: 1px solid #e8e6f0; border-radius: 12px; z-index: 110; padding: 10px 12px; align-items: center; justify-content: space-between; box-shadow: 0 -2px 18px rgba(75, 46, 204, 0.12); }
          .mob-total small { display: block; font-size: 11px; color: #7a7890; }
          .mob-total strong { font-size: 15px; font-weight: 800; }
          .mob-cta { border: none; border-radius: 9px; background: linear-gradient(115deg, #4b2ecc 0%, #7b52ff 100%); color: #fff; font-size: 12px; font-weight: 700; padding: 10px 14px; }
        }
      `}</style>

      <div className="checkout-steps">
        <div className="step-item done"><div className="step-circle">1</div><div className="step-label">Cart</div></div>
        <div className="step-item active"><div className="step-circle">2</div><div className="step-label">Review</div></div>
        <div className="step-item"><div className="step-circle">3</div><div className="step-label">Payment</div></div>
      </div>

      <div className="checkout-wrap">
        {cart.length === 0 ? (
          <div className="card card-body">Your cart is empty.</div>
        ) : (
          <>
            <div className="left-col">
              <div className="card">
                <div className="card-head"><span>Cart</span><h2>Your Cart</h2><span className="muted">{cartCount} Item{cartCount > 1 ? "s" : ""}</span></div>
                <div className="card-body">
                  {cart.map((item) => {
                    const itemMrp = item.product.mrp || item.product.price;
                    const off = Math.max(0, Math.round(((itemMrp - item.product.price) / itemMrp) * 100));
                    return (
                      <div className="cart-item" key={item.product.slug}>
                        <img className="item-img" src={(item.product.gallery && item.product.gallery[0]) || item.product.image} alt={item.product.title} />
                        <div>
                          <div className="item-title">{item.product.title}</div>
                          <div className="item-pricing">
                            <span className="price-now">INR {item.product.price}</span>
                            {itemMrp > item.product.price ? <span className="price-mrp">INR {itemMrp}</span> : null}
                            {off > 0 ? <span className="badge-off">{off}% OFF</span> : null}
                          </div>
                          <div className="delivery-row">Free Delivery</div>
                          <div className="qty-row">
                            <div className="qty-box">
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => {
                                  const next = item.quantity - 1;
                                  if (next <= 0) removeFromCart(item.product.slug);
                                  else updateCartQuantity(item.product.slug, next);
                                }}
                              >
                                -
                              </button>
                              <span className="qty-val">{item.quantity}</span>
                              <button
                                type="button"
                                className="qty-btn"
                                onClick={() => updateCartQuantity(item.product.slug, item.quantity + 1)}
                              >
                                +
                              </button>
                            </div>
                            <button type="button" className="remove-btn" onClick={() => removeFromCart(item.product.slug)}>Remove</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="card">
                <div className="card-head"><span>Step 1</span><h2>Shipping Address</h2></div>
                <div className="card-body">
                  <form id="checkout-form" onSubmit={handlePayment} className="form-grid">
                    <div className="field"><label>Full Name</label><input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
                    <div className="field"><label>Email</label><input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
                    <div className="field"><label>Phone Number</label><input type="tel" required pattern="[0-9]{10}" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} /></div>
                    <div className="field"><label>Address</label><input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} /></div>
                    <div className="three-cols">
                      <div className="field"><input type="text" required placeholder="City" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} /></div>
                      <div className="field"><input type="text" required placeholder="State" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} /></div>
                      <div className="field"><input type="text" required placeholder="Pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} /></div>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="sidebar">
              <div className="card">
                <div className="card-head"><span>Offer</span><h2>Coupons & Offers</h2></div>
                <div className="card-body">
                  {coupon.applied ? (
                    <div className="coupon-applied">
                      <span>Code</span>
                      <div className="coupon-info">
                        <div className="coupon-name">{coupon.code} OFFER APPLIED</div>
                        <div className="coupon-exp">Discount saved: INR {coupon.discountAmount}</div>
                      </div>
                      <button type="button" onClick={clearCoupon} className="remove-coupon">Remove</button>
                    </div>
                  ) : null}
                  <div className="coupon-box">
                    <div className="coupon-row">
                      <input className="coupon-input" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Enter coupon code" />
                      <button type="button" onClick={() => applyCoupon()} disabled={coupon.applying} className="coupon-btn">{coupon.applying ? "Applying" : "Apply"}</button>
                    </div>
                    {coupon.error ? <p style={{ marginTop: 8, color: "#d32f2f", fontSize: 12 }}>{coupon.error}</p> : null}
                    {featuredCoupon ? (
                      <div className="coupon-teaser">
                        <div className="coupon-teaser-head">
                          <div style={{ fontSize: 12, fontWeight: 800, color: "#4b2ecc" }}>{featuredCoupon.code}</div>
                          <button type="button" className="view-all-offers" onClick={() => setShowCouponModal(true)}>
                            View all offers
                          </button>
                        </div>
                        <div style={{ marginTop: 3, fontSize: 12, fontWeight: 700 }}>
                          {featuredCoupon.discount_type === "percent"
                            ? `${Number(featuredCoupon.discount_value)}% OFF`
                            : `Flat INR ${Number(featuredCoupon.discount_value)} OFF`}
                        </div>
                        {featuredCoupon.min_order_amount ? (
                          <div style={{ marginTop: 2, fontSize: 10, color: "#7a7890" }}>
                            Min order INR {featuredCoupon.min_order_amount}
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-head"><h2>Order Summary</h2><span className="muted">{cartCount} Item{cartCount > 1 ? "s" : ""}</span></div>
                <div className="price-rows">
                  <div className="row"><span className="muted">Total MRP</span><span>INR {totalMrp}</span></div>
                  {mrpDiscount > 0 ? <div className="row"><span className="muted">Product Discount ({savingsPercentage}%)</span><span className="green">- INR {mrpDiscount}</span></div> : null}
                  {coupon.applied ? <div className="row"><span className="muted">Coupon ({coupon.code})</span><span className="green">- INR {coupon.discountAmount}</span></div> : null}
                  <div className="row"><span className="muted">Shipping Fee</span><span className="green">FREE</span></div>
                  <div className="row total"><span>To Pay</span><span>INR {payableTotal}</span></div>
                </div>
                <div className="savings-pill">Yay! You saved INR {totalSavings} on this order.</div>
                <div className="cta-wrap">
                  <button type="submit" form="checkout-form" disabled={loading} className="checkout-btn">{loading ? "Processing..." : `Proceed to Pay INR ${payableTotal}`}</button>
                  <div className="secure-txt">100% Secure and SSL Encrypted</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {cart.length > 0 ? (
        <div className="mob-bar">
          <div className="mob-total"><small>To Pay</small><strong>INR {payableTotal}</strong></div>
          <button type="submit" form="checkout-form" disabled={loading} className="mob-cta">{loading ? "Processing..." : "Checkout ->"}</button>
        </div>
      ) : null}

      {showCouponModal ? (
        <div className="coupon-modal-overlay" onClick={() => setShowCouponModal(false)}>
          <div className="coupon-modal" onClick={(e) => e.stopPropagation()}>
            <div className="coupon-modal-head">
              <div>
                <div style={{ fontSize: 15, fontWeight: 800 }}>Available Offers</div>
                <div style={{ fontSize: 12, color: "#7a7890" }}>Tap any coupon to apply instantly</div>
              </div>
              <button type="button" className="coupon-modal-close" onClick={() => setShowCouponModal(false)}>×</button>
            </div>
            <div className="coupon-modal-list">
              {availableCoupons.length === 0 ? (
                <div className="muted">No active offers right now.</div>
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
                      className={`avail-coupon ${isThisApplied ? "applied" : ""}`}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: "#4b2ecc" }}>{c.code}</div>
                        <div style={{ fontSize: 11, color: isThisApplied ? "#18a84a" : "#7a7890", fontWeight: 700 }}>
                          {isThisApplied ? "Applied" : hasSufficientSubtotal ? "Apply" : "Not eligible"}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, fontWeight: 700, marginTop: 3 }}>
                        {c.discount_type === "percent" ? `${Number(c.discount_value)}% Off` : `Flat INR ${Number(c.discount_value)} Off`}
                      </div>
                      {c.min_order_amount ? <div style={{ fontSize: 10, color: "#7a7890", marginTop: 2 }}>Min order INR {c.min_order_amount}</div> : null}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
