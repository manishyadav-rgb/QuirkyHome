"use client";

import { useEffect, useState } from "react";
import { Ticket, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

type UserInfo = { id: string; phone: string; name: string | null; email: string | null; role: string };

export default function CouponsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
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
        <h1 className="text-xl font-semibold">Please log in to view your coupons</h1>
        <Link href="/account" className="mt-4 rounded-full bg-brand-primary px-6 py-2 text-white">Login</Link>
      </div>
    );
  }

  return (
    <div className="qh-container mx-auto max-w-4xl py-8 md:py-12">
      <Link href="/account" className="mb-6 flex items-center text-sm font-semibold text-text-muted hover:text-brand-primary">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Account
      </Link>
      
      <SectionHeader title="My Coupons" description="Exclusive discounts and offers just for you." />

      <div className="mt-8 flex flex-col gap-4">
        {/* Placeholder for Coupons */}
        <div className="rounded-xl border border-dashed border-brand-primary bg-brand-accent/20 p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/10">
                <Ticket className="h-6 w-6 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-bold text-text-main">WELCOME20</h3>
                <p className="text-sm text-text-muted">Get 20% off on your first order. Max discount ₹500.</p>
              </div>
            </div>
            <button className="rounded border border-brand-primary px-4 py-1 text-sm font-bold text-brand-primary hover:bg-brand-primary hover:text-white transition-colors">
              COPY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
