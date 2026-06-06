"use client";

import { useEffect, useState } from "react";
import { Headset, ChevronLeft, ChevronRight, Mail, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

type UserInfo = { id: string; phone: string; name: string | null; email: string | null; role: string };

export default function HelpCenterPage() {
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

  return (
    <div className="qh-container mx-auto max-w-4xl py-8 md:py-12">
      <Link href="/account" className="mb-6 flex items-center text-sm font-semibold text-text-muted hover:text-brand-primary">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Account
      </Link>
      
      <SectionHeader title="Help Center" description="How can we help you today?" />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Contact Cards */}
        <div className="rounded-xl border border-border bg-background-main p-6 text-center shadow-sm transition-shadow hover:shadow-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Phone className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-bold text-text-main">Call Us</h3>
          <p className="mt-1 text-sm text-text-muted">Mon-Sat, 9AM to 6PM</p>
          <a href="tel:18001234567" className="mt-4 block font-semibold text-brand-primary">1800-123-4567</a>
        </div>

        <div className="rounded-xl border border-border bg-background-main p-6 text-center shadow-sm transition-shadow hover:shadow-md">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-bold text-text-main">WhatsApp Chat</h3>
          <p className="mt-1 text-sm text-text-muted">Instant replies 24/7</p>
          <button className="mt-4 font-semibold text-brand-primary">Start Chat</button>
        </div>

        <div className="rounded-xl border border-border bg-background-main p-6 text-center shadow-sm transition-shadow hover:shadow-md sm:col-span-2 lg:col-span-1">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 text-purple-600">
            <Mail className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-bold text-text-main">Email Us</h3>
          <p className="mt-1 text-sm text-text-muted">We reply within 24 hrs</p>
          <a href="mailto:support@quirkyhome.com" className="mt-4 block font-semibold text-brand-primary">support@quirkyhome.com</a>
        </div>
      </div>

      {user && (
        <div className="mt-8 rounded-xl border border-border bg-background-soft p-6">
          <h3 className="mb-4 font-bold text-text-main">Need help with a recent order?</h3>
          <Link href="/account/orders" className="inline-flex items-center gap-2 rounded-lg bg-background-main px-4 py-2 text-sm font-semibold border border-border hover:border-brand-primary hover:text-brand-primary transition-colors">
            Select an Order <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
