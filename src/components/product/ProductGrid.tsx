"use client";

import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";
import { useState, useMemo } from "react";
import { SlidersHorizontal, X, ChevronDown, ChevronUp, Check } from "lucide-react";

interface ActiveFilters {
  sortBy: "featured" | "price-asc" | "price-desc" | "rating";
  fastDelivery: boolean;
  colors: string[];
  materials: string[];
  threadCounts: string[];
  designStyles: string[];
}

const defaultFilters: ActiveFilters = {
  sortBy: "featured",
  fastDelivery: false,
  colors: [],
  materials: [],
  threadCounts: [],
  designStyles: [],
};

function getProductProperties(product: Product) {
  const titleLower = product.title.toLowerCase();
  const category = (product.category || "").toLowerCase();

  // Fast Delivery (simulated based on price / title check)
  const fastDelivery = Math.round(product.price) % 2 !== 0;

  // Colors
  const colors: string[] = [];
  if (titleLower.includes("indigo") || titleLower.includes("blue")) colors.push("Blue");
  if (titleLower.includes("sage") || titleLower.includes("green")) colors.push("Green");
  if (titleLower.includes("marigold") || titleLower.includes("yellow") || titleLower.includes("gold") || titleLower.includes("brass")) colors.push("Yellow/Gold");
  if (titleLower.includes("terracotta") || titleLower.includes("clay") || titleLower.includes("spice")) colors.push("Terracotta/Orange");
  if (titleLower.includes("white")) colors.push("White");
  if (colors.length === 0) colors.push("Multi/Earthy");

  // Materials
  let material = "Cotton";
  if (titleLower.includes("wood")) material = "Mango Wood";
  if (titleLower.includes("ceramic")) material = "Ceramic";
  if (titleLower.includes("brass")) material = "Brass";
  if (titleLower.includes("terracotta")) material = "Clay";
  if (titleLower.includes("wicker")) material = "Wicker";

  // Thread Count (Only relevant for bedding)
  let threadCount = "N/A";
  if (category === "bedding" || titleLower.includes("bedsheet") || titleLower.includes("cushion")) {
    if (titleLower.includes("marigold")) threadCount = "210 TC";
    else if (titleLower.includes("indigo")) threadCount = "144 TC";
    else threadCount = "300 TC";
  }

  // Design Styles
  let designStyle = "Modern";
  if (titleLower.includes("block print")) designStyle = "Traditional";
  if (titleLower.includes("ceramic") || titleLower.includes("wood")) designStyle = "Minimalist";
  if (titleLower.includes("brass")) designStyle = "Vintage";
  if (titleLower.includes("wicker")) designStyle = "Rustic";

  return { fastDelivery, colors, material, threadCount, designStyle };
}

