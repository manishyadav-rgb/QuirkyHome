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
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/admin/builder", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const sections = data?.schema?.pages?.home?.sections;
        if (!Array.isArray(sections)) {
          setEnabled(false);
          return;
        }
        const banner = sections.find((s: any) => s?.visible && s?.type === "BannerStrip");
        if (!banner?.settings) {
          setEnabled(false);
          return;
        }
        setSettings(banner.settings);
        setEnabled(true);
      })
      .catch(() => setEnabled(false));
  }, []);

  if (!enabled || !settings?.text) return null;

  const content = (
    <div
      className="w-full px-3 py-2 text-center text-[12px] font-bold leading-tight md:text-[14px]"
      style={{
        backgroundColor: !settings.bgColor || settings.bgColor === "#008060"
          ? "var(--color-brand-accent)"
          : settings.bgColor,
        color: !settings.textColor || settings.textColor === "#ffffff"
          ? "var(--color-text-main)"
          : settings.textColor,
      }}
    >
      {settings.text}
    </div>
  );

  if (settings.link) {
    return (
      <a href={settings.link} className="block no-underline">
        {content}
      </a>
    );
  }

  return content;
}

