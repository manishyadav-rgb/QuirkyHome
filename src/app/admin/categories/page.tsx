"use client";

import { useEffect, useMemo, useState } from "react";
import { FolderTree, Pencil, Plus, Save, Search, Trash2, X } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(Array.isArray(data.categories) ? data.categories : []);
  }

  useEffect(() => {
    loadCategories().finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setName("");
    setSlug("");
    setDescription("");
    setImageUrl("");
    setIsActive(true);
    setEditing(null);
    setShowCreate(false);
  }

  function startEdit(category: Category) {
    setEditing(category);
    setShowCreate(false);
    setName(category.name || "");
    setSlug(category.slug || "");
    setDescription(category.description || "");
    setImageUrl(category.image_url || "");
    setIsActive(category.is_active !== false);
  }

  async function createCategory() {
    if (!name.trim()) return setMessage("Category name is required");
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slugify(slug || name),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create category");
      setMessage(`Category "${name.trim()}" saved.`);
      await loadCategories();
      resetForm();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setSaving(false);
    }
  }

  async function updateCategory() {
    if (!editing) return;
    if (!name.trim()) return setMessage("Category name is required");
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editing.id,
          name: name.trim(),
          slug: slugify(slug || name),
          description: description.trim() || null,
          image_url: imageUrl.trim() || null,
          is_active: isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update category");
      setMessage(`Category "${name.trim()}" updated.`);
      await loadCategories();
      resetForm();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  async function removeCategory(id: string) {
    if (!confirm("Delete this category?")) return;
    setMessage("");
    const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return setMessage(data.error || "Failed to delete category");
    if (editing?.id === id) resetForm();
    setMessage("Category deleted.");
    await loadCategories();
  }

  const filtered = useMemo(
    () =>
      categories.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase()),
      ),
    [categories, search],
  );

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#202223]">Categories</h2>
          <p className="mt-0.5 text-[13px] text-[#6d7175]">{categories.length} categories in your store</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowCreate(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006e52]"
        >
          <Plus className="h-4 w-4" />
          Add category
        </button>
      </div>

      {message && (
        <div className="rounded-md border border-[#b6d3b2] bg-[#e3f1df] px-4 py-2.5 text-[13px] font-medium text-[#202223]">
          {message}
        </div>
      )}

      {(showCreate || editing) && (
        <div className="rounded-lg border border-[#e1e3e5] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#202223]">{editing ? "Edit category" : "Create category"}</h3>
            <button onClick={resetForm} className="text-[#6d7175] hover:text-[#202223]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#202223]">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-md border border-[#c9cccf] px-3 py-2 text-[14px] focus:border-[#008060] focus:outline-none focus:ring-2 focus:ring-[#008060]/20" />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#202223]">Slug</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-name" className="w-full rounded-md border border-[#c9cccf] px-3 py-2 text-[14px] focus:border-[#008060] focus:outline-none focus:ring-2 focus:ring-[#008060]/20" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[13px] font-medium text-[#202223]">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-md border border-[#c9cccf] px-3 py-2 text-[14px] focus:border-[#008060] focus:outline-none focus:ring-2 focus:ring-[#008060]/20" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[13px] font-medium text-[#202223]">Image URL</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-md border border-[#c9cccf] px-3 py-2 text-[14px] focus:border-[#008060] focus:outline-none focus:ring-2 focus:ring-[#008060]/20" />
            </div>
            <label className="inline-flex items-center gap-2 text-[13px] text-[#202223]">
              <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[#008060]" />
              Active category
            </label>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={editing ? updateCategory : createCategory}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#006e52] disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : editing ? "Save changes" : "Create category"}
            </button>
            <button onClick={resetForm} className="rounded-md border border-[#d6d9dc] bg-white px-3 py-2 text-[13px] font-semibold text-[#202223] hover:bg-[#f6f6f7]">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#e1e3e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#e1e3e5] px-4 py-3">
          <div className="flex items-center gap-2 rounded-md border border-[#c9cccf] bg-[#f6f6f7] px-3 py-1.5 focus-within:border-[#008060] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#008060]/20">
            <Search className="h-4 w-4 text-[#8c9196]" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search categories..." className="w-full border-0 bg-transparent text-[13px] text-[#202223] placeholder:text-[#b5b5b5] focus:outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e1e3e5] border-t-[#008060]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FolderTree className="mx-auto h-10 w-10 text-[#c9cccf]" />
            <p className="mt-3 text-[14px] font-medium text-[#6d7175]">No categories found</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e1e3e5]">
            {filtered.map((category) => (
              <div key={category.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[#f9fafb]">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-[#202223]">{category.name}</p>
                  <p className="truncate text-[12px] text-[#8c9196]">/{category.slug}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${category.is_active ? "bg-[#e3f1df] text-[#008060]" : "bg-[#f4f6f8] text-[#6d7175]"}`}>
                  {category.is_active ? "Active" : "Inactive"}
                </span>
                <button onClick={() => startEdit(category)} className="rounded-md p-1.5 text-[#6d7175] hover:bg-[#f1f3f5] hover:text-[#202223]">
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => removeCategory(category.id)} className="rounded-md p-1.5 text-[#8c9196] hover:bg-[#fff4f4] hover:text-[#d72c0d]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
