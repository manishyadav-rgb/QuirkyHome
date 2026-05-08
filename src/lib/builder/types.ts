/**
 * QuirkyHome Visual Page Builder — Type Definitions
 * 
 * Drives the entire builder with a JSON-first architecture.
 * Every page is a list of typed sections, and global theme
 * settings are injected as CSS variables for instant previews.
 */

/* ─── Theme Settings (Centralized CSS) ─────────────────────── */

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  border: string;
}

export interface ThemeTypography {
  fontFamily: string;
  headingFamily: string;
  baseSize: string;
  headingWeight: string;
}

export interface ThemeSpacing {
  sectionPadding: string;
  containerMax: string;
  borderRadius: string;
}

export interface ThemeSettings {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
}

/* ─── Section Types ────────────────────────────────────────── */

export type SectionType =
  | "HeroBanner"
  | "SearchBand"
  | "CategoryGrid"
  | "CollectionsSection"
  | "ProductGrid"
  | "PromisesSection"
  | "Newsletter"
  | "SeoArticle"
  | "Testimonials"
  | "RichText"
  | "ImageWithText"
  | "FeaturedCollection"
  | "BannerStrip";

/** Single section in a page */
export interface Section {
  id: string;
  type: SectionType;
  settings: Record<string, any>;
  visible: boolean;
}

/* ─── Page Schema ──────────────────────────────────────────── */

export interface PageConfig {
  name: string;
  slug: string;
  sections: Section[];
}

/** Root schema persisted to the DB */
export interface BuilderSchema {
  themeSettings: ThemeSettings;
  pages: Record<string, PageConfig>;
}

/* ─── Section Field Schema (drives dynamic editor forms) ──── */

export type FieldType =
  | "text"
  | "textarea"
  | "color"
  | "number"
  | "select"
  | "image"
  | "toggle";

export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: { label: string; value: string }[];
  defaultValue?: any;
}

export interface SectionDefinition {
  type: SectionType;
  label: string;
  icon: string;           // Lucide icon name
  fields: FieldSchema[];
  defaultSettings: Record<string, any>;
}
