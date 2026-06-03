"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, Coins, Gift, ReceiptText, Ticket, WalletCards } from "lucide-react";
import { SectionHeader } from "@/components/ui/SectionHeader";

type UserInfo = { id: string; phone: string; name: string | null; email: string | null; role: string };
type RewardsData = {
  balance: number;
  earned: number;
  redeemed: number;
  earnRate: number;
  transactions: {
    id: string;
    type: "earn" | "redeem" | "adjust";
    coins: number;
    note: string | null;
    order_number: string | null;
    created_at: string;
  }[];
};

const earningSteps = [
  { icon: ReceiptText, title: "Place an order", text: "Once payment is complete, the eligible order amount is tracked automatically." },
  { icon: Coins, title: "Earn coins", text: "Your reward coins are added to your wallet after eligible paid orders." },
  { icon: Ticket, title: "Redeem next time", text: "Convert coins into a coupon or use them on a future purchase." },
];

export default function RewardsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [rewards, setRewards] = useState<RewardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
  const [generatedCoupon, setGeneratedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [rewardError, setRewardError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) setUser(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/rewards")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setRewards(data);
      })
      .catch(() => setRewards(null));
  }, [user]);

  async function convertCoinsToCoupon() {
    setConverting(true);
    setRewardError("");
    setGeneratedCoupon(null);
    try {
      const res = await fetch("/api/rewards", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not convert coins.");
      setGeneratedCoupon({ code: data.code, discountAmount: data.discountAmount });
      setRewards((prev) =>
        prev
          ? {
              ...prev,
              balance: data.balance,
              redeemed: prev.redeemed + data.discountAmount,
              transactions: [
                {
                  id: `generated-${data.code}`,
                  type: "redeem",
                  coins: -data.discountAmount,
                  note: `Converted ${data.discountAmount} coins to coupon ${data.code}`,
                  order_number: null,
                  created_at: new Date().toISOString(),
                },
                ...prev.transactions,
              ],
            }
          : prev,
      );
    } catch (error) {
      setRewardError(error instanceof Error ? error.message : "Could not convert coins.");
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-brand-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-primary/10 text-brand-primary">
          <Coins className="h-7 w-7" />
        </div>
        <h1 className="mt-4 text-xl font-semibold text-text-main">Login to view Quirky Coins</h1>
        <p className="mt-2 max-w-sm text-sm text-text-muted">
          Log in to earn, track, and redeem your reward coins.
        </p>
        <Link href="/account" className="mt-5 rounded-full bg-brand-primary px-6 py-2 text-sm font-bold text-white">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="qh-container mx-auto max-w-5xl py-8 md:py-12">
      <Link href="/account" className="mb-6 flex items-center text-sm font-semibold text-text-muted hover:text-brand-primary">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Account
      </Link>

      <SectionHeader
        title="Quirky Coins"
        description="Earn reward coins on paid orders, then convert them into coupons or redeem them on your next purchase."
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="overflow-hidden rounded-2xl border border-brand-primary/20 bg-brand-primary text-white shadow-sm">
          <div className="p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">Coin wallet</p>
                <h2 className="mt-3 text-4xl font-black tracking-tight">{rewards?.balance ?? 0}</h2>
                <p className="mt-1 text-sm font-semibold text-white/85">Available Quirky Coins</p>
              </div>
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/15">
                <Coins className="h-8 w-8" />
              </div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-white/12 p-4">
                <p className="text-xs font-semibold text-white/70">Reward rate</p>
                <p className="mt-1 text-lg font-black">On eligible orders</p>
              </div>
              <div className="rounded-xl bg-white/12 p-4">
                <p className="text-xs font-semibold text-white/70">Lifetime earned</p>
                <p className="mt-1 text-lg font-black">{rewards?.earned ?? 0} coins</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border bg-background-main p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary">
              <WalletCards className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-black text-text-main">Redeem options</h3>
              <p className="text-sm text-text-muted">Turn your coins into shopping value.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              onClick={convertCoinsToCoupon}
              disabled={converting || !rewards || rewards.balance <= 0}
              className="flex items-center justify-between rounded-xl border border-border bg-background-soft px-4 py-3 text-left transition hover:border-brand-primary/40 disabled:cursor-not-allowed disabled:opacity-55"
            >
              <span>
                <span className="block text-sm font-black text-text-main">Convert to coupon</span>
                <span className="text-xs text-text-muted">Generate a coupon code from your available coins.</span>
              </span>
              {converting ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-primary/20 border-t-brand-primary" />
              ) : (
                <Ticket className="h-5 w-5 text-brand-primary" />
              )}
            </button>
            <button className="flex items-center justify-between rounded-xl border border-border bg-background-soft px-4 py-3 text-left transition hover:border-brand-primary/40">
              <span>
                <span className="block text-sm font-black text-text-main">Use on next purchase</span>
                <span className="text-xs text-text-muted">Apply eligible coins during checkout on a future order.</span>
              </span>
              <Gift className="h-5 w-5 text-brand-primary" />
            </button>
          </div>
          {generatedCoupon && (
            <div className="mt-4 rounded-xl border border-brand-primary/30 bg-brand-primary/5 p-4">
              <p className="text-xs font-semibold text-text-muted">Generated coupon</p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="rounded-lg bg-white px-3 py-2 font-mono text-sm font-black text-brand-primary">
                  {generatedCoupon.code}
                </span>
                <span className="text-sm font-black text-text-main">INR {generatedCoupon.discountAmount} off</span>
              </div>
            </div>
          )}
          {rewardError && (
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
              {rewardError}
            </p>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-background-main p-5 shadow-sm">
        <h3 className="font-black text-text-main">Recent coin activity</h3>
        <div className="mt-4 grid gap-3">
          {rewards?.transactions?.length ? (
            rewards.transactions.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background-soft px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-text-main">
                    {item.note || (item.type === "earn" ? "Coins earned" : "Coins updated")}
                  </p>
                  <p className="text-xs text-text-muted">
                    {item.order_number ? `Order ${item.order_number}` : "Wallet activity"}
                  </p>
                </div>
                <span className={`shrink-0 text-sm font-black ${item.coins >= 0 ? "text-brand-primary" : "text-red-600"}`}>
                  {item.coins >= 0 ? "+" : ""}{item.coins}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background-soft px-4 py-6 text-center">
              <p className="text-sm font-semibold text-text-main">No coin activity yet</p>
              <p className="mt-1 text-xs text-text-muted">Reward coins will appear here after a paid order is completed.</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-background-main p-5 shadow-sm">
        <h3 className="font-black text-text-main">How it works</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {earningSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-xl border border-border bg-background-soft p-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-primary/10 text-brand-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="mt-3 text-sm font-black text-text-main">{step.title}</p>
                <p className="mt-1 text-xs leading-5 text-text-muted">{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
