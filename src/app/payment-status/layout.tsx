import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payment Status",
  description: "View your payment and order confirmation status on QuirkyHome.",
  alternates: {
    canonical: "/payment-status",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function PaymentStatusLayout({ children }: { children: React.ReactNode }) {
  return children;
}

