"use client";

import { useEffect, useState } from "react";
import { Package, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

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
  items: Array<{ product_title: string; quantity: number }>;
};

export default function OrdersPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-xl font-semibold">Please log in to view your orders</h1>
        <Link href="/account" className="mt-4 rounded-full bg-brand-primary px-6 py-2 text-white">Login</Link>
      </div>
    );
  }

  return (
    <div className="qh-container mx-auto max-w-4xl py-8 md:py-12">
      <Link href="/account" className="mb-6 flex items-center text-sm font-semibold text-text-muted hover:text-brand-primary">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Account
      </Link>

      <SectionHeader title="My Orders" description="View and track all your past and current orders." />

      <div className="mt-8 flex flex-col gap-4">
        {orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-background-main p-8 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background-soft">
              <Package className="h-8 w-8 text-text-muted" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-text-main">No orders found</h2>
            <p className="mt-2 text-sm text-text-muted">Looks like you haven't placed an order yet.</p>
            <Link href="/" className="mt-6 inline-block rounded-full bg-brand-primary px-8 py-3 text-sm font-semibold text-white">
              Start Shopping
            </Link>
          </div>
        ) : (
          orders.map((ord) => (
            <div key={ord.id} className="rounded-xl border border-border bg-background-main p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-text-main">#{ord.order_number}</p>
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${
                    String(ord.status || "").toLowerCase() === "accepted"
                      ? "bg-[#e3f1df] text-[#006e52]"
                      : String(ord.status || "").toLowerCase() === "shipped"
                        ? "bg-[#e7f0ff] text-[#1f6feb]"
                        : String(ord.status || "").toLowerCase() === "delivered"
                          ? "bg-[#efeaff] text-[#5c6ac4]"
                          : "bg-[#fff3cd] text-[#8a6d3b]"
                  }`}
                >
                  {ord.status || "pending"}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
                Payment: {ord.payment_status || "pending"}
              </p>
              <p className="mt-1 text-xs text-text-muted">{new Date(ord.created_at).toLocaleString("en-IN")}</p>
              <p className="mt-2 text-sm font-semibold text-text-main">Total: INR {Number(ord.grand_total || 0).toLocaleString("en-IN")}</p>
              <div className="mt-3 space-y-1">
                {ord.items?.map((item, idx) => (
                  <p key={`${ord.id}-${idx}`} className="text-xs text-text-muted">{item.product_title} x {item.quantity}</p>
                ))}
              </div>
              {["accepted", "shipped", "delivered"].includes(String(ord.status || "").toLowerCase()) ? (
                <div className="mt-4">
                  <a
                    href={`/invoice/${ord.id}`}
                    className="inline-flex rounded-full border border-border px-4 py-2 text-xs font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary"
                  >
                    Download Invoice
                  </a>
                </div>
              ) : (
                <p className="mt-4 text-[11px] font-semibold text-text-muted">
                  Invoice will be available once admin accepts your order.
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
