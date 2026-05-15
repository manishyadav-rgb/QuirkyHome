"use client";

import { useEffect, useCallback } from "react";
import { THEME_PRESETS, resolveThemeTokens } from "@/lib/theme-definitions";
import type { ThemeConfig } from "@/lib/theme-definitions";

/**
 * ThemeProvider — Fetches theme config from the API (/api/theme)
 * and applies ALL CSS variables directly to the <html> element.
 * 
 * This approach bypasses the data-theme CSS attribute entirely
 * and injects colors via JS — so custom overrides always work.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const applyTheme = useCallback((config: ThemeConfig) => {
    const tokens = resolveThemeTokens(config);
    const root = document.documentElement;

    // Apply every CSS variable
    for (const [key, value] of Object.entries(tokens)) {
      root.style.setProperty(key, value);
    }

    // Also set data-theme for any CSS-only rules
    root.dataset.theme = config.activePreset;
  }, []);

  useEffect(() => {
    async function loadTheme() {
      try {
        const res = await fetch("/api/theme", { cache: "no-store" });
        if (res.ok) {
          const config: ThemeConfig = await res.json();
          applyTheme(config);
          return;
        }
      } catch {
        // API not available, use default
      }

      // Fallback: apply default Vibrant Sunshine
      applyTheme({ activePreset: "vibrant-sunshine", customOverrides: {} });
    }

    loadTheme();

    // Poll for theme changes every 5 seconds (for when admin changes it live)
    const interval = setInterval(loadTheme, 5000);
    return () => clearInterval(interval);
  }, [applyTheme]);

  return <>{children}</>;
}
