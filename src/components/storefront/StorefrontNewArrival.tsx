"use client";

import { useMemo, useState } from "react";

type Item = { icon: string; label: string };
type TabGroup = { tab: string; items: Item[] };

const fallbackAccessory: TabGroup[] = [
  {
    tab: "Wall Decor",
    items: [
      { icon: "*", label: "Canvas Art" },
      { icon: "*", label: "Mirrors" },
      { icon: "*", label: "Candle Holders" }
    ]
  }
];

const fallbackFurniture: TabGroup[] = [
  {
    tab: "Sofas & Seating",
    items: [
      { icon: "*", label: "3-Seater Sofa" },
      { icon: "*", label: "Recliners" },
      { icon: "*", label: "Accent Chair" }
    ]
  }
];

function parseGroups(raw: unknown, fallback: TabGroup[]): TabGroup[] {
  try {
    const parsed = JSON.parse(String(raw || "[]"));
    if (Array.isArray(parsed) && parsed.length) {
      return parsed
        .map((group: any) => ({
          tab: String(group?.tab || ""),
          items: Array.isArray(group?.items)
            ? group.items.map((it: any) => ({
                icon: String(it?.icon || "*"),
                label: String(it?.label || "Item")
              }))
            : []
        }))
        .filter((group: TabGroup) => group.tab);
    }
  } catch {}
  return fallback;
}

export function StorefrontNewArrival({ settings }: { settings: Record<string, any> }) {
  const accessory = useMemo(() => parseGroups(settings.accessoryDataJson, fallbackAccessory), [settings.accessoryDataJson]);
  const furniture = useMemo(() => parseGroups(settings.furnitureDataJson, fallbackFurniture), [settings.furnitureDataJson]);

  const [category, setCategory] = useState<"accessory" | "furniture">("accessory");
  const data = category === "accessory" ? accessory : furniture;
  const [tabIndex, setTabIndex] = useState(0);

  const safeTabIndex = Math.min(tabIndex, Math.max(0, data.length - 1));
  const active = data[safeTabIndex] || { tab: "", items: [] as Item[] };

  const c = {
    sectionBg: "#f8f1e4",
    cardBg: "#ffffff",
    title: "#2d2417",
    subtitle: "#7c6540",
    accent: "#D4B483",
    badgeText: "#ffffff",
    badgeShadow: "#a6844f",
    tabText: "#9f8254",
    tabActiveText: "#8a6636",
    tabUnderline: "#D4B483",
    tabBorder: "#eadcc3",
    itemCardBg: "#fdf8ef",
    itemCardBorder: "#ecdcbf",
    itemText: "#6d552f",
    arrowBg: "transparent",
    arrowBorder: "#dfcaa6",
    arrowText: "#7c6540"
  };

  return (
    <section className="qh-section-pad px-0 md:px-0">
      <div
        className="mx-auto w-full overflow-hidden rounded-[16px] md:rounded-none"
        style={{ backgroundColor: c.sectionBg }}
      >
        <div className="relative px-4 pt-6 md:px-6 md:pt-7">
          <div className="relative z-10 flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center rounded-[7px] px-3 py-1 font-serif text-[1.05rem] font-black tracking-[0.06em] shadow-[0_3px_0_var(--na-badge-shadow),0_5px_14px_rgba(212,180,131,0.45)]"
              style={{
                backgroundColor: c.accent,
                color: c.badgeText,
                animation: "na-bob 2.6s ease-in-out infinite",
                ["--na-badge-shadow" as any]: c.badgeShadow
              }}
            >
              {settings.badgeText || "NEW"}
            </span>
            <h2 className="font-serif text-2xl font-bold md:text-[1.75rem]" style={{ color: c.title }}>
              {settings.title || "Arrivals"}
            </h2>
          </div>

          <p className="relative z-10 mt-2 max-w-[370px] text-[0.87rem] leading-relaxed" style={{ color: c.subtitle }}>
            {settings.subtitle || "Be the first to explore our newest furniture and home essentials, crafted for modern homes."}
          </p>

          <div className="relative z-10 mt-4 flex items-end gap-1">
            <button
              className="relative rounded-t-[16px] px-4 pb-2 pt-3 text-[0.9rem]"
              style={{
                backgroundColor: category === "accessory" ? c.cardBg : "transparent",
                color: category === "accessory" ? c.tabActiveText : c.tabText,
                fontWeight: category === "accessory" ? 700 : 500
              }}
              onClick={() => {
                setCategory("accessory");
                setTabIndex(0);
              }}
            >
              {settings.accessoryLabel || "Accessory"}
              {category === "accessory" ? (
                <span className="absolute bottom-0 left-[20%] right-[20%] h-[2.5px] rounded" style={{ backgroundColor: c.tabUnderline }} />
              ) : null}
            </button>

            <button
              className="relative rounded-t-[16px] px-4 pb-2 pt-3 text-[0.9rem]"
              style={{
                backgroundColor: category === "furniture" ? c.cardBg : "transparent",
                color: category === "furniture" ? c.tabActiveText : c.tabText,
                fontWeight: category === "furniture" ? 700 : 500
              }}
              onClick={() => {
                setCategory("furniture");
                setTabIndex(0);
              }}
            >
              {settings.furnitureLabel || "Furniture"}
              {category === "furniture" ? (
                <span className="absolute bottom-0 left-[20%] right-[20%] h-[2.5px] rounded" style={{ backgroundColor: c.tabUnderline }} />
              ) : null}
            </button>
          </div>
        </div>

        <div style={{ backgroundColor: c.cardBg }}>
          <div className="flex items-center overflow-x-auto border-b px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-[18px]" style={{ borderBottomColor: c.tabBorder }}>
            {data.map((tab, i) => (
              <button
                key={tab.tab + i}
                className="relative shrink-0 whitespace-nowrap px-3.5 pb-3 pt-3.5 text-[0.86rem]"
                style={{
                  color: i === safeTabIndex ? c.title : c.tabText,
                  fontWeight: i === safeTabIndex ? 700 : 500
                }}
                onClick={() => setTabIndex(i)}
              >
                {tab.tab}
                {i === safeTabIndex ? (
                  <span className="absolute bottom-0 left-1/2 h-[2.5px] w-[70%] -translate-x-1/2 rounded" style={{ backgroundColor: c.tabUnderline }} />
                ) : null}
              </button>
            ))}

            <button
              className="ml-auto inline-flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border text-sm"
              style={{ backgroundColor: c.arrowBg, borderColor: c.arrowBorder, color: c.arrowText }}
              onClick={() => {
                const next = safeTabIndex + 1 >= data.length ? 0 : safeTabIndex + 1;
                setTabIndex(next);
              }}
              aria-label="Next tab"
            >
              {">"}
            </button>
          </div>

          <div className="p-4 pt-4 md:p-4 md:pt-[18px]">
            <div className="grid grid-cols-2 gap-[11px] md:grid-cols-3">
              {active.items.map((item, idx) => (
                <div
                  key={item.label + idx}
                  className="rounded-[13px] border px-2 py-3 text-center"
                  style={{ backgroundColor: c.itemCardBg, borderColor: c.itemCardBorder }}
                >
                  <span className="mb-1 block text-[1.85rem]">{item.icon}</span>
                  <span className="block text-[0.73rem] font-medium" style={{ color: c.itemText }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes na-bob {
          0%,
          100% {
            transform: translateY(0);
          }
          40%,
          60% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </section>
  );
}
