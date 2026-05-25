import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review items in your QuirkyHome cart before checkout.",
  alternates: {
    canonical: "/cart",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}

