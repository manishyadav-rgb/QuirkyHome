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
      <div>
        <Breadcrumbs />
        <main>{children}</main>
      </div>
      <Footer />
      <BottomNav />
    </>
  );
}
