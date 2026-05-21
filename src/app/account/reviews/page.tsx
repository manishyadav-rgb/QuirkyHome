"use client";

import { useEffect, useState } from "react";
import { Star, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

type UserInfo = { id: string; phone: string; name: string | null; email: string | null; role: string };

export default function ReviewsPage() {
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
        <h1 className="text-xl font-semibold">Please log in to view your reviews</h1>
        <Link href="/account" className="mt-4 rounded-full bg-brand-primary px-6 py-2 text-white">Login</Link>
      </div>
    );
  }

  return (
    <div className="qh-container mx-auto max-w-4xl py-8 md:py-12">
      <Link href="/account" className="mb-6 flex items-center text-sm font-semibold text-text-muted hover:text-brand-primary">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Account
      </Link>
      
      <SectionHeader title="My Reviews" description="Manage your product reviews and ratings." />

      <div className="mt-8 flex flex-col gap-4">
        {/* Placeholder for Empty Reviews */}
        <div className="rounded-xl border border-border bg-background-main p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-background-soft">
            <Star className="h-8 w-8 text-text-muted" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-text-main">No reviews yet</h2>
          <p className="mt-2 text-sm text-text-muted">You haven't reviewed any products yet. Share your experience to help others!</p>
          <Link href="/account/orders" className="mt-6 inline-block rounded-full bg-brand-primary px-8 py-3 text-sm font-semibold text-white">
            Review your orders
          </Link>
        </div>
      </div>
    </div>
  );
}
