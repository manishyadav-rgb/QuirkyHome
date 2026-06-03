"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState("");
  const [routerReady, setRouterReady] = useState(false);

  useEffect(() => {
    setPathname(window.location.pathname);
    setRouterReady(true);
  }, []);

  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/qh-admin");

  if (!routerReady) {
    return <main>{children}</main>;
  }

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
