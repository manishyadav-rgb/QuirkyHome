"use client";

import { useEffect, useState } from "react";

type AdminOrder = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_mrp: string | null;
  product_discount: string | null;
  coupon_code: string | null;
  discount_amount: string | null;
  subtotal: string;
  shipping_total: string;
  grand_total: string;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  notes: string | null;
  placed_at: string | null;
  created_at: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setLoading(false);
      });
  }, []);

  async function updateOrderStatus(id: string, action: "accept" | "cancel" | "ship" | "deliver") {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error || "Status update failed");
        setUpdatingId(null);
        return;
      }
      setOrders((prev) => prev.map((order) => (
        order.id === id ? { ...order, status: data.status } : order
      )));
    } catch {
      alert("Status update failed");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold text-[#202223]">Orders</h2>
        <p className="mt-0.5 text-[13px] text-[#6d7175]">Track and manage customer orders with shipping details.</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-[#e1e3e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="p-6 text-[14px] text-[#6d7175]">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-6 text-[14px] text-[#6d7175]">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[13px]">
              <thead className="bg-[#f6f6f7] text-[#6d7175]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Shipping Address</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Discounts</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-[#eceef0] align-top">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#202223]">{order.order_number}</div>
                      <div className="text-[12px] text-[#8c9196]">
                        {new Date(order.created_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-[#202223]">{order.shipping_name || "-"}</div>
                      <div className="text-[12px] text-[#6d7175]">{order.shipping_phone || "-"}</div>
                    </td>
                    <td className="px-4 py-3 text-[#202223]">
                      <div>{order.shipping_address || "-"}</div>
                      <div className="text-[12px] text-[#6d7175]">
                        {[order.shipping_city, order.shipping_state, order.shipping_pincode].filter(Boolean).join(", ") || "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#202223]">INR {Number(order.grand_total || 0)}</td>
                    <td className="px-4 py-3 text-[12px] text-[#202223]">
                      <div>MRP: INR {Number(order.total_mrp || order.subtotal || 0)}</div>
                      <div>Product Off: INR {Number(order.product_discount || 0)}</div>
                      <div>Coupon: {order.coupon_code || "-"}</div>
                      <div>Coupon Off: INR {Number(order.discount_amount || 0)}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${order.payment_status === "paid" ? "bg-[#e3f1df] text-[#006e52]" : "bg-[#fff3cd] text-[#8a6d3b]"}`}>
                        {order.payment_status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-[#f1f2f3] px-2.5 py-1 text-[11px] font-semibold text-[#202223]">
                        {order.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {order.status === "pending" ? (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => updateOrderStatus(order.id, "accept")}
                            className="rounded-md bg-[#008060] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#006e52] disabled:opacity-60"
                          >
                            Accept
                          </button>
                        ) : null}
                        {order.status === "accepted" ? (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => updateOrderStatus(order.id, "ship")}
                            className="rounded-md bg-[#1f6feb] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#1a5fd0] disabled:opacity-60"
                          >
                            Mark Shipped
                          </button>
                        ) : null}
                        {order.status === "shipped" ? (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => updateOrderStatus(order.id, "deliver")}
                            className="rounded-md bg-[#5c6ac4] px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-[#4e5bb0] disabled:opacity-60"
                          >
                            Mark Delivered
                          </button>
                        ) : null}
                        {order.status !== "cancelled" && order.status !== "delivered" ? (
                          <button
                            type="button"
                            disabled={updatingId === order.id}
                            onClick={() => updateOrderStatus(order.id, "cancel")}
                            className="rounded-md border border-[#d72c0d] px-2.5 py-1 text-[11px] font-semibold text-[#d72c0d] hover:bg-[#fff2f0] disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
