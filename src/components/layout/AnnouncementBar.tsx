"use client";

import { useEffect, useState } from "react";

type BannerSettings = {
  text?: string;
  bgColor?: string;
  textColor?: string;
  link?: string;
};

export function AnnouncementBar() {
  const [settings, setSettings] = useState<BannerSettings | null>(null);
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    fetch("/api/admin/builder", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const sections = data?.schema?.pages?.home?.sections;
        if (!Array.isArray(sections)) {
          return;
        }
        const banner = sections.find((s: any) => s?.visible && s?.type === "BannerStrip");
        if (!banner?.settings) {
          return;
        }
        setSettings(banner.settings);
      })
      .catch(() => {
        // Keep default announcement visible when API/config is unavailable.
      });
  }, []);

  const bannerText = settings?.text || "Free shipping on prepaid orders above INR 999";
  if (!enabled) return null;

  const content = (
    <div
      className="hidden w-full px-3 py-2 text-center text-[12px] font-bold leading-tight md:block md:text-[14px]"
      style={{
        backgroundColor: !settings?.bgColor || settings.bgColor === "#008060"
          ? "#FBBF24"
          : settings.bgColor,
        color: !settings?.textColor || settings.textColor === "#ffffff"
          ? "var(--color-text-main)"
          : settings.textColor,
      }}
    >
      {bannerText}
    </div>
  );

  if (settings?.link) {
    return (
      <a href={settings.link} className="block no-underline">
        {content}
      </a>
    );
  }

  return content;
}

