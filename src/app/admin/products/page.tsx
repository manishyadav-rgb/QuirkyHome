"use client";

import Image from "next/image";
import { AlertCircle, Images, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/data/products";

type AdminProduct = {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  collection: string | null;
  sale_price: string | null;
  mrp: string | null;
  quantity_available: number | null;
  image_url: string | null;
  category: string | null;
  is_active: boolean;
};

const MAX_IMAGES = 10;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [imageInputs, setImageInputs] = useState<string[]>(Array(MAX_IMAGES).fill(""));
  const [imageLoading, setImageLoading] = useState(false);
  const [imageSaving, setImageSaving] = useState(false);

  async function loadProducts() {
    setLoading(true);
    const response = await fetch("/api/admin/products");
    const data = await response.json();
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function deleteProduct(id: string) {
    setMessage("");
    const response = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Failed to delete product");
      return;
    }

    setMessage("Product deleted from PostgreSQL. DynamoDB was not touched.");
    await loadProducts();
  }

  async function clearAllProducts() {
    if (!confirm("Are you sure you want to clear ALL products? This action cannot be undone.")) return;
    setMessage("");
    const response = await fetch("/api/admin/products?clearAll=1", { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setMessage(data.error ?? "Failed to clear products");
      return;
    }

    setMessage("All PostgreSQL products cleared. Import fresh products from DynamoDB.");
    await loadProducts();
  }

  async function openImageEditor(product: AdminProduct) {
    setEditing(product);
    setImageLoading(true);
    try {
      const response = await fetch(`/api/admin/products?id=${encodeURIComponent(product.id)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to load product images");

      const gallery = Array.isArray(data.gallery_images) ? data.gallery_images : [];
      const next = [...gallery.slice(0, MAX_IMAGES)];
      while (next.length < MAX_IMAGES) next.push("");
      setImageInputs(next);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to load images");
      setImageInputs(Array(MAX_IMAGES).fill(""));
    } finally {
      setImageLoading(false);
    }
  }

  function closeImageEditor() {
    setEditing(null);
    setImageInputs(Array(MAX_IMAGES).fill(""));
    setImageLoading(false);
    setImageSaving(false);
  }

  function updateImageAt(index: number, value: string) {
    setImageInputs((current) => {
      const next = [...current];
      next[index] = value;
      return next;
    });
  }

  const previewImages = useMemo(() => imageInputs.map((x) => x.trim()).filter(Boolean), [imageInputs]);

  async function saveImages() {
    if (!editing) return;

    const cleaned = previewImages.slice(0, MAX_IMAGES);
    if (cleaned.length === 0) {
      setMessage("At least one image URL is required.");
      return;
    }

    setImageSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, images: cleaned }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save images");

      setMessage(`${editing.title}: ${cleaned.length} images saved.`);
      await loadProducts();
      closeImageEditor();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save images");
    } finally {
      setImageSaving(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="grid gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#202223]">Products</h2>
          <p className="mt-0.5 text-[13px] text-[#6d7175]">{products.length} products in your store</p>
        </div>
        <div className="flex gap-2">
          <button onClick={clearAllProducts} className="inline-flex items-center gap-1.5 rounded-md border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#202223] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#f6f6f7]">
            <Trash2 className="h-3.5 w-3.5" />
            Clear All
          </button>
          <a href="/add-product" className="inline-flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-1.5 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006e52]">
            Add product
          </a>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-[#b6d3b2] bg-[#e3f1df] px-4 py-3 text-[13px] font-medium text-[#202223]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#008060]" />
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-[#e1e3e5] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
        <div className="border-b border-[#e1e3e5] px-4 py-3">
          <div className="flex items-center gap-2 rounded-md border border-[#c9cccf] bg-[#f6f6f7] px-3 py-1.5 focus-within:border-[#008060] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#008060]/20">
            <Search className="h-4 w-4 text-[#8c9196]" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full border-0 bg-transparent text-[13px] text-[#202223] placeholder:text-[#b5b5b5] focus:outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e1e3e5] border-t-[#008060]" />
            <p className="mt-3 text-[13px] text-[#8c9196]">Loading products...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Trash2 className="mx-auto h-10 w-10 text-[#c9cccf]" />
            <p className="mt-3 text-[14px] font-medium text-[#6d7175]">{search ? "No products match your search" : "No products published yet"}</p>
            <p className="mt-1 text-[13px] text-[#8c9196]">{search ? "Try a different search term" : "Add products from the Add Product page"}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e1e3e5]">
            <div className="hidden grid-cols-[4rem_1fr_8rem_6rem_5rem_12rem] items-center gap-4 bg-[#fafbfc] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#6d7175] md:grid">
              <span />
              <span>Product</span>
              <span>Collection</span>
              <span className="text-right">Price</span>
              <span className="text-right">Stock</span>
              <span className="text-right">Actions</span>
            </div>

            {filtered.map((product) => (
              <div key={product.id} className="group grid grid-cols-[4rem_1fr_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-[#f9fafb] md:grid-cols-[4rem_1fr_8rem_6rem_5rem_12rem]">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-[#e1e3e5] bg-[#f6f6f7]">
                  {product.image_url ? <Image src={product.image_url} alt={product.title} fill sizes="3.5rem" className="object-cover" /> : <div className="flex h-full items-center justify-center text-[10px] text-[#b5b5b5]">No img</div>}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#202223]">{product.title}</p>
                  <p className="mt-0.5 truncate text-[12px] text-[#8c9196]">/{product.slug}{product.sku ? ` · ${product.sku}` : ""}</p>
                </div>
                <p className="hidden text-[13px] text-[#6d7175] md:block">{product.collection ?? "-"}</p>
                <p className="hidden text-right text-[13px] font-medium text-[#202223] md:block">{formatPrice(Number(product.sale_price ?? product.mrp ?? 0))}</p>
                <p className="hidden text-right text-[13px] text-[#6d7175] md:block">{product.quantity_available ?? 0}</p>
                <div className="flex items-center justify-end gap-2">
                  <button onClick={() => openImageEditor(product)} className="inline-flex items-center gap-1.5 rounded-md border border-[#d6d9dc] bg-white px-2.5 py-1.5 text-[12px] font-semibold text-[#202223] hover:bg-[#f6f6f7]">
                    <Images className="h-3.5 w-3.5" />
                    Edit Images
                  </button>
                  <button onClick={() => deleteProduct(product.id)} className="flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-[#8c9196] transition-all hover:border-[#d72c0d] hover:bg-[#fff4f4] hover:text-[#d72c0d]" title="Delete product">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40 p-0 md:items-center md:justify-center md:p-6">
          <div className="w-full rounded-t-2xl bg-white md:max-w-4xl md:rounded-2xl">
            <div className="flex items-center justify-between border-b border-[#e1e3e5] px-5 py-4">
              <div>
                <h3 className="text-[18px] font-semibold text-[#202223]">Edit Product Images</h3>
                <p className="text-[12px] text-[#6d7175]">{editing.title} · up to 10 image URLs</p>
              </div>
              <button onClick={closeImageEditor} className="rounded-md p-1 text-[#6d7175] hover:bg-[#f6f6f7]">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <div className="grid gap-2">
                {Array.from({ length: MAX_IMAGES }).map((_, index) => (
                  <input key={index} type="url" value={imageInputs[index]} onChange={(e) => updateImageAt(index, e.target.value)} placeholder={`Image URL ${index + 1}`} className="rounded-md border border-[#c9cccf] px-3 py-2 text-[13px] focus:border-[#008060] focus:outline-none focus:ring-2 focus:ring-[#008060]/20" />
                ))}
              </div>

              <div>
                <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-[#6d7175]">Preview ({previewImages.length})</p>
                <div className="grid max-h-[360px] grid-cols-3 gap-2 overflow-auto rounded-lg border border-[#e1e3e5] bg-[#fafbfc] p-2">
                  {imageLoading ? (
                    <div className="col-span-3 py-8 text-center text-[13px] text-[#8c9196]">Loading images...</div>
                  ) : previewImages.length > 0 ? (
                    previewImages.map((src, i) => (
                      <div key={`${src}-${i}`} className="relative aspect-square overflow-hidden rounded-md border border-[#e1e3e5] bg-white">
                        <Image src={src} alt={`Preview ${i + 1}`} fill sizes="160px" className="object-cover" />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-8 text-center text-[13px] text-[#8c9196]">Add image URLs to preview.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#e1e3e5] px-5 py-4">
              <button onClick={closeImageEditor} className="rounded-md border border-[#d6d9dc] bg-white px-4 py-2 text-[13px] font-semibold text-[#202223] hover:bg-[#f6f6f7]">Cancel</button>
              <button onClick={saveImages} disabled={imageSaving || imageLoading} className="inline-flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-2 text-[13px] font-semibold text-white hover:bg-[#006e52] disabled:opacity-50">
                <Save className="h-4 w-4" />
                {imageSaving ? "Saving..." : "Save Images"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
