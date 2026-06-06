"use client";

import { useEffect, useState } from "react";
import { Boxes, Heart, Package, ShoppingBag, Users, ArrowUpRight, TrendingUp } from "lucide-react";

type Stats = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalCarts: number;
  totalWishlists: number;
};

const iconMap: Record<string, React.ElementType> = {
  Products: Package,
  Users: Users,
  Orders: ShoppingBag,
  Carts: Boxes,
  Wishlists: Heart,
};

const colorMap: Record<string, string> = {
  Products: "#008060",
  Users: "#5c6ac4",
  Orders: "#b98900",
  Carts: "#00848e",
  Wishlists: "#d72c0d",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((response) => response.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => { setStats(null); setLoading(false); });
  }, []);

  const cards = [
    { label: "Products", value: stats?.totalProducts ?? 0 },
    { label: "Users", value: stats?.totalUsers ?? 0 },
    { label: "Orders", value: stats?.totalOrders ?? 0 },
    { label: "Carts", value: stats?.totalCarts ?? 0 },
    { label: "Wishlists", value: stats?.totalWishlists ?? 0 },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="grid gap-6">
      {/* Welcome Card */}
      <section className="rounded-lg border border-[#e1e3e5] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#202223]">{greeting} 👋</h2>
            <p className="mt-1 text-[14px] text-[#6d7175]">
              Here&apos;s what&apos;s happening with your store today.
            </p>
          </div>
          <div className="flex gap-2">
            <a
              href="/qh-admin/add-product"
              className="inline-flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006e52]"
            >
              Add product
            </a>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => {
          const Icon = iconMap[card.label] || Package;
          const color = colorMap[card.label] || "#008060";
          return (
            <div
              key={card.label}
              className="group rounded-lg border border-[#e1e3e5] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_1px_3px_rgba(63,63,68,0.12)]"
            >
              <div className="flex items-center justify-between">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${color}12`, color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-[#b5b5b5] opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-4">
                {loading ? (
                  <div className="h-8 w-16 animate-pulse rounded bg-[#e1e3e5]" />
                ) : (
                  <p className="text-2xl font-semibold text-[#202223]">{card.value}</p>
                )}
                <p className="mt-1 text-[13px] font-medium text-[#6d7175]">{card.label}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Quick Actions */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <a href="/qh-admin/products" className="group rounded-lg border border-[#e1e3e5] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-[#008060] hover:shadow-[0_1px_3px_rgba(63,63,68,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4f6f8] text-[#6d7175] transition-colors group-hover:bg-[#e3f1df] group-hover:text-[#008060]">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[#202223]">Manage Products</p>
              <p className="text-[13px] text-[#6d7175]">View, edit and delete products</p>
            </div>
          </div>
        </a>
        <a href="/qh-admin/orders" className="group rounded-lg border border-[#e1e3e5] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-[#008060] hover:shadow-[0_1px_3px_rgba(63,63,68,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4f6f8] text-[#6d7175] transition-colors group-hover:bg-[#fdf0d5] group-hover:text-[#b98900]">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[#202223]">View Orders</p>
              <p className="text-[13px] text-[#6d7175]">Track and manage orders</p>
            </div>
          </div>
        </a>
        <a href="/qh-admin/customers" className="group rounded-lg border border-[#e1e3e5] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all hover:border-[#008060] hover:shadow-[0_1px_3px_rgba(63,63,68,0.12)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4f6f8] text-[#6d7175] transition-colors group-hover:bg-[#e8dff5] group-hover:text-[#5c6ac4]">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-[#202223]">Customers</p>
              <p className="text-[13px] text-[#6d7175]">View registered customers</p>
            </div>
          </div>
        </a>
      </section>

      {/* Activity / Tips */}
      <section className="rounded-lg border border-[#e1e3e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#e1e3e5] px-6 py-4">
          <h3 className="font-semibold text-[#202223]">Getting started</h3>
        </div>
        <div className="divide-y divide-[#e1e3e5]">
          {[
            { text: "Add your first product to the store", done: (stats?.totalProducts ?? 0) > 0, href: "/qh-admin/add-product" },
            { text: "Set up your store categories", done: true, href: "/qh-admin" },
            { text: "Configure payment methods", done: false, href: "/qh-admin" },
            { text: "Set up shipping zones", done: false, href: "/qh-admin" },
          ].map((step) => (
            <a key={step.text} href={step.href} className="flex items-center gap-3 px-6 py-3.5 transition-colors hover:bg-[#f9fafb]">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                  step.done
                    ? "border-[#008060] bg-[#008060] text-white"
                    : "border-[#c9cccf] text-transparent"
                }`}
              >
                {step.done ? "✓" : ""}
              </div>
              <span className={`flex-1 text-[14px] ${step.done ? "text-[#8c9196] line-through" : "font-medium text-[#202223]"}`}>
                {step.text}
              </span>
              <ArrowUpRight className="h-4 w-4 text-[#b5b5b5]" />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
