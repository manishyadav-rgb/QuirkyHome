"use client";

import { useEffect, useState } from "react";
import { Package, ChevronRight, ChevronDown, Download, Star, FileText, Check, RotateCcw, Truck, Heart, Ticket, Headset, UserRound, LogOut, Calendar } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useShop } from "@/components/shop/ShopProvider";

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
type Order = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: string;
  shipping_name?: string | null;
  shipping_phone?: string | null;
  shipping_address?: string | null;
  shipping_city?: string | null;
  shipping_state?: string | null;
  shipping_pincode?: string | null;
  created_at: string;
  items: Array<{ product_slug: string; product_title: string; quantity: number }>;
};

export default function OrdersPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const { wishlistCount } = useShop();

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        const data = await r.json();
        if (data.authenticated) setUser(data.user);
        if (data.authenticated) {
          const o = await fetch("/api/orders", { cache: "no-store" });
          const od = await o.json();
          setOrders(od.orders || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/account";
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-brand-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 font-sans">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background-soft text-brand-primary mb-4 shadow-sm">
          <Package className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-extrabold text-text-main">Please log in to view your orders</h1>
        <p className="mt-1 text-sm text-text-muted">You need to sign in to access your order history and tracking.</p>
        <Link href="/account" className="mt-6 rounded-xl bg-[#432F83] hover:bg-[#5A31DD] text-white px-6 py-2.5 text-xs font-bold transition-all shadow-md">
          Login Account
        </Link>
      </div>
    );
  }

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
            {/* Direct Link 1: My Orders (Active State) */}
            <div className="py-3 bg-background-soft/30">
              <Link href="/account/orders" className="flex items-center gap-3 px-5 py-1 text-sm font-bold text-brand-primary transition-all duration-200">
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

        {/* Right Column (Orders listing Panel) */}
        <div className="order-1 md:order-2 md:col-span-8 lg:col-span-9 space-y-6">
          <SectionHeader title="My Orders" description="Track shipment updates, review purchases, and download invoice copies." />

          <div className="space-y-4">
            {orders.length === 0 ? (
              /* Enhanced Empty Order List State */
              <div className="rounded-2xl border border-border bg-white p-8 text-center shadow-soft">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background-soft text-brand-primary mb-4 shadow-sm">
                  <Package className="h-8 w-8" />
                </div>
                <h2 className="font-display text-xl font-black text-text-main">No orders found yet</h2>
                <p className="mt-2 text-sm text-text-muted max-w-sm mx-auto">
                  Looks like you haven't placed an order. Start decorating your room with our hot new selections.
                </p>
                <Link href="/" className="mt-6 inline-flex rounded-xl bg-[#432F83] hover:bg-[#5A31DD] text-white px-6 py-2.5 text-xs font-bold tracking-wide transition-all shadow-md">
                  Browse Catalog
                </Link>
              </div>
            ) : (
              orders.map((ord) => {
                const createdDate = new Date(ord.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                });

                const isDelivered = String(ord.status || "").toLowerCase() === "delivered";
                const isShipped = String(ord.status || "").toLowerCase() === "shipped";
                const isAccepted = String(ord.status || "").toLowerCase() === "accepted";

                const isExpanded = expandedOrderId === ord.id;

                const getStatusTimeline = (status: string) => {
                  const s = status.toLowerCase();
                  if (s === "delivered") return { step: 4, label: "Delivered" };
                  if (s === "shipped") return { step: 3, label: "Shipped" };
                  if (s === "accepted") return { step: 2, label: "Packed" };
                  return { step: 1, label: "Placed" };
                };

                const currentStatus = getStatusTimeline(ord.status);
                const estDeliveryDate = new Date(new Date(ord.created_at).getTime() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                });

                return (
                  <div key={ord.id} className="rounded-2xl border border-border bg-white p-4 sm:p-5 shadow-sm hover:border-brand-primary/10 transition-colors duration-base space-y-4 overflow-hidden">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                      <div className="min-w-0 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="max-w-full bg-brand-primary/10 text-brand-primary text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-lg inline-flex items-center gap-1.5 shadow-tiny break-all">
                          <Package className="h-3.5 w-3.5" /> Order #{ord.order_number}
                        </span>
                        <span className="text-xs text-text-muted flex items-center gap-1 font-semibold">
                          <Calendar className="h-3.5 w-3.5 text-text-soft" /> Placed on {createdDate}
                        </span>
                      </div>
                      
                      {/* Badge status */}
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border shadow-tiny ${
                          isAccepted
                            ? "bg-[#E8F8F5] border-emerald-100 text-[#129C80]"
                            : isShipped
                              ? "bg-[#EBF5FB] border-blue-100 text-[#2980B9]"
                              : isDelivered
                                ? "bg-[#F5EEF8] border-purple-100 text-[#8E44AD]"
                                : "bg-[#FEF9E7] border-yellow-100 text-[#D4AC0D]"
                        }`}
                      >
                        {ord.status || "pending"}
                      </span>
                    </div>

                    {/* Order details & pricing */}
                    <div className="grid gap-4 md:grid-cols-[1fr,max-content] items-start">
                      {/* Products List */}
                      <div className="space-y-3">
                        {ord.items?.map((item, idx) => (
                          <div key={`${ord.id}-${idx}`} className="flex flex-col gap-2 rounded-xl border border-border/50 bg-background-muted/20 p-3 sm:flex-row sm:items-start sm:bg-transparent sm:p-0 sm:border-0">
                            {/* Visual dummy box container icon */}
                            <div className="flex min-w-0 gap-3 sm:flex-1">
                              <div className="h-10 w-10 shrink-0 rounded-lg bg-background-soft/60 border border-border/60 flex items-center justify-center text-brand-primary">
                                <Package className="h-5 w-5 stroke-[1.5]" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-text-main leading-snug break-words">
                                  {item.product_title}
                                </p>
                                <p className="text-[10px] text-text-soft font-semibold mt-0.5">
                                  Quantity: {item.quantity}
                                </p>
                              </div>
                            </div>
                            
                            {item.product_slug && (
                              <Link
                                href={`/account/reviews?product=${encodeURIComponent(item.product_slug)}&title=${encodeURIComponent(item.product_title)}`}
                                className="inline-flex w-full shrink-0 items-center justify-center gap-1 rounded-lg border border-border bg-white px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider text-text-muted shadow-tiny transition-colors hover:border-brand-primary hover:bg-background-soft/35 hover:text-brand-primary sm:w-auto sm:py-1"
                              >
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" /> Write review
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Right summary info */}
                      <div className="text-left md:text-right border-t md:border-t-0 md:border-l border-border/60 pt-3.5 md:pt-0 md:pl-5 shrink-0 min-w-[150px] space-y-1.5">
                        <div className="text-[10px] font-bold text-text-soft uppercase tracking-wide">
                          Payment: <span className="text-text-main font-black">{ord.payment_status || "pending"}</span>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-text-soft uppercase tracking-wide">Total Amount Paid</p>
                          <p className="text-sm font-extrabold text-[#432F83] mt-0.5">
                            INR {Number(ord.grand_total || 0).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action invoice row */}
                    <div className="border-t border-border/50 pt-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {["accepted", "shipped", "delivered"].includes(String(ord.status || "").toLowerCase()) && (
                          <a
                            href={`/invoice/${ord.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-text-main hover:border-brand-primary hover:text-brand-primary hover:bg-background-soft/30 transition-colors shadow-tiny"
                          >
                            <Download className="h-3.5 w-3.5" /> Download Invoice (PDF)
                          </a>
                        )}
                        <button
                          onClick={() => setExpandedOrderId(expandedOrderId === ord.id ? null : ord.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-primary/20 bg-brand-primary/5 px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-primary hover:bg-brand-primary/10 transition-colors shadow-tiny"
                        >
                          <Truck className="h-3.5 w-3.5" /> {isExpanded ? "Hide Tracking" : "Track Order"}
                        </button>
                      </div>

                      {["accepted", "shipped", "delivered"].includes(String(ord.status || "").toLowerCase()) ? (
                        <span className="text-[10px] font-bold text-[#129C80] bg-[#E8F8F5] px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="h-3.5 w-3.5 text-[#129C80]" /> Invoice Ready
                        </span>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-soft">
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                          <span>Invoice will generate once shipment is accepted by admin.</span>
                        </div>
                      )}
                    </div>

                    {/* Collapsible Order Tracking Stepper */}
                    {isExpanded && (
                      <div className="border-t border-border/60 pt-4 mt-4 space-y-6">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-text-soft flex items-center gap-1.5">
                            <Truck className="h-4 w-4 text-brand-primary" /> Delivery Status Tracking
                          </h4>
                          <span className="text-xs font-semibold text-text-muted">
                            {ord.status?.toLowerCase() === "cancelled" ? (
                              <span className="text-red-600 font-bold">Order Cancelled</span>
                            ) : ord.status?.toLowerCase() === "delivered" ? (
                              <span className="text-green-600 font-bold">Delivered</span>
                            ) : (
                              <span>Estimated Delivery: {estDeliveryDate}</span>
                            )}
                          </span>
                        </div>

                        {ord.status?.toLowerCase() === "cancelled" ? (
                          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 font-bold">
                              ✕
                            </div>
                            <div>
                              <p className="text-xs font-bold text-red-700">This order has been cancelled.</p>
                              <p className="text-[10px] text-red-500">Please contact support if you have any queries.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="relative py-4">
                            {/* Desktop Horizontal Stepper */}
                            <div className="hidden md:flex items-center justify-between relative">
                              <div className="absolute left-6 right-6 top-4 h-0.5 bg-border -z-10" />
                              <div
                                className="absolute left-6 top-4 h-0.5 bg-brand-primary transition-all duration-500 -z-10"
                                style={{ width: `${((currentStatus.step - 1) / 3) * 100}%` }}
                              />

                              {[
                                { label: "Order Placed", desc: `Placed on ${createdDate}` },
                                { label: "Packed", desc: currentStatus.step >= 2 ? "Ready for dispatch" : "Pending processing" },
                                { label: "Shipped", desc: currentStatus.step >= 3 ? "In transit" : "Pending dispatch" },
                                { label: "Delivered", desc: currentStatus.step >= 4 ? "Delivered successfully" : "Pending delivery" },
                              ].map((step, idx) => {
                                const isDone = idx + 1 <= currentStatus.step;

                                return (
                                  <div key={idx} className="flex flex-col items-center text-center w-32 shrink-0">
                                    <div
                                      className={`h-8 w-8 rounded-full flex items-center justify-center border-2 font-bold text-xs transition-all duration-300 ${
                                        isDone
                                          ? "bg-brand-primary border-brand-primary text-white shadow-md shadow-brand-primary/20"
                                          : "bg-white border-border text-text-soft"
                                      }`}
                                    >
                                      {isDone ? "✓" : idx + 1}
                                    </div>
                                    <span className={`text-[11px] font-bold mt-2 ${isDone ? "text-brand-primary" : "text-text-muted"}`}>
                                      {step.label}
                                    </span>
                                    <span className="text-[9px] text-text-soft mt-0.5 leading-snug">
                                      {step.desc}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Mobile Vertical Stepper */}
                            <div className="flex flex-col gap-4 md:hidden pl-4 relative">
                              <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-border -z-10" />
                              <div
                                className="absolute left-7 top-4 w-0.5 bg-brand-primary transition-all duration-500 -z-10"
                                style={{ height: `${((currentStatus.step - 1) / 3) * 100}%` }}
                              />

                              {[
                                { label: "Order Placed", desc: `Placed on ${createdDate}` },
                                { label: "Packed", desc: currentStatus.step >= 2 ? "Ready for dispatch" : "Pending processing" },
                                { label: "Shipped", desc: currentStatus.step >= 3 ? "In transit" : "Pending dispatch" },
                                { label: "Delivered", desc: currentStatus.step >= 4 ? "Delivered successfully" : "Pending delivery" },
                              ].map((step, idx) => {
                                const isDone = idx + 1 <= currentStatus.step;

                                return (
                                  <div key={idx} className="flex items-start gap-4">
                                    <div
                                      className={`h-6 w-6 rounded-full flex items-center justify-center border-2 font-bold text-[10px] shrink-0 transition-all duration-300 ${
                                        isDone
                                          ? "bg-brand-primary border-brand-primary text-white shadow-sm"
                                          : "bg-white border-border text-text-soft"
                                      }`}
                                    >
                                      {isDone ? "✓" : idx + 1}
                                    </div>
                                    <div className="flex flex-col">
                                      <span className={`text-xs font-bold ${isDone ? "text-brand-primary" : "text-text-muted"}`}>
                                        {step.label}
                                      </span>
                                      <span className="text-[10px] text-text-soft leading-snug">
                                        {step.desc}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Shipping Address details inside tracking expanded panel */}
                        <div className="bg-background-soft border border-border/80 rounded-xl p-4 grid gap-4 md:grid-cols-2">
                          <div>
                            <h5 className="text-[10px] font-bold text-text-soft uppercase tracking-wider mb-2">Delivery Address</h5>
                            <p className="text-xs font-bold text-text-main">{ord.shipping_name || user.name}</p>
                            <p className="text-xs text-text-muted mt-1 leading-relaxed">
                              {ord.shipping_address || "No shipping address entered."}
                              {ord.shipping_city ? `, ${ord.shipping_city}` : ""}
                              {ord.shipping_state ? `, ${ord.shipping_state}` : ""}
                              {ord.shipping_pincode ? ` - ${ord.shipping_pincode}` : ""}
                            </p>
                            {(ord.shipping_phone || user.phone) && (
                              <p className="text-xs text-text-muted mt-1 font-semibold flex items-center gap-1">
                                📞 Phone: {ord.shipping_phone || user.phone}
                              </p>
                            )}
                          </div>
                          <div className="border-t md:border-t-0 md:border-l border-border/60 pt-3 md:pt-0 md:pl-4">
                            <h5 className="text-[10px] font-bold text-text-soft uppercase tracking-wider mb-2">Order Options</h5>
                            <div className="flex flex-col gap-2">
                              <Link href="/account/help" className="inline-flex items-center justify-center gap-1.5 border border-border bg-white rounded-lg px-3 py-1.5 text-xs font-bold text-text-main hover:bg-background-soft transition-colors w-full sm:w-auto">
                                <Headset className="h-4 w-4" /> Need Help with Order?
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