function Accordion({
  title,
  isOpen,
  onToggle,
  activeCount,
  children,
}: {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  activeCount: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-1 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors"
      >
        <span className="flex items-center gap-2">
          {title}
          {activeCount > 0 && (
            <span className="inline-flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#432F83]/10 px-1 text-[10px] font-bold text-[#432F83]">
              {activeCount}
            </span>
          )}
        </span>
        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
      </button>
      {isOpen && <div className="mt-2 space-y-2">{children}</div>}
    </div>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActiveFilters>(defaultFilters);

  const openDrawerSection = (sectionKey: string | null) => {
    setIsDrawerOpen(true);
    setExpandedSection(sectionKey);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const toggleExpandedSection = (sectionKey: string) => {
    setExpandedSection(prev => (prev === sectionKey ? null : sectionKey));
  };

  const toggleCheckboxFilter = (key: "colors" | "materials" | "threadCounts" | "designStyles", value: string) => {
    setFilters(prev => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter(x => x !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  };

  const clearAllFilters = () => {
    setFilters(defaultFilters);
  };

  // Compute Active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.fastDelivery) count++;
    count += filters.colors.length;
    count += filters.materials.length;
    count += filters.threadCounts.length;
    count += filters.designStyles.length;
    return count;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0;

  // Filter & Sort computation
  const sortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const props = getProductProperties(product);

      if (filters.fastDelivery && !props.fastDelivery) return false;
      
      if (filters.colors.length > 0 && !props.colors.some(c => filters.colors.includes(c))) return false;
      if (filters.materials.length > 0 && !filters.materials.includes(props.material)) return false;
      if (filters.threadCounts.length > 0 && !filters.threadCounts.includes(props.threadCount)) return false;
      if (filters.designStyles.length > 0 && !filters.designStyles.includes(props.designStyle)) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      if (filters.sortBy === "price-asc") return a.price - b.price;
      if (filters.sortBy === "price-desc") return b.price - a.price;
      if (filters.sortBy === "rating") return b.rating - a.rating;
      return 0; // default featured
    });
  }, [products, filters]);

  return (
    <div className="relative">
      {/* Horizontal filter trigger buttons */}
      <div className="flex flex-nowrap items-center gap-2 mb-6 border-b border-gray-100 pb-4 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap px-4 -mx-4 md:px-0 md:mx-0">
        {/* Main Filter & Sort Trigger */}
        <button
          onClick={() => openDrawerSection(null)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
            hasActiveFilters
              ? "border-[#432F83] bg-[#F3EDFE] text-[#432F83] font-bold"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#432F83]/50 hover:bg-gray-50"
          }`}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Filters & Sort</span>
          {activeFilterCount > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#432F83] px-1 text-[9px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Fast Delivery Quick Filter */}
        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, fastDelivery: !prev.fastDelivery }));
            openDrawerSection("quick-filters");
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
            filters.fastDelivery
              ? "border-[#432F83] bg-[#F3EDFE] text-[#432F83] font-bold"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#432F83]/50 hover:bg-gray-50"
          }`}
        >
          {filters.fastDelivery && <Check className="h-3 w-3" />}
          <span>Fast Delivery</span>
        </button>

        {/* Color Section Trigger */}
        <button
          onClick={() => openDrawerSection("colors")}
          className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
            filters.colors.length > 0
              ? "border-[#432F83] bg-[#F3EDFE] text-[#432F83] font-bold"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#432F83]/50 hover:bg-gray-50"
          }`}
        >
          <span>Color</span>
          {filters.colors.length > 0 ? (
            <span className="font-bold ml-1 text-[10px] bg-[#432F83] text-white rounded-full px-1.5">
              {filters.colors.length}
            </span>
          ) : (
            <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
          )}
        </button>

        {/* Material Section Trigger */}
        <button
          onClick={() => openDrawerSection("materials")}
          className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
            filters.materials.length > 0
              ? "border-[#432F83] bg-[#F3EDFE] text-[#432F83] font-bold"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#432F83]/50 hover:bg-gray-50"
          }`}
        >
          <span>Material</span>
          {filters.materials.length > 0 ? (
            <span className="font-bold ml-1 text-[10px] bg-[#432F83] text-white rounded-full px-1.5">
              {filters.materials.length}
            </span>
          ) : (
            <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
          )}
        </button>

        {/* Thread Count Section Trigger */}
        <button
          onClick={() => openDrawerSection("threadCounts")}
          className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
            filters.threadCounts.length > 0
              ? "border-[#432F83] bg-[#F3EDFE] text-[#432F83] font-bold"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#432F83]/50 hover:bg-gray-50"
          }`}
        >
          <span>Thread Count</span>
          {filters.threadCounts.length > 0 ? (
            <span className="font-bold ml-1 text-[10px] bg-[#432F83] text-white rounded-full px-1.5">
              {filters.threadCounts.length}
            </span>
          ) : (
            <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
          )}
        </button>

        {/* Design Style Section Trigger */}
        <button
          onClick={() => openDrawerSection("designStyles")}
          className={`inline-flex items-center gap-1 px-3.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
            filters.designStyles.length > 0
              ? "border-[#432F83] bg-[#F3EDFE] text-[#432F83] font-bold"
              : "border-gray-200 bg-white text-gray-700 hover:border-[#432F83]/50 hover:bg-gray-50"
          }`}
        >
          <span>Design Style</span>
          {filters.designStyles.length > 0 ? (
            <span className="font-bold ml-1 text-[10px] bg-[#432F83] text-white rounded-full px-1.5">
              {filters.designStyles.length}
            </span>
          ) : (
            <ChevronDown className="h-3 w-3 ml-1 text-gray-400" />
          )}
        </button>
      </div>

      {/* Main Drawer Overlay */}
      {isDrawerOpen && (
        <div
          onClick={closeDrawer}
          className="fixed inset-0 bg-black/50 z-[200] backdrop-blur-xs transition-opacity duration-300"
        />
      )}

      {/* Left side-sliding sidebar drawer */}
      <div
        className={`fixed top-0 left-0 bottom-0 w-80 max-w-[85vw] bg-white z-[210] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4.5 w-4.5 text-[#432F83]" />
            <h3 className="text-sm font-bold text-gray-900">Filters & Sort</h3>
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-bold text-[#432F83] hover:underline"
              >
                Clear All
              </button>
            )}
            <button
              onClick={closeDrawer}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Sort Section */}
          <div className="border-b border-gray-100 pb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">Sort Products</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "featured", label: "Featured" },
                { value: "rating", label: "Best Rated" },
                { value: "price-asc", label: "Price: Low to High" },
                { value: "price-desc", label: "Price: High to Low" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value as any }))}
                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-left border transition-all ${
                    filters.sortBy === option.value
                      ? "border-[#432F83] bg-[#F3EDFE] text-[#432F83]"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Filters Toggle Badges */}
          <div className="border-b border-gray-100 pb-4">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">Quick Filters</h4>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs font-semibold text-gray-700 group-hover:text-gray-900">Fast Delivery</span>
                <input
                  type="checkbox"
                  checked={filters.fastDelivery}
                  onChange={(e) => setFilters(prev => ({ ...prev, fastDelivery: e.target.checked }))}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-[#432F83] focus:ring-[#432F83]/20 accent-[#432F83]"
                />
              </label>
            </div>
          </div>

          {/* Accordion Categories */}
          {/* Colors */}
          <Accordion
            title="Color"
            isOpen={expandedSection === "colors"}
            onToggle={() => toggleExpandedSection("colors")}
            activeCount={filters.colors.length}
          >
            <div className="grid grid-cols-2 gap-2 pt-2">
              {["Blue", "Green", "Yellow/Gold", "Terracotta/Orange", "White", "Multi/Earthy"].map((color) => {
                const isSelected = filters.colors.includes(color);
                return (
                  <button
                    key={color}
                    onClick={() => toggleCheckboxFilter("colors", color)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left text-xs font-medium transition-all ${
                      isSelected
                        ? "border-[#432F83] bg-[#F3EDFE] text-[#432F83] font-bold"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className={`h-3 w-3 rounded-full shrink-0 border ${
                      color === "Blue" ? "bg-blue-600 border-blue-700" :
                      color === "Green" ? "bg-emerald-600 border-emerald-700" :
                      color === "Yellow/Gold" ? "bg-amber-500 border-amber-600" :
                      color === "Terracotta/Orange" ? "bg-orange-600 border-orange-700" :
                      color === "White" ? "bg-white border-gray-300" :
                      "bg-gradient-to-tr from-rose-500 via-emerald-500 to-indigo-500 border-gray-400"
                    }`} />
                    <span className="truncate">{color}</span>
                  </button>
                );
              })}
            </div>
          </Accordion>

          {/* Materials */}
          <Accordion
            title="Material"
            isOpen={expandedSection === "materials"}
            onToggle={() => toggleExpandedSection("materials")}
            activeCount={filters.materials.length}
          >
            <div className="flex flex-col gap-1.5 pt-2">
              {["Cotton", "Mango Wood", "Ceramic", "Brass", "Clay", "Wicker"].map((material) => {
                const isSelected = filters.materials.includes(material);
                return (
                  <label key={material} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckboxFilter("materials", material)}
                      className="h-4 w-4 rounded border-gray-300 text-[#432F83] focus:ring-[#432F83]/20 accent-[#432F83]"
                    />
                    <span>{material}</span>
                  </label>
                );
              })}
            </div>
          </Accordion>

          {/* Thread Count */}
          <Accordion
            title="Thread Count"
            isOpen={expandedSection === "threadCounts"}
            onToggle={() => toggleExpandedSection("threadCounts")}
            activeCount={filters.threadCounts.length}
          >
            <div className="flex flex-col gap-1.5 pt-2">
              {["144 TC", "210 TC", "300 TC"].map((tc) => {
                const isSelected = filters.threadCounts.includes(tc);
                return (
                  <label key={tc} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckboxFilter("threadCounts", tc)}
                      className="h-4 w-4 rounded border-gray-300 text-[#432F83] focus:ring-[#432F83]/20 accent-[#432F83]"
                    />
                    <span>{tc}</span>
                  </label>
                );
              })}
            </div>
          </Accordion>

          {/* Design Style */}
          <Accordion
            title="Design Style"
            isOpen={expandedSection === "designStyles"}
            onToggle={() => toggleExpandedSection("designStyles")}
            activeCount={filters.designStyles.length}
          >
            <div className="flex flex-col gap-1.5 pt-2">
              {["Traditional", "Minimalist", "Vintage", "Rustic", "Modern"].map((style) => {
                const isSelected = filters.designStyles.includes(style);
                return (
                  <label key={style} className="flex items-center gap-2.5 text-xs font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCheckboxFilter("designStyles", style)}
                      className="h-4 w-4 rounded border-gray-300 text-[#432F83] focus:ring-[#432F83]/20 accent-[#432F83]"
                    />
                    <span>{style}</span>
                  </label>
                );
              })}
            </div>
          </Accordion>
        </div>

        {/* Drawer Footer actions */}
        <div className="p-4 border-t border-gray-100 shrink-0 bg-gray-50 flex items-center justify-between gap-3">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">Showing</span>
            <span className="text-xs font-extrabold text-gray-800">{sortedProducts.length} Results</span>
          </div>
          <button
            onClick={closeDrawer}
            className="flex-1 bg-[#432F83] text-white py-2 rounded-lg text-xs font-bold transition-colors hover:bg-[#5A31DD] active:scale-98"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Main product display grid */}
      {sortedProducts.length === 0 ? (
        <div className="col-span-full py-16 text-center rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50/50">
          <p className="text-sm font-bold text-gray-700">No products match your filter criteria.</p>
          <button
            onClick={clearAllFilters}
            className="mt-3 inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-[#432F83] text-white text-xs font-bold transition-all hover:bg-[#5A31DD] active:scale-95"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {sortedProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
