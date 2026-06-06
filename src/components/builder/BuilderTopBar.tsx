/**
 * Builder Top Bar — Page switcher, save, and undo
 */

"use client";

import { useState } from "react";
import { ChevronDown, Eye, Loader2, Monitor, Plus, Save, Smartphone, Undo2 } from "lucide-react";
import { useBuilderStore } from "@/lib/builder/store";
import { useSiteContext } from "@/lib/site-context";

export function BuilderTopBar() {
  const schema = useBuilderStore((s) => s.schema);
  const activePage = useBuilderStore((s) => s.activePage);
  const setActivePage = useBuilderStore((s) => s.setActivePage);
  const addPage = useBuilderStore((s) => s.addPage);
  const isDirty = useBuilderStore((s) => s.isDirty);
  const markClean = useBuilderStore((s) => s.markClean);
  const activeSiteId = useSiteContext((s) => s.activeSiteId);
  const sites = useSiteContext((s) => s.sites);
  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0];

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pageDropdown, setPageDropdown] = useState(false);
  const [newPageName, setNewPageName] = useState("");

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schema, site_id: activeSiteId }),
      });
      if (res.ok) {
        markClean();
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleAddPage() {
    if (!newPageName.trim()) return;
    const slug = newPageName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    addPage(slug, newPageName);
    setNewPageName("");
    setPageDropdown(false);
  }

  const pages = Object.entries(schema.pages);
  const currentPage = schema.pages[activePage];

  return (
    <div className="flex h-14 items-center justify-between border-b border-[#e1e3e5] bg-[#1a1a1a] px-4">
      {/* Left - Logo + Page Switcher */}
      <div className="flex items-center gap-4">
        <a href="/qh-admin" className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: activeSite.color }}>
          {activeSite.logo}
        </a>

        {/* Page Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPageDropdown(!pageDropdown)}
            className="flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-[#333]"
          >
            <span>{currentPage?.name || "Select page"}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[#a6acb2]" />
          </button>

          {pageDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setPageDropdown(false)} />
              <div className="absolute left-0 top-full z-50 mt-1 w-64 rounded-lg border border-[#e1e3e5] bg-white py-1 shadow-lg">
                <p className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#6d7175]">Pages</p>
                {pages.map(([id, page]) => (
                  <button
                    key={id}
                    onClick={() => { setActivePage(id); setPageDropdown(false); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[#f9fafb] ${
                      id === activePage ? "bg-[#f4f6f8] font-semibold text-[#202223]" : "text-[#6d7175]"
                    }`}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    {page.name}
                  </button>
                ))}
                <div className="border-t border-[#e1e3e5] px-3 py-2">
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={newPageName}
                      onChange={(e) => setNewPageName(e.target.value)}
                      placeholder="New page name"
                      className="flex-1 rounded-md border border-[#c9cccf] px-2 py-1.5 text-[12px] focus:border-[#5c6ac4] focus:outline-none"
                      onKeyDown={(e) => e.key === "Enter" && handleAddPage()}
                    />
                    <button onClick={handleAddPage} className="rounded-md bg-[#008060] p-1.5 text-white hover:bg-[#006e52]">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right - Save */}
      <div className="flex items-center gap-2">
        {isDirty && (
          <span className="rounded-full bg-[#ffd79d] px-2.5 py-0.5 text-[11px] font-semibold text-[#7a4b05]">
            Unsaved changes
          </span>
        )}
        {saved && (
          <span className="rounded-full bg-[#b6d3b2] px-2.5 py-0.5 text-[11px] font-semibold text-[#1a472a]">
            ✓ Saved
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className="flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-2 text-[13px] font-semibold text-white shadow transition-colors hover:bg-[#006e52] disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save
        </button>
      </div>
    </div>
  );
}
