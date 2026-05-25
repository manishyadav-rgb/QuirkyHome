import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account",
  description: "Manage your QuirkyHome account, orders, wishlist, coupons, reviews and support.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return children;
}

