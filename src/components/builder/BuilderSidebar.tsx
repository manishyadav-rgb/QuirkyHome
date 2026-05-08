/**
 * Builder Sidebar — Section Management & Theme Settings
 * 
 * Two tabs: "Sections" shows the section list + section editor,
 * "Theme" shows the global theme settings editor.
 */

"use client";

import React from "react";
import {
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  Copy,
  Eye,
  EyeOff,
  Grip,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useBuilderStore } from "@/lib/builder/store";
import { sectionRegistry, getSectionDef } from "@/lib/builder/registry";
import type { FieldSchema, Section } from "@/lib/builder/types";

/* ─── Field Renderer ───────────────────────────────────────── */

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldSchema;
  value: any;
  onChange: (val: any) => void;
}) {
  const base = "w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] text-[#202223] transition-colors focus:border-[#5c6ac4] focus:outline-none focus:ring-1 focus:ring-[#5c6ac4]/30";

  switch (field.type) {
    case "text":
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={base}
        />
      );
    case "textarea":
      return (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={base + " resize-y"}
        />
      );
    case "number":
      return (
        <input
          type="number"
          value={value ?? 0}
          onChange={(e) => onChange(Number(e.target.value))}
          className={base}
        />
      );
    case "color":
      return (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={value ?? "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-12 cursor-pointer rounded-md border border-[#c9cccf] p-0.5"
          />
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className={base + " flex-1"}
          />
        </div>
      );
    case "select":
      return (
        <select
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className={base}
        >
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case "image":
      return (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... image URL"
          className={base}
        />
      );
    case "toggle":
      return (
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            value ? "bg-[#008060]" : "bg-[#c9cccf]"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              value ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      );
    default:
      return null;
  }
}

/* ─── Section Editor ───────────────────────────────────────── */

function SectionEditor({ section }: { section: Section }) {
  const updateSection = useBuilderStore((s) => s.updateSection);
  const setActiveSection = useBuilderStore((s) => s.setActiveSection);
  const def = getSectionDef(section.type);

  if (!def) return null;

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setActiveSection(null)}
        className="mb-3 flex items-center gap-1.5 text-[13px] font-medium text-[#5c6ac4] hover:underline"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Back to sections
      </button>
      <h3 className="mb-4 text-[15px] font-semibold text-[#202223]">{def.label}</h3>
      <div className="grid gap-4">
        {def.fields.map((field) => (
          <div key={field.key}>
            <label className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-[#6d7175]">
              {field.label}
            </label>
            <FieldInput
              field={field}
              value={section.settings[field.key]}
              onChange={(val) => updateSection(section.id, field.key, val)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Theme Editor ─────────────────────────────────────────── */

function ThemeEditor() {
  const theme = useBuilderStore((s) => s.schema.themeSettings);
  const updateTheme = useBuilderStore((s) => s.updateTheme);

  const colorFields = [
    { path: "colors.primary", label: "Primary" },
    { path: "colors.secondary", label: "Secondary" },
    { path: "colors.background", label: "Background" },
    { path: "colors.surface", label: "Surface" },
    { path: "colors.text", label: "Text" },
    { path: "colors.textMuted", label: "Text Muted" },
    { path: "colors.accent", label: "Accent" },
    { path: "colors.border", label: "Border" },
  ];

  const typoFields = [
    { path: "typography.fontFamily", label: "Font Family", type: "text" as const },
    { path: "typography.headingFamily", label: "Heading Font", type: "text" as const },
    { path: "typography.baseSize", label: "Base Size", type: "text" as const },
    { path: "typography.headingWeight", label: "Heading Weight", type: "select" as const, options: [
      { label: "Normal (400)", value: "400" },
      { label: "Medium (500)", value: "500" },
      { label: "Semi-bold (600)", value: "600" },
      { label: "Bold (700)", value: "700" },
      { label: "Extra Bold (800)", value: "800" },
    ]},
  ];

  const spacingFields = [
    { path: "spacing.sectionPadding", label: "Section Padding" },
    { path: "spacing.containerMax", label: "Container Max Width" },
    { path: "spacing.borderRadius", label: "Border Radius" },
  ];

  function getVal(path: string): any {
    const keys = path.split(".");
    let obj: any = theme;
    for (const k of keys) obj = obj?.[k];
    return obj;
  }

  return (
    <div className="grid gap-6">
      {/* Colors */}
      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#202223]">Colors</h3>
        <div className="grid gap-3">
          {colorFields.map((f) => (
            <div key={f.path}>
              <label className="mb-1 block text-[12px] font-medium text-[#6d7175]">{f.label}</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={getVal(f.path) ?? "#000000"}
                  onChange={(e) => updateTheme(f.path, e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-[#c9cccf] p-0.5"
                />
                <input
                  type="text"
                  value={getVal(f.path) ?? ""}
                  onChange={(e) => updateTheme(f.path, e.target.value)}
                  className="flex-1 rounded-lg border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] text-[#202223] focus:border-[#5c6ac4] focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography */}
      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#202223]">Typography</h3>
        <div className="grid gap-3">
          {typoFields.map((f) => (
            <div key={f.path}>
              <label className="mb-1 block text-[12px] font-medium text-[#6d7175]">{f.label}</label>
              {f.type === "select" ? (
                <select
                  value={getVal(f.path) ?? ""}
                  onChange={(e) => updateTheme(f.path, e.target.value)}
                  className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] focus:border-[#5c6ac4] focus:outline-none"
                >
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={getVal(f.path) ?? ""}
                  onChange={(e) => updateTheme(f.path, e.target.value)}
                  className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] focus:border-[#5c6ac4] focus:outline-none"
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Spacing */}
      <div>
        <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#202223]">Spacing</h3>
        <div className="grid gap-3">
          {spacingFields.map((f) => (
            <div key={f.path}>
              <label className="mb-1 block text-[12px] font-medium text-[#6d7175]">{f.label}</label>
              <input
                type="text"
                value={getVal(f.path) ?? ""}
                onChange={(e) => updateTheme(f.path, e.target.value)}
                className="w-full rounded-lg border border-[#c9cccf] bg-white px-3 py-2 text-[13px] focus:border-[#5c6ac4] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Section List ─────────────────────────────────────────── */

function SectionList() {
  const schema = useBuilderStore((s) => s.schema);
  const activePage = useBuilderStore((s) => s.activePage);
  const activeSection = useBuilderStore((s) => s.activeSection);
  const setActiveSection = useBuilderStore((s) => s.setActiveSection);
  const removeSection = useBuilderStore((s) => s.removeSection);
  const reorderSection = useBuilderStore((s) => s.reorderSection);
  const toggleVis = useBuilderStore((s) => s.toggleSectionVisibility);
  const duplicateSection = useBuilderStore((s) => s.duplicateSection);
  const setAddSectionOpen = useBuilderStore((s) => s.setAddSectionOpen);

  const page = schema.pages[activePage];
  if (!page) return null;

  const editingSection = page.sections.find((s) => s.id === activeSection);
  if (editingSection) {
    return <SectionEditor section={editingSection} />;
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[#202223]">Sections</h3>
        <button
          onClick={() => setAddSectionOpen(true)}
          className="flex items-center gap-1 rounded-md bg-[#008060] px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#006e52]"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>
      {page.sections.length === 0 ? (
        <p className="text-center text-[13px] text-[#8c9196] py-8">No sections — click "Add" to start building</p>
      ) : (
        <div className="grid gap-1">
          {page.sections.map((section, idx) => {
            const def = getSectionDef(section.type);
            return (
              <div
                key={section.id}
                className={`group flex items-center gap-2 rounded-lg border px-3 py-2.5 transition-all cursor-pointer ${
                  section.id === activeSection
                    ? "border-[#5c6ac4] bg-[#f4f5f7]"
                    : "border-[#e1e3e5] bg-white hover:border-[#c9cccf] hover:bg-[#f9fafb]"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <Grip className="h-3.5 w-3.5 shrink-0 text-[#c9cccf]" />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-[13px] font-medium ${section.visible ? "text-[#202223]" : "text-[#8c9196] line-through"}`}>
                    {def?.label || section.type}
                  </p>
                </div>
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button onClick={(e) => { e.stopPropagation(); reorderSection(section.id, "up"); }} className="rounded p-1 text-[#6d7175] hover:bg-[#e1e3e5]" title="Move up" disabled={idx === 0}>
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); reorderSection(section.id, "down"); }} className="rounded p-1 text-[#6d7175] hover:bg-[#e1e3e5]" title="Move down" disabled={idx === page.sections.length - 1}>
                    <ArrowDown className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); toggleVis(section.id); }} className="rounded p-1 text-[#6d7175] hover:bg-[#e1e3e5]" title="Toggle visibility">
                    {section.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); duplicateSection(section.id); }} className="rounded p-1 text-[#6d7175] hover:bg-[#e1e3e5]" title="Duplicate">
                    <Copy className="h-3 w-3" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); removeSection(section.id); }} className="rounded p-1 text-[#d72c0d] hover:bg-[#fff4f4]" title="Delete">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Add Section Modal ────────────────────────────────────── */

function AddSectionPanel() {
  const addSection = useBuilderStore((s) => s.addSection);
  const setAddSectionOpen = useBuilderStore((s) => s.setAddSectionOpen);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-semibold text-[#202223]">Add section</h3>
          <button onClick={() => setAddSectionOpen(false)} className="rounded-md p-1 text-[#6d7175] hover:bg-[#f4f6f8]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid gap-2">
          {sectionRegistry.map((def) => (
            <button
              key={def.type}
              onClick={() => addSection(def.type)}
              className="flex items-center gap-3 rounded-lg border border-[#e1e3e5] px-4 py-3 text-left transition-all hover:border-[#008060] hover:bg-[#f9fafb]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#f4f6f8] text-[14px] text-[#6d7175]">
                {def.icon.slice(0, 2)}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-[#202223]">{def.label}</p>
                <p className="text-[12px] text-[#8c9196]">{def.fields.length} settings</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Sidebar ─────────────────────────────────────────── */

export function BuilderSidebar() {
  const sidebarTab = useBuilderStore((s) => s.sidebarTab);
  const setSidebarTab = useBuilderStore((s) => s.setSidebarTab);
  const addSectionOpen = useBuilderStore((s) => s.addSectionOpen);
  const activeSection = useBuilderStore((s) => s.activeSection);

  return (
    <>
      <div className="flex h-full w-[320px] shrink-0 flex-col border-r border-[#e1e3e5] bg-white">
        {/* Tabs */}
        {!activeSection && (
          <div className="flex border-b border-[#e1e3e5]">
            {(["sections", "theme"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setSidebarTab(tab)}
                className={`flex-1 py-3 text-center text-[13px] font-semibold transition-colors ${
                  sidebarTab === tab
                    ? "border-b-2 border-[#5c6ac4] text-[#202223]"
                    : "text-[#6d7175] hover:text-[#202223]"
                }`}
              >
                {tab === "sections" ? "Sections" : "Theme Settings"}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4" style={{ scrollbarWidth: "thin" }}>
          {sidebarTab === "sections" ? <SectionList /> : <ThemeEditor />}
        </div>
      </div>

      {addSectionOpen && <AddSectionPanel />}
    </>
  );
}
