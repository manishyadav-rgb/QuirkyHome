"use client";

import { RefreshCcw, ShieldCheck, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPrice } from "@/data/products";

type InventoryItem = {
  source_pk: string;
  source_sk?: string;
  sku: string;
  title: string;
  slug: string;
  category: string;
  collection: string;
  description: string;
  image_url: string;
  mrp: number;
  sale_price: number;
  quantity_available: number;
  raw: Record<string, unknown>;
};

export default function AddProductPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [importingSku, setImportingSku] = useState("");
  const [publishingSelected, setPublishingSelected] = useState(false);
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [readingStructure, setReadingStructure] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<string[]>([]);
  const [existingSkus, setExistingSkus] = useState<Set<string>>(new Set());

  async function loadExistingSkus() {
    const response = await fetch("/api/admin/products?skus=1");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error ?? "Failed to read existing SKUs");
    const skus = Array.isArray(data.skus) ? data.skus : [];
    const skuSet = new Set(skus.map((sku: string) => sku.toUpperCase()));
    setExistingSkus(skuSet);
    return skuSet;
  }

  async function loadInventory(next: string | null = null, history?: string[], skuSet?: Set<string>) {
    setLoading(true);
    setMessage("");
    try {
      const params = new URLSearchParams();
      params.set("limit", "10");
      if (next) params.set("cursor", next);
      const response = await fetch(`/api/admin/inventory/dynamodb?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to read DynamoDB inventory");
      const blockedSkus = skuSet ?? existingSkus;
      const filteredItems = (data.items ?? []).filter((item: InventoryItem) => !blockedSkus.has(item.sku.toUpperCase()));
      setItems(filteredItems);
      setSelectedMap({});
      setCursor(next);
      setNextCursor(data.nextCursor ?? null);
      if (history) setCursorHistory(history);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to read DynamoDB inventory");
    } finally {
      setLoading(false);
    }
  }

  async function importProduct(item: InventoryItem) {
    setImportingSku(item.sku);
    setMessage("");
    try {
      const response = await fetch("/api/admin/inventory/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to publish product");
      setMessage(`${item.title} published to PostgreSQL. DynamoDB was not modified.`);
      const skuSet = await loadExistingSkus();
      await loadInventory(cursor, undefined, skuSet);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to publish product");
    } finally {
      setImportingSku("");
    }
  }

  function itemKey(item: InventoryItem) {
    return `${item.source_pk}-${item.source_sk ?? item.sku}`;
  }

  function toggleSelect(item: InventoryItem) {
    const key = itemKey(item);
    setSelectedMap((current) => ({ ...current, [key]: !current[key] }));
  }

  const selectedCount = Object.values(selectedMap).filter(Boolean).length;

  async function publishSelected() {
    const selectedItems = items.filter((item) => selectedMap[itemKey(item)]);
    if (!selectedItems.length) {
      setMessage("Select at least one product to publish.");
      return;
    }

    setPublishingSelected(true);
    setMessage("");
    try {
      for (const item of selectedItems) {
        const response = await fetch("/api/admin/inventory/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error ?? `Failed to publish ${item.sku}`);
      }

      setMessage(`${selectedItems.length} products published to PostgreSQL. They will appear on the storefront cards.`);
      setSelectedMap({});
      const skuSet = await loadExistingSkus();
      await loadInventory(cursor, undefined, skuSet);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to publish selected products");
    } finally {
      setPublishingSelected(false);
    }
  }

  async function readTableStructure() {
    setReadingStructure(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/inventory/dynamodb?limit=10&debug=1");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Failed to read table structure");
      const top = (data.structure?.topLevelKeys ?? []).slice(0, 12).map((entry: { key: string }) => entry.key).join(", ");
      setMessage(`Table: ${data.table}. Top keys found: ${top || "none"}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to read table structure");
    } finally {
      setReadingStructure(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const skuSet = await loadExistingSkus();
        await loadInventory(null, undefined, skuSet);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to load inventory");
        setLoading(false);
      }
    })();
  }, []);

  function handleNextPage() {
    if (!nextCursor) return;
    const history = [...cursorHistory, cursor ?? ""];
    loadInventory(nextCursor, history);
  }

  function handlePreviousPage() {
    if (!cursorHistory.length) return;
    const history = [...cursorHistory];
    const previous = history.pop() ?? "";
    loadInventory(previous || null, history);
  }

  return (
    <div className="grid gap-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[#202223]">Add product</h2>
          <p className="mt-0.5 text-[13px] text-[#6d7175]">Import from DynamoDB inventory into your PostgreSQL storefront</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={readTableStructure}
            disabled={loading || readingStructure}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#202223] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#f6f6f7] disabled:opacity-50"
          >
            {readingStructure ? "Reading..." : "Read Structure"}
          </button>
          <button
            onClick={() => loadInventory(cursor)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#202223] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#f6f6f7] disabled:opacity-50"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-2.5 rounded-lg border border-[#b6d3b2] bg-[#e3f1df] px-4 py-3 text-[13px] font-medium text-[#202223]">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#008060]" />
        <span>DynamoDB is read-only. Selected products are copied into PostgreSQL for the storefront.</span>
      </div>

      {/* Message */}
      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-[#e1e3e5] bg-[#f6f6f7] px-4 py-3 text-[13px] font-medium text-[#202223]">
          <AlertCircle className="h-4 w-4 shrink-0 text-[#6d7175]" />
          {message}
        </div>
      )}

      {/* Action bar */}
      {selectedCount > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[#008060] bg-[#e3f1df] px-4 py-3">
          <span className="text-[13px] font-semibold text-[#008060]">{selectedCount} product{selectedCount > 1 ? "s" : ""} selected</span>
          <button
            onClick={publishSelected}
            disabled={publishingSelected}
            className="inline-flex items-center gap-1.5 rounded-md bg-[#008060] px-4 py-1.5 text-[13px] font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006e52] disabled:opacity-60"
          >
            {publishingSelected ? "Publishing..." : "Publish selected"}
          </button>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e1e3e5] border-t-[#008060]" />
          <p className="mt-3 text-[13px] text-[#8c9196]">Loading inventory from DynamoDB...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-[#e1e3e5] bg-white py-16 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <p className="text-[14px] font-medium text-[#6d7175]">No new products to import</p>
          <p className="mt-1 text-[13px] text-[#8c9196]">All DynamoDB products are already published</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <article
              key={itemKey(item)}
              className={`overflow-hidden rounded-lg border bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-all ${
                selectedMap[itemKey(item)] ? "border-[#008060] ring-1 ring-[#008060]/20" : "border-[#e1e3e5]"
              }`}
            >
              {/* Image + Checkbox */}
              <div className="relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 items-center justify-center bg-[#f6f6f7] text-[13px] text-[#b5b5b5]">No image</div>
                )}
                <label className="absolute left-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-white/80 bg-white shadow-md">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-[#008060]"
                    checked={Boolean(selectedMap[itemKey(item)])}
                    onChange={() => toggleSelect(item)}
                    aria-label={`Select ${item.title}`}
                  />
                </label>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="line-clamp-2 text-[14px] font-semibold text-[#202223]">{item.title}</h3>

                <div className="mt-3 grid grid-cols-3 gap-2 rounded-md border border-[#e1e3e5] bg-[#fafbfc] p-2.5 text-[11px]">
                  <div>
                    <p className="font-semibold uppercase text-[#8c9196]">SKU</p>
                    <p className="mt-0.5 font-semibold text-[#202223]">{item.sku}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase text-[#8c9196]">Collection</p>
                    <p className="mt-0.5 font-semibold text-[#202223]">{item.collection || "—"}</p>
                  </div>
                  <div>
                    <p className="font-semibold uppercase text-[#8c9196]">Stock</p>
                    <p className="mt-0.5 font-semibold text-[#202223]">{item.quantity_available}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <p className="text-[15px] font-semibold text-[#202223]">{formatPrice(item.sale_price || item.mrp)}</p>
                  <button
                    onClick={() => importProduct(item)}
                    disabled={importingSku === item.sku}
                    className="inline-flex items-center gap-1 rounded-md bg-[#008060] px-3 py-1.5 text-[12px] font-semibold text-white shadow-[0_1px_0_rgba(0,0,0,0.08),inset_0_-1px_0_rgba(0,0,0,0.2)] transition-colors hover:bg-[#006e52] disabled:opacity-60"
                  >
                    {importingSku === item.sku ? "Publishing..." : "Publish"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-[#e1e3e5] bg-white px-4 py-3 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <p className="text-[13px] text-[#6d7175]">Showing 10 items per page</p>
          <div className="flex gap-2">
            <button
              onClick={handlePreviousPage}
              disabled={loading || cursorHistory.length === 0}
              className="inline-flex items-center gap-1 rounded-md border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#202223] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#f6f6f7] disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={loading || !nextCursor}
              className="inline-flex items-center gap-1 rounded-md border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#202223] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#f6f6f7] disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
