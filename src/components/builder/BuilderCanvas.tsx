/**
 * Builder Canvas — Live Preview
 * 
 * Injects theme settings as CSS variables on a wrapper div,
 * renders all sections for the active page, and handles
 * click-to-select interaction.
 */

"use client";

import React from "react";
import { useBuilderStore } from "@/lib/builder/store";
import { sectionComponentMap } from "./SectionPreviews";

export function BuilderCanvas() {
  const schema = useBuilderStore((s) => s.schema);
  const activePage = useBuilderStore((s) => s.activePage);
  const activeSection = useBuilderStore((s) => s.activeSection);
  const setActiveSection = useBuilderStore((s) => s.setActiveSection);

  const theme = schema.themeSettings;
  const page = schema.pages[activePage];

  if (!page) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[#6d7175]">
        No page selected
      </div>
    );
  }

  // CSS variable injection from theme settings
  const cssVars: Record<string, string> = {
    "--color-primary": theme.colors.primary,
    "--color-secondary": theme.colors.secondary,
    "--color-background": theme.colors.background,
    "--color-surface": theme.colors.surface,
    "--color-text": theme.colors.text,
    "--color-text-muted": theme.colors.textMuted,
    "--color-accent": theme.colors.accent,
    "--color-border": theme.colors.border,
    "--font-family": theme.typography.fontFamily,
    "--heading-family": theme.typography.headingFamily,
    "--base-size": theme.typography.baseSize,
    "--heading-weight": theme.typography.headingWeight,
    "--section-padding": theme.spacing.sectionPadding,
    "--container-max": theme.spacing.containerMax,
    "--radius": theme.spacing.borderRadius,
  };

  return (
    <div className="flex-1 overflow-auto bg-[#e8e8e8]">
      <div className="mx-auto my-4 max-w-[1440px] rounded-lg shadow-xl" style={{ minHeight: "80vh" }}>
        {/* Theme wrapper — CSS variables applied here */}
        <div
          style={{
            ...cssVars,
            backgroundColor: "var(--color-background)",
            color: "var(--color-text)",
            fontFamily: "var(--font-family)",
            fontSize: "var(--base-size)",
          } as React.CSSProperties}
          className="overflow-hidden rounded-lg"
        >
          {page.sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-sm text-gray-400">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <line x1="12" y1="8" x2="12" y2="16" />
                <line x1="8" y1="12" x2="16" y2="12" />
              </svg>
              <p className="mt-3">No sections yet — add one from the sidebar</p>
            </div>
          ) : (
            page.sections.map((section) => {
              if (!section.visible) return null;
              const Component = sectionComponentMap[section.type];
              if (!Component) return null;

              const isActive = section.id === activeSection;

              return (
                <div
                  key={section.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection(section.id);
                  }}
                  className="relative cursor-pointer transition-all duration-150"
                  style={{
                    outline: isActive ? "2px solid #5c6ac4" : "2px solid transparent",
                    outlineOffset: isActive ? "-2px" : "0",
                  }}
                >
                  {/* Hover / Active label */}
                  {isActive && (
                    <div className="absolute -top-0.5 left-2 z-20 rounded-b-md bg-[#5c6ac4] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-sm">
                      {section.type}
                    </div>
                  )}
                  <Component settings={section.settings} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
