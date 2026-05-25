"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/qh-admin");

  if (isAdmin) return <main>{children}</main>;

  return (
    <>
      <AnnouncementBar />
      <Header />
      <div aria-hidden className="h-[86px] md:h-[56px] lg:h-[92px]" />
      <Breadcrumbs />
      <main className="pt-[10px]">{children}</main>
      <Footer />
      <BottomNav />
    </>
  );
}
