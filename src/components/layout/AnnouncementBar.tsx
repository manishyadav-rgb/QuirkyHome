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

  const isLegacyColor = (color?: string) => {
    if (!color) return true;
    const c = color.toLowerCase().trim();
    return c === "#008060" || c === "#9b7643" || c === "#8a6636";
  };

  const content = (
    <div
      className="relative flex w-full items-center justify-center gap-1.5 px-8 py-2.5 text-center text-[11px] font-bold leading-tight select-none transition-all md:text-[13px]"
      style={{
        backgroundColor: isLegacyColor(settings?.bgColor)
          ? "var(--color-brand-secondary)"
          : settings?.bgColor,
        color: !settings?.textColor || settings.textColor === "#ffffff"
          ? "#ffffff"
          : settings.textColor,
      }}
    >
      <span>{bannerText}</span>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setEnabled(false);
        }}
        className="absolute right-3.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-[10px] font-extrabold text-white/90 transition-all hover:bg-white/25 hover:text-white focus:outline-none"
        aria-label="Dismiss Announcement"
      >
        x
      </button>
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
