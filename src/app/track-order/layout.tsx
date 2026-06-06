import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your QuirkyHome order status and delivery updates.",
  alternates: {
    canonical: "/track-order",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}

