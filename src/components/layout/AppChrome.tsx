"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

function useIsAdminPath() {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  return {
    ready: Boolean(pathname),
    isAdmin: pathname.startsWith("/admin") || pathname.startsWith("/qh-admin"),
  };
}

export function AppChromeTop() {
  const { ready, isAdmin } = useIsAdminPath();
  if (!ready || isAdmin) return null;

  return (
    <>
      <AnnouncementBar />
      <Header />
      <Breadcrumbs />
    </>
  );
}

export function AppChromeBottom() {
  const { ready, isAdmin } = useIsAdminPath();
  if (!ready || isAdmin) return null;

  return (
    <>
      <Footer />
      <BottomNav />
    </>
  );
}
