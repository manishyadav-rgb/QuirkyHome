"use client";

import Link from "next/link";
import { Coins, Heart, ShoppingBag, UserRound, Package, Ticket, Star, Headset } from "lucide-react";
import { useEffect, useState } from "react";
import { SearchBar } from "@/components/ui/SearchBar";
import { useShop } from "@/components/shop/ShopProvider";
import { MobileMenuDrawer, MobileMenuTrigger } from "./MobileMenu";

import { CategoryNav } from "./CategoryNav";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [rewardCoins, setRewardCoins] = useState<number | null>(null);
  const { cartCount, wishlistCount } = useShop();
  const actions = [
    { href: "/wishlist", label: "Wishlist", icon: Heart, count: wishlistCount },
    { href: "/cart", label: "Cart", icon: ShoppingBag, count: cartCount },
    { href: "/account", label: "Account", icon: UserRound },
  ];

  useEffect(() => {
    fetch("/api/rewards")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.balance === "number") setRewardCoins(data.balance);
      })
      .catch(() => {
        setRewardCoins(null);
      });
  }, []);

  return (
    <>
      <header
        className="sticky inset-x-0 top-0 z-[120] border-b border-border qh-header-surface backdrop-blur"
      >

        <div className="qh-mobile-header md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-background-elevated">
          <MobileMenuTrigger onOpen={() => setMenuOpen(true)} />
          <div className="min-w-0 flex-1">
            <SearchBar compact className="w-full" />
          </div>
          <Link
            href="/account/rewards"
            className="qh-focus relative -mr-1 inline-flex h-10 w-9 shrink-0 items-center justify-center rounded-full text-brand-primary hover:bg-brand-primary/10"
            aria-label="Quirky Coins"
          >
            <Coins className="h-[22px] w-[22px]" />
            {rewardCoins && rewardCoins > 0 ? (
              <span className="absolute -right-1 -top-1 rounded-full bg-brand-primary px-1.5 py-0.5 text-[9px] font-black leading-none text-white">
                {rewardCoins > 99 ? "99+" : rewardCoins}
              </span>
            ) : null}
          </Link>
          <Link href="/cart" className="qh-focus relative inline-flex h-10 w-9 shrink-0 items-center justify-center text-text-muted hover:text-brand-primary" aria-label="Cart">
            <ShoppingBag className="h-[22px] w-[22px]" />
            {cartCount ? (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-primary px-1 text-[11px] font-bold text-text-inverse">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>
        <div className="qh-container hidden h-header items-center gap-4 md:flex">
          <MobileMenuTrigger onOpen={() => setMenuOpen(true)} />
          <Link href="/" className="qh-logo shrink-0" aria-label="QuirkyHome">
            <img
              src="https://res.cloudinary.com/dd4hmahlm/image/upload/v1774697521/rw9xm5nnegmsigzcke5q.png"
              alt="QuirkyHome Logo"
              className="h-[40px] w-auto object-contain mix-blend-multiply"
            />
          </Link>
          <SearchBar className="qh-header-search hidden md:block" />
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Link
              href="/account/rewards"
              className="qh-focus group relative inline-flex h-10 items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/5 px-3 text-brand-primary transition-all duration-base hover:border-brand-primary/40 hover:bg-brand-primary/10"
              aria-label="Quirky Coins rewards"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white shadow-sm">
                <Coins className="h-[18px] w-[18px]" />
              </span>
              <span className="hidden text-xs font-black leading-none lg:inline">
                {rewardCoins && rewardCoins > 0 ? `${rewardCoins} Coins` : "Coins"}
              </span>
              <div className="pointer-events-none absolute right-0 top-full z-20 mt-2 w-72 translate-y-2 rounded-2xl border border-border bg-background-main p-4 text-left opacity-0 shadow-xl transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-sm font-black text-text-main">Quirky Coins</p>
                <p className="mt-1 text-xs leading-5 text-text-muted">
                  Earn coins on every paid order, then convert them into a coupon or redeem them on your next purchase.
                </p>
              </div>
            </Link>
            {actions.map((action) => {
              const Icon = action.icon;
              if (action.label === "Account") {
                return (
                  <div key={action.href} className="group relative">
                    <Link href={action.href} className="qh-focus relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-all duration-base hover:bg-background-soft hover:text-brand-primary" aria-label={action.label}>
                      <Icon className="h-5 w-5" />
                    </Link>
                    {/* Flipkart-style Account Dropdown */}
                    <div className="absolute right-0 top-full invisible mt-2 w-64 translate-y-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="rounded-xl border border-border bg-background-main py-2 shadow-xl">
                        <div className="border-b border-border px-5 py-3">
                          <p className="font-semibold text-text-main">Hello, User</p>
                          <p className="text-sm text-text-muted">Manage your profile and orders</p>
                        </div>
                        <div className="flex flex-col py-2">
                          <Link href="/account/orders" className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-main hover:text-brand-primary">
                            <Package className="h-4 w-4" /> Orders
                          </Link>
                          <Link href="/wishlist" className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-main hover:text-brand-primary">
                            <Heart className="h-4 w-4" /> Wishlist
                          </Link>
                          <Link href="/account/coupons" className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-main hover:text-brand-primary">
                            <Ticket className="h-4 w-4" /> Coupons
                          </Link>
                          <Link href="/account/rewards" className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-main hover:text-brand-primary">
                            <Coins className="h-4 w-4" /> Quirky Coins
                          </Link>
                          <Link href="/account/reviews" className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-main hover:text-brand-primary">
                            <Star className="h-4 w-4" /> My Reviews
                          </Link>
                          <Link href="/account/help" className="flex items-center gap-3 border-t border-border mt-1 pt-3 px-5 pb-2 text-sm text-text-main hover:text-brand-primary">
                            <Headset className="h-4 w-4" /> Help Center
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link key={action.href} href={action.href} className="qh-focus relative inline-flex h-10 w-10 items-center justify-center rounded-full text-text-muted transition-all duration-base hover:bg-background-soft hover:text-brand-primary" aria-label={action.label}>
                  <Icon className="h-5 w-5" />
                  {action.count ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-brand-primary px-1 text-[11px] font-bold text-text-inverse">{action.count}</span> : null}
                </Link>
              );
            })}
          </div>
        </div>
        <CategoryNav />
      </header>
      <MobileMenuDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

