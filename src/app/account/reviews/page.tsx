"use client";

import { useEffect, useMemo, useState } from "react";
import { Star, ChevronLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

type UserInfo = { id: string; phone: string; name: string | null; email: string | null; role: string };
type Review = {
  id: string;
  product_slug: string;
  rating: number;
  title: string | null;
  comment: string | null;
  updated_at: string;
};

export default function ReviewsPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productSlug, setProductSlug] = useState("");
  const [productTitle, setProductTitle] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const editingReview = useMemo(
    () => reviews.find((r) => r.product_slug === productSlug),
    [reviews, productSlug],
  );

  async function loadReviews() {
    const res = await fetch("/api/reviews?mine=1", { cache: "no-store" });
    const data = await res.json();
    setReviews(Array.isArray(data.reviews) ? data.reviews : []);
  }

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then(async (data) => {
        if (data.authenticated) {
          setUser(data.user);
          await loadReviews();
          if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            const p = url.searchParams.get("product") || "";
            const t = url.searchParams.get("title") || "";
            setProductSlug(p);
            setProductTitle(t);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!editingReview) return;
    setRating(editingReview.rating || 5);
    setTitle(editingReview.title || "");
    setComment(editingReview.comment || "");
  }, [editingReview?.id]);

  async function submitReview() {
    if (!productSlug) {
      setMessage("Please choose a product from your orders to review.");
      return;
    }
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug, rating, title, comment }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(data.error || "Failed to save review");
      return;
    }
    setMessage("Review saved successfully.");
    await loadReviews();
  }

  async function deleteReview(id: string) {
    const res = await fetch(`/api/reviews?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) return;
    await loadReviews();
    if (editingReview?.id === id) {
      setTitle("");
      setComment("");
      setRating(5);
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
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-xl font-semibold">Please log in to view your reviews</h1>
        <Link href="/account" className="mt-4 rounded-full bg-brand-primary px-6 py-2 text-white">Login</Link>
      </div>
    );
  }

  return (
    <div className="qh-container mx-auto max-w-5xl py-8 md:py-12">
      <Link href="/account" className="mb-6 flex items-center text-sm font-semibold text-text-muted hover:text-brand-primary">
        <ChevronLeft className="mr-1 h-4 w-4" /> Back to Account
      </Link>

      <SectionHeader title="My Reviews" description="Write, edit and manage your product reviews." />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-border bg-background-main p-5">
          <h3 className="text-lg font-semibold text-text-main">{editingReview ? "Edit Review" : "Write Review"}</h3>
          <p className="mt-1 text-sm text-text-muted">
            Product: <span className="font-semibold text-text-main">{productTitle || productSlug || "Select from orders"}</span>
          </p>
          <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-muted">Rating</p>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="rounded p-1" type="button">
                  <Star className={`h-6 w-6 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-text-soft"}`} />
                </button>
              ))}
            </div>
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title (optional)"
            className="mt-4 w-full rounded-xl border border-border bg-background-elevated px-3 py-2 text-sm"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={5}
            placeholder="Share your experience..."
            className="mt-3 w-full rounded-xl border border-border bg-background-elevated px-3 py-2 text-sm"
          />
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={submitReview}
              disabled={saving}
              className="rounded-full bg-brand-primary px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving..." : editingReview ? "Update Review" : "Submit Review"}
            </button>
            <Link href="/account/orders" className="rounded-full border border-border px-5 py-2 text-sm font-semibold text-text-main hover:border-brand-primary hover:text-brand-primary">
              Review from Orders
            </Link>
          </div>
          {message ? <p className="mt-3 text-sm text-text-muted">{message}</p> : null}
        </div>

        <div className="rounded-2xl border border-border bg-background-main p-5">
          <h3 className="text-lg font-semibold text-text-main">Your submitted reviews</h3>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-text-muted">No reviews yet. Review products from your orders.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border bg-background-elevated p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-text-main">/{review.product_slug}</p>
                      <div className="mt-1 flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} className={`h-3.5 w-3.5 ${n <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-text-soft"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setProductSlug(review.product_slug);
                          setProductTitle(review.product_slug);
                          setRating(review.rating);
                          setTitle(review.title || "");
                          setComment(review.comment || "");
                        }}
                        className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold"
                      >
                        Edit
                      </button>
                      <button onClick={() => deleteReview(review.id)} className="rounded-full border border-red-200 px-2.5 py-1 text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {review.title ? <p className="mt-2 text-sm font-semibold text-text-main">{review.title}</p> : null}
                  {review.comment ? <p className="mt-1 text-sm text-text-muted">{review.comment}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
