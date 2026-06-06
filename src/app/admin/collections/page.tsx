"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, Plus, Trash2, X } from "lucide-react";

type Collection = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  products: string[];
};

type StoreProduct = {
  slug: string;
  title: string;
  image_url: string | null;
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [productSearch, setProductSearch] = useState("");

  async function loadCollections() {
    const res = await fetch("/api/admin/collections?products=1");
    const data = await res.json();
    setCollections(data.collections ?? []);
  }

  async function loadProducts() {
    const res = await fetch("/api/admin/products");
    const data = await res.json();
    setProducts(Array.isArray(data) ? data.map((p: any) => ({ slug: p.slug, title: p.title, image_url: p.image_url })) : []);
  }

  useEffect(() => {
    Promise.all([loadCollections(), loadProducts()]).finally(() => setLoading(false));
  }, []);

  async function handleCreate() {
    if (!name.trim()) { setMessage("Collection name is required"); return; }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, products: selectedSlugs }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`Collection "${name}" created!`);
      setName(""); setDescription(""); setSelectedSlugs([]); setShowCreate(false);
      await loadCollections();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this collection?")) return;
    await fetch(`/api/admin/collections?id=${id}`, { method: "DELETE" });
    await loadCollections();
  }

  function toggleProduct(slug: string) {
    setSelectedSlugs((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  }

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.slug.toLowerCase().includes(productSearch.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e1e3e5] border-t-[#008060]" />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#202223]">Collections</h2>
          <p className="mt-0.5 text-[13px] text-[#6d7175]">{collections.length} collection{collections.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006e52]"
        >
          <Plus className="h-4 w-4" />
          Create collection
        </button>
      </div>

      {message && (
        <div className="rounded-md border border-[#b6d3b2] bg-[#e3f1df] px-4 py-2.5 text-[13px] font-medium text-[#202223]">
          {message}
        </div>
      )}

      {/* Create Panel */}
      {showCreate && (
        <div className="rounded-lg border border-[#e1e3e5] bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#202223]">Create collection</h3>
            <button onClick={() => setShowCreate(false)} className="text-[#6d7175] hover:text-[#202223]">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 grid gap-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#202223]">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Collection"
                className="w-full rounded-md border border-[#c9cccf] px-3 py-2 text-[14px] focus:border-[#008060] focus:outline-none focus:ring-2 focus:ring-[#008060]/20"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#202223]">Description (optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-[#c9cccf] px-3 py-2 text-[14px] focus:border-[#008060] focus:outline-none focus:ring-2 focus:ring-[#008060]/20"
              />
            </div>

            {/* Product Selector */}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-[#202223]">
                Products ({selectedSlugs.length} selected)
              </label>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="mb-2 w-full rounded-md border border-[#c9cccf] px-3 py-2 text-[13px] focus:border-[#008060] focus:outline-none focus:ring-2 focus:ring-[#008060]/20"
              />
              <div className="max-h-60 overflow-y-auto rounded-md border border-[#e1e3e5]">
                {filteredProducts.length === 0 ? (
                  <p className="p-3 text-[13px] text-[#6d7175]">No products found</p>
                ) : (
                  filteredProducts.map((p) => (
                    <label
                      key={p.slug}
                      className={`flex cursor-pointer items-center gap-3 border-b border-[#e1e3e5] px-3 py-2.5 transition-colors last:border-0 hover:bg-[#f9fafb] ${
                        selectedSlugs.includes(p.slug) ? "bg-[#e3f1df]" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedSlugs.includes(p.slug)}
                        onChange={() => toggleProduct(p.slug)}
                        className="h-4 w-4 accent-[#008060]"
                      />
                      {p.image_url && (
                        <img src={p.image_url} alt="" className="h-8 w-8 rounded object-cover" />
                      )}
                      <span className="flex-1 truncate text-[13px] text-[#202223]">{p.title}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleCreate}
              disabled={saving}
              className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#008060] px-4 py-2 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006e52] disabled:opacity-60"
            >
              {saving ? "Creating..." : "Create collection"}
            </button>
          </div>
        </div>
      )}

      {/* Collections List */}
      {collections.length === 0 ? (
        <div className="rounded-lg border border-[#e1e3e5] bg-white py-16 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <LayoutGrid className="mx-auto h-10 w-10 text-[#c9cccf]" />
          <p className="mt-3 text-[14px] font-medium text-[#6d7175]">No collections yet</p>
          <p className="mt-1 text-[13px] text-[#8c9196]">Create your first collection to organize products</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <div key={col.id} className="group rounded-lg border border-[#e1e3e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_1px_3px_rgba(63,63,68,0.12)]">
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-[#202223]">{col.name}</h3>
                    <p className="mt-0.5 text-[12px] text-[#8c9196]">/{col.slug}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(col.id)}
                    className="rounded-md p-1.5 text-[#8c9196] opacity-0 transition-all hover:bg-[#fff4f4] hover:text-[#d72c0d] group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {col.description && (
                  <p className="mt-2 text-[13px] text-[#6d7175]">{col.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2">
                  <span className="rounded-full bg-[#e3f1df] px-2.5 py-0.5 text-[11px] font-semibold text-[#008060]">
                    {col.products.length} product{col.products.length !== 1 ? "s" : ""}
                  </span>
                  {col.is_active && (
                    <span className="rounded-full bg-[#f4f6f8] px-2.5 py-0.5 text-[11px] font-semibold text-[#6d7175]">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
