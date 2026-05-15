/**
 * QuirkyHome Visual Page Builder — Zustand Store
 * 
 * Central state for the builder. Manages:
 * - Global theme settings (colors, typography, spacing)
 * - Multiple pages, each with its own section list
 * - Active page / active section selection
 * - Add, update, reorder, remove sections
 */

import { create } from "zustand";
import type { BuilderSchema, PageConfig, Section, ThemeSettings } from "./types";
import { sectionRegistry } from "./registry";

/* ─── Default Theme ────────────────────────────────────────── */

const defaultTheme: ThemeSettings = {
  colors: {
    primary: "#008060",
    secondary: "#5c6ac4",
    background: "#ffffff",
    surface: "#f6f6f7",
    elevated: "#ffffff",
    text: "#1a1a1a",
    textMuted: "#6d7175",
    accent: "#b98900",
    border: "#e1e3e5",
  },
  typography: {
    fontFamily: "Inter, system-ui, sans-serif",
    headingFamily: "Inter, system-ui, sans-serif",
    baseSize: "16px",
    headingWeight: "700",
  },
  spacing: {
    sectionPadding: "64px",
    containerMax: "1200px",
    borderRadius: "8px",
  },
};

/* ─── Default Pages ────────────────────────────────────────── */

function uid(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const defaultPages: Record<string, PageConfig> = {
  home: {
    name: "Home Page",
    slug: "home",
    sections: [
      {
        id: uid(),
        type: "HeroBanner",
        visible: true,
        settings: sectionRegistry.find((s) => s.type === "HeroBanner")!.defaultSettings,
      },
      {
        id: uid(),
        type: "SearchBand",
        visible: true,
        settings: sectionRegistry.find((s) => s.type === "SearchBand")!.defaultSettings,
      },
      {
        id: uid(),
        type: "CategoryGrid",
        visible: true,
        settings: sectionRegistry.find((s) => s.type === "CategoryGrid")!.defaultSettings,
      },
      {
        id: uid(),
        type: "CollectionsSection",
        visible: true,
        settings: sectionRegistry.find((s) => s.type === "CollectionsSection")!.defaultSettings,
      },
      {
        id: uid(),
        type: "ProductGrid",
        visible: true,
        settings: sectionRegistry.find((s) => s.type === "ProductGrid")!.defaultSettings,
      },
      {
        id: uid(),
        type: "PromisesSection",
        visible: true,
        settings: sectionRegistry.find((s) => s.type === "PromisesSection")!.defaultSettings,
      },
      {
        id: uid(),
        type: "Newsletter",
        visible: true,
        settings: sectionRegistry.find((s) => s.type === "Newsletter")!.defaultSettings,
      },
      {
        id: uid(),
        type: "SeoArticle",
        visible: true,
        settings: sectionRegistry.find((s) => s.type === "SeoArticle")!.defaultSettings,
      },
    ],
  },
};

/* ─── Store Interface ──────────────────────────────────────── */

interface BuilderStore {
  // Schema
  schema: BuilderSchema;

  // UI State
  activePage: string;
  activeSection: string | null;
  sidebarTab: "sections" | "theme";
  addSectionOpen: boolean;
  isDirty: boolean;

  // Theme actions
  updateTheme: (path: string, value: any) => void;

  // Page actions
  setActivePage: (pageId: string) => void;
  addPage: (pageId: string, name: string) => void;
  removePage: (pageId: string) => void;

  // Section actions
  setActiveSection: (sectionId: string | null) => void;
  addSection: (type: string) => void;
  updateSection: (sectionId: string, key: string, value: any) => void;
  removeSection: (sectionId: string) => void;
  reorderSection: (sectionId: string, direction: "up" | "down") => void;
  toggleSectionVisibility: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;

  // UI actions
  setSidebarTab: (tab: "sections" | "theme") => void;
  setAddSectionOpen: (open: boolean) => void;

  // Persistence
  loadSchema: (schema: BuilderSchema) => void;
  markClean: () => void;
}

/* ─── Store Implementation ─────────────────────────────────── */

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  schema: {
    themeSettings: defaultTheme,
    pages: defaultPages,
  },
  activePage: "home",
  activeSection: null,
  sidebarTab: "sections",
  addSectionOpen: false,
  isDirty: false,

  /* ── Theme ── */
  updateTheme(path, value) {
    set((state) => {
      const schema = structuredClone(state.schema);
      const keys = path.split(".");
      let obj: any = schema.themeSettings;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return { schema, isDirty: true };
    });
  },

  /* ── Pages ── */
  setActivePage(pageId) {
    set({ activePage: pageId, activeSection: null });
  },

  addPage(pageId, name) {
    set((state) => {
      const schema = structuredClone(state.schema);
      schema.pages[pageId] = { name, slug: pageId, sections: [] };
      return { schema, activePage: pageId, activeSection: null, isDirty: true };
    });
  },

  removePage(pageId) {
    set((state) => {
      if (Object.keys(state.schema.pages).length <= 1) return {};
      const schema = structuredClone(state.schema);
      delete schema.pages[pageId];
      const nextPage = Object.keys(schema.pages)[0];
      return { schema, activePage: nextPage, activeSection: null, isDirty: true };
    });
  },

  /* ── Sections ── */
  setActiveSection(sectionId) {
    set({ activeSection: sectionId, sidebarTab: sectionId ? "sections" : get().sidebarTab });
  },

  addSection(type) {
    const def = sectionRegistry.find((s) => s.type === type);
    if (!def) return;
    set((state) => {
      const schema = structuredClone(state.schema);
      const page = schema.pages[state.activePage];
      const newSection: Section = {
        id: uid(),
        type: def.type,
        visible: true,
        settings: { ...def.defaultSettings },
      };
      page.sections.push(newSection);
      return { schema, activeSection: newSection.id, addSectionOpen: false, isDirty: true };
    });
  },

  updateSection(sectionId, key, value) {
    set((state) => {
      const schema = structuredClone(state.schema);
      const page = schema.pages[state.activePage];
      const section = page.sections.find((s) => s.id === sectionId);
      if (section) section.settings[key] = value;
      return { schema, isDirty: true };
    });
  },

  removeSection(sectionId) {
    set((state) => {
      const schema = structuredClone(state.schema);
      const page = schema.pages[state.activePage];
      page.sections = page.sections.filter((s) => s.id !== sectionId);
      return {
        schema,
        activeSection: state.activeSection === sectionId ? null : state.activeSection,
        isDirty: true,
      };
    });
  },

  reorderSection(sectionId, direction) {
    set((state) => {
      const schema = structuredClone(state.schema);
      const sections = schema.pages[state.activePage].sections;
      const idx = sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return {};
      const newIdx = direction === "up" ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= sections.length) return {};
      [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
      return { schema, isDirty: true };
    });
  },

  toggleSectionVisibility(sectionId) {
    set((state) => {
      const schema = structuredClone(state.schema);
      const section = schema.pages[state.activePage].sections.find((s) => s.id === sectionId);
      if (section) section.visible = !section.visible;
      return { schema, isDirty: true };
    });
  },

  duplicateSection(sectionId) {
    set((state) => {
      const schema = structuredClone(state.schema);
      const page = schema.pages[state.activePage];
      const idx = page.sections.findIndex((s) => s.id === sectionId);
      if (idx < 0) return {};
      const clone: Section = { ...structuredClone(page.sections[idx]), id: uid() };
      page.sections.splice(idx + 1, 0, clone);
      return { schema, activeSection: clone.id, isDirty: true };
    });
  },

  /* ── UI ── */
  setSidebarTab(tab) { set({ sidebarTab: tab }); },
  setAddSectionOpen(open) { set({ addSectionOpen: open }); },

  /* ── Persistence ── */
  loadSchema(schema) {
    set({ schema, isDirty: false, activePage: Object.keys(schema.pages)[0] || "home", activeSection: null });
  },
  markClean() { set({ isDirty: false }); },
}));
