"use client";

import { useEffect, useState } from "react";
import { THEME_PRESETS, resolveThemeTokens } from "@/lib/theme-definitions";
import type { ThemeConfig } from "@/lib/theme-definitions";

export function ThemeSwitcher() {
  const [activePreset, setActivePreset] = useState("vibrant-sunshine");

  /* Read saved theme on mount */
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/theme", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (data.activePreset) setActivePreset(data.activePreset);
        }
      } catch { /* use default */ }
    }
    load();
  }, []);

  async function switchTheme(presetId: string) {
    setActivePreset(presetId);

    // Apply instantly via JS
    const config: ThemeConfig = { activePreset: presetId, customOverrides: {} };
    const tokens = resolveThemeTokens(config);
    const root = document.documentElement;
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value);
    }
    root.dataset.theme = presetId;

    // Save to API (shared JSON file)
    try {
      await fetch("/api/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activePreset: presetId, customOverrides: {} }),
      });
    } catch { /* silent */ }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 py-3">
      <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-text-muted">Theme</span>
      {THEME_PRESETS.map((t) => {
        const isActive = activePreset === t.id;
        return (
          <button
            key={t.id}
            onClick={() => switchTheme(t.id)}
            title={t.name}
            className={`no-theme-transition group relative flex h-8 w-8 items-center justify-center rounded-full border-2 transition-transform duration-200 hover:scale-110 ${
              isActive ? "scale-110 ring-2 ring-offset-1" : "border-transparent"
            }`}
            style={{
              background: `linear-gradient(135deg, ${t.tokens["--color-brand-primary"]}, ${t.tokens["--color-brand-accent"]})`,
              borderColor: isActive ? t.tokens["--color-brand-primary"] : "transparent",
              // @ts-ignore
              "--tw-ring-color": isActive ? t.tokens["--color-brand-primary"] + "40" : "transparent",
            }}
          >
            {isActive && (
              <svg className="h-3.5 w-3.5 text-white drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
