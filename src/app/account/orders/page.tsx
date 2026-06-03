"use client";

import { useEffect, useState } from "react";
import { Package, ChevronRight, Download, Star, FileText, Check, RotateCcw, Truck, Heart, Ticket, Headset, UserRound, LogOut, Calendar } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useShop } from "@/components/shop/ShopProvider";

type UserInfo = { id: string; phone: string; name: string | null; email: string | null; role: string };
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
        <div className="md:col-span-4 lg:col-span-3 space-y-4">
          
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
        <div className="md:col-span-8 lg:col-span-9 space-y-6">
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

                return (
                  <div key={ord.id} className="rounded-2xl border border-border bg-white p-5 shadow-sm hover:border-brand-primary/10 transition-colors duration-base space-y-4">
                    {/* Header info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="bg-brand-primary/10 text-brand-primary text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 shadow-tiny">
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
                          <div key={`${ord.id}-${idx}`} className="flex items-start gap-3">
                            {/* Visual dummy box container icon */}
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-background-soft/60 border border-border/60 flex items-center justify-center text-brand-primary">
                              <Package className="h-5 w-5 stroke-[1.5]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-text-main leading-tight truncate">
                                {item.product_title}
                              </p>
                              <p className="text-[10px] text-text-soft font-semibold mt-0.5">
                                Quantity: {item.quantity}
                              </p>
                            </div>
                            
                            {item.product_slug && (
                              <Link
                                href={`/account/reviews?product=${encodeURIComponent(item.product_slug)}&title=${encodeURIComponent(item.product_title)}`}
                                className="rounded-lg border border-border bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-wider text-text-muted hover:border-brand-primary hover:text-brand-primary hover:bg-background-soft/35 transition-colors shrink-0 flex items-center gap-1 shadow-tiny"
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
                      {["accepted", "shipped", "delivered"].includes(String(ord.status || "").toLowerCase()) ? (
                        <>
                          <a
                            href={`/invoice/${ord.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-white px-3.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-text-main hover:border-brand-primary hover:text-brand-primary hover:bg-background-soft/30 transition-colors shadow-tiny"
                          >
                            <Download className="h-3.5 w-3.5" /> Download Invoice (PDF)
                          </a>
                          <span className="text-[10px] font-bold text-[#129C80] bg-[#E8F8F5] px-2 py-0.5 rounded flex items-center gap-1">
                            <Check className="h-3.5 w-3.5 text-[#129C80]" /> Invoice Ready
                          </span>
                        </>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-soft">
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
                          <span>Invoice will generate once shipment is accepted by admin.</span>
                        </div>
                      )}
                    </div>

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
