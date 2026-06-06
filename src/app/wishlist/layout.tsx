import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wishlist",
  description: "Save and revisit your favourite home decor picks on QuirkyHome.",
  alternates: {
    canonical: "/wishlist",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return children;
}

