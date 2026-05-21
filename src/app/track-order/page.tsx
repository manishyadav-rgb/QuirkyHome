"use client";

import { FormEvent, useState } from "react";
import { Search, Package, MapPin, Truck, Calendar, ChevronRight, Check } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatPrice } from "@/data/products";

type TrackingOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: string;
  shipping_total: string;
  grand_total: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  created_at: string;
  items: {
    product_slug: string;
    product_title: string;
    product_image: string;
    unit_price: string;
    quantity: number;
    line_total: string;
  }[];
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackingOrder | null>(null);
  const [error, setError] = useState("");

  async function handleTrack(e: FormEvent) {
    e.preventDefault();
    if (!orderNumber.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?orderNumber=${orderNumber.trim()}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error ?? "Order not found");
      }
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Failed to find order. Please verify the order number.");
    } finally {
      setLoading(false);
    }
  }

  // Determine active steps for progress tracking
  const steps = [
    { label: "Order Confirmed", key: "confirmed", desc: "Your order has been placed successfully." },
    { label: "Processing", key: "processing", desc: "We are carefully packing your items." },
    { label: "Shipped", key: "shipped", desc: "Handed over to our courier partner." },
    { label: "Delivered", key: "delivered", desc: "Enjoy your QuirkyHome items!" },
  ];

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const statusLower = currentStatus.toLowerCase();
    
    if (statusLower === "delivered") {
      return "completed";
    }
    
    if (statusLower === "shipped") {
      if (stepKey === "delivered") return "upcoming";
      return "completed";
    }

    if (statusLower === "processing" || statusLower === "pending") {
      if (stepKey === "confirmed") return "completed";
      if (stepKey === "processing") return "active";
      return "upcoming";
    }

    // Default fallback
    if (stepKey === "confirmed") return "completed";
    return "upcoming";
  };

  return (
    <section className="qh-container qh-section-pad mx-auto max-w-4xl">
      <SectionHeader 
        eyebrow="Tracking" 
        title="Track Your Order" 
      />

      {/* Tracking Search Input */}
      <div className="mx-auto max-w-xl">
        <form onSubmit={handleTrack} className="flex gap-2 rounded-full border border-border bg-background-elevated p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-brand-primary/20">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="Enter Order Number (e.g., QH2605-A1B2)"
            className="flex-1 rounded-full bg-transparent px-4 py-2 text-sm text-text-main placeholder:text-text-soft focus:outline-none"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="flex h-10 items-center gap-1.5 rounded-full bg-brand-primary px-5 text-sm font-semibold text-text-inverse hover:bg-brand-primary/95 disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Track
          </button>
        </form>
        
        {/* Help Tip */}
        <p className="mt-3 text-center text-xs text-text-soft">
          Find your Order Number in your confirmation SMS, email, or in your{" "}
          <Link href="/account" className="font-semibold text-brand-primary hover:underline">
            Account Dashboard
          </Link>.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50/50 p-4 text-center text-sm font-semibold text-red-600">
            {error}
          </div>
        )}
      </div>

      {/* Tracking Results Card */}
      {order && (
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {/* Left Column: Progress Timeline */}
          <div className="md:col-span-2 rounded-xl border border-border bg-background-main p-5 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-primary">Order status</span>
                <h3 className="text-lg font-bold text-text-main">{order.order_number}</h3>
              </div>
              <div className="rounded-full bg-brand-accent/20 px-3 py-1 text-xs font-bold text-brand-primary uppercase">
                {order.status}
              </div>
            </div>

            {/* Timeline Graphic */}
            <div className="mt-8 flex flex-col gap-6 pl-4">
              {steps.map((step, idx) => {
                const status = getStepStatus(step.key, order.status);
                return (
                  <div key={step.key} className="relative flex gap-4">
                    {/* Line connector */}
                    {idx < steps.length - 1 && (
                      <div className={`absolute bottom-[-24px] left-[13px] top-[26px] w-[2px] ${
                        status === "completed" ? "bg-brand-primary" : "bg-border"
                      }`} />
                    )}
                    
                    {/* Indicator Circle */}
                    <div className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                      status === "completed" 
                        ? "border-brand-primary bg-brand-primary text-text-inverse" 
                        : status === "active"
                          ? "border-brand-primary bg-background-main text-brand-primary ring-4 ring-brand-primary/15"
                          : "border-border bg-background-elevated text-text-soft"
                    }`}>
                      {status === "completed" ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    <div>
                      <h4 className={`text-sm font-bold ${
                        status !== "upcoming" ? "text-text-main" : "text-text-muted"
                      }`}>
                        {step.label}
                      </h4>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order & Delivery Details */}
          <div className="flex flex-col gap-6">
            {/* Delivery address details */}
            <div className="rounded-xl border border-border bg-background-main p-5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-text-main">
                <MapPin className="h-4 w-4 text-brand-primary" />
                <h4 className="text-sm">Delivery Address</h4>
              </div>
              <div className="mt-3 text-xs leading-relaxed text-text-muted">
                <p className="font-bold text-text-main">{order.shipping_name}</p>
                <p className="mt-1">{order.shipping_address}</p>
                <p>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</p>
                <p className="mt-2 font-semibold">📞 {order.shipping_phone}</p>
              </div>
            </div>

            {/* Items details */}
            <div className="rounded-xl border border-border bg-background-main p-5 shadow-sm">
              <div className="flex items-center gap-2 font-bold text-text-main">
                <Package className="h-4 w-4 text-brand-primary" />
                <h4 className="text-sm">Items Ordered</h4>
              </div>
              <div className="mt-3 divide-y divide-border">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    {item.product_image && (
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-background-soft">
                        <img src={item.product_image} alt={item.product_title} className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-text-main">{item.product_title}</p>
                      <p className="mt-0.5 text-[10px] text-text-muted">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-text-main">{formatPrice(parseFloat(item.unit_price))}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Grand Total */}
              <div className="mt-4 border-t border-border pt-3 flex justify-between items-center text-xs font-bold">
                <span className="text-text-muted">Grand Total:</span>
                <span className="text-sm text-brand-primary">{formatPrice(parseFloat(order.grand_total))}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
