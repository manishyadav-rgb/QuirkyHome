"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Boxes,
  ChevronRight,
  ExternalLink,
  FileText,
  Globe,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Megaphone,
  Monitor,
  PackagePlus,
  Percent,
  Settings,
  ShoppingBag,
  Smartphone,
  Store,
  Tag,
  UsersRound,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSiteContext } from "@/lib/site-context";

const navGroups = [
  {
    label: "",
    items: [
      { href: "/qh-admin", label: "Home", icon: Home, exact: true },
      { href: "/qh-admin/orders", label: "Orders", icon: ShoppingBag },
      { href: "/qh-admin/products", label: "Products", icon: Tag },
      { href: "/qh-admin/collections", label: "Collections", icon: LayoutGrid },
      { href: "/qh-admin/customers", label: "Customers", icon: UsersRound },
    ],
  },
  {
    label: "",
    items: [
      { href: "/qh-admin/marketing", label: "Marketing", icon: Megaphone },
      { href: "/qh-admin/discounts", label: "Discounts", icon: Percent },
    ],
  },
  {
    label: "",
    items: [
      { href: "/qh-admin/content", label: "Content", icon: FileText },
      { href: "/qh-admin/markets", label: "Markets", icon: Globe },
      { href: "/qh-admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Sales channels",
    items: [
      { href: "/qh-admin/online-store", label: "Online Store", icon: Monitor },
      { href: "/qh-admin/app", label: "App", icon: Smartphone },
    ],
  },
  {
    label: "",
    items: [
      { href: "/qh-admin/add-product", label: "Add Product", icon: PackagePlus },
      { href: "/qh-admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

const pageTitleMap: Record<string, string> = {
  "/qh-admin": "Home",
  "/qh-admin/orders": "Orders",
  "/qh-admin/products": "Products",
  "/qh-admin/collections": "Collections",
  "/qh-admin/customers": "Customers",
  "/qh-admin/marketing": "Marketing",
  "/qh-admin/discounts": "Discounts",
  "/qh-admin/content": "Content",
  "/qh-admin/markets": "Markets",
  "/qh-admin/analytics": "Analytics",
  "/qh-admin/online-store": "Online Store",
  "/qh-admin/app": "App",
  "/qh-admin/add-product": "Add Product",
  "/qh-admin/settings": "Settings",
};

function SidebarContent({ pathname, onClose, onLogout }: { pathname: string; onClose?: () => void; onLogout: () => void }) {
  const [siteSwitcherOpen, setSiteSwitcherOpen] = useState(false);
  const [addStoreMode, setAddStoreMode] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStoreColor, setNewStoreColor] = useState("#008060");
  const [addingStore, setAddingStore] = useState(false);

  const activeSiteId = useSiteContext((s) => s.activeSiteId);
  const setActiveSite = useSiteContext((s) => s.setActiveSite);
  const sites = useSiteContext((s) => s.sites);
  const fetchSites = useSiteContext((s) => s.fetchSites);
  const addSite = useSiteContext((s) => s.addSite);
  const activeSite = sites.find((s) => s.id === activeSiteId) || sites[0];

  // Fetch sites from DB on mount
  useEffect(() => {
    fetchSites();
  }, [fetchSites]);

  async function handleAddStore() {
    if (!newStoreName.trim()) return;
    setAddingStore(true);
    const site = await addSite(newStoreName.trim(), newStoreColor);
    if (site) {
      setActiveSite(site.id);
      setNewStoreName("");
      setNewStoreColor("#008060");
      setAddStoreMode(false);
      setSiteSwitcherOpen(false);
    }
    setAddingStore(false);
  }

  return (
    <>
      {/* Brand / Site Switcher */}
      <div className="relative px-4 pb-4 pt-5">
        <button
          onClick={() => setSiteSwitcherOpen(!siteSwitcherOpen)}
          className="flex w-full items-center gap-3 rounded-lg px-1 py-1 transition-colors hover:bg-[#262626]"
        >
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
            style={{ backgroundColor: activeSite?.color || "#008060" }}
          >
            {activeSite?.logo || "QH"}
          </div>
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-[13px] font-semibold text-[#e3e5e7]">{activeSite?.name || "Store"}</p>
          </div>
          <ChevronRight className={cn("h-3.5 w-3.5 text-[#a6acb2] transition-transform", siteSwitcherOpen && "rotate-90")} />
        </button>
        {onClose && (
          <button onClick={onClose} className="absolute right-4 top-5 flex h-7 w-7 items-center justify-center rounded-md text-[#a6acb2] transition-colors hover:bg-[#333] hover:text-white lg:hidden">
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown */}
        {siteSwitcherOpen && (
          <div className="mt-1 rounded-lg border border-[#333] bg-[#222] py-1 shadow-xl">
            {sites.map((site) => (
              <button
                key={site.id}
                onClick={() => { setActiveSite(site.id); setSiteSwitcherOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] transition-colors hover:bg-[#333]",
                  site.id === activeSiteId ? "text-white" : "text-[#a6acb2]",
                )}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white"
                  style={{ backgroundColor: site.color }}
                >
                  {site.logo}
                </div>
                <span className="flex-1 truncate">{site.name}</span>
                {site.id === activeSiteId && <span className="text-[10px] text-[#008060]">●</span>}
              </button>
            ))}

            {/* Add Store */}
            <div className="border-t border-[#333] mt-1 pt-1">
              {addStoreMode ? (
                <div className="px-3 py-2 space-y-2">
                  <input
                    type="text"
                    value={newStoreName}
                    onChange={(e) => setNewStoreName(e.target.value)}
                    placeholder="Store name"
                    className="w-full rounded-md border border-[#444] bg-[#1a1a1a] px-2.5 py-1.5 text-[12px] text-white placeholder:text-[#666] focus:border-[#008060] focus:outline-none"
                    onKeyDown={(e) => e.key === "Enter" && handleAddStore()}
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newStoreColor}
                      onChange={(e) => setNewStoreColor(e.target.value)}
                      className="h-7 w-7 cursor-pointer rounded border-0 bg-transparent"
                    />
                    <span className="text-[11px] text-[#666]">Brand color</span>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleAddStore}
                      disabled={addingStore || !newStoreName.trim()}
                      className="flex-1 rounded-md bg-[#008060] py-1.5 text-[11px] font-semibold text-white hover:bg-[#006e52] disabled:opacity-50"
                    >
                      {addingStore ? "Creating..." : "Create Store"}
                    </button>
                    <button
                      onClick={() => { setAddStoreMode(false); setNewStoreName(""); }}
                      className="rounded-md px-3 py-1.5 text-[11px] text-[#a6acb2] hover:bg-[#333]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddStoreMode(true)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] text-[#008060] transition-colors hover:bg-[#333]"
                >
                  <Store className="h-4 w-4" />
                  <span>Add new store</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-4" style={{ scrollbarWidth: "none" }}>
        {navGroups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <p className="mb-1 mt-3 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#787878]">
                {group.label}
              </p>
            )}
            {!group.label && gi > 0 && <div className="my-2 border-t border-[#2a2a2a]" />}
            <div className="grid gap-px">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isExact = "exact" in item && item.exact;
                const active = isExact
                  ? pathname === item.href
                  : pathname === item.href || pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href + item.label}
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      "group relative flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] font-medium transition-all duration-75",
                      active
                        ? "bg-[#333333] font-semibold text-white"
                        : "text-[#b0b5b9] hover:bg-[#262626] hover:text-[#e3e5e7]",
                    )}
                  >
                    {active && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3px] rounded-r-sm bg-[#008060]" />
                    )}
                    <Icon className={cn("h-[17px] w-[17px] shrink-0", active ? "text-[#008060]" : "text-[#6d7175] group-hover:text-[#a6acb2]")} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#2a2a2a] px-3 py-2">
        <Link
          href="/"
          className="flex h-8 items-center gap-2 rounded-md px-2.5 text-[12px] font-medium text-[#787878] transition-colors hover:bg-[#262626] hover:text-[#e3e5e7]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View Store
        </Link>
        <button
          onClick={onLogout}
          className="flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-[12px] font-medium text-[#787878] transition-colors hover:bg-[#262626] hover:text-[#e3e5e7]"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log out
        </button>
      </div>
    </>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  const isLoginPage = pathname === "/qh-admin/login";
  const isBuilderPage = pathname === "/qh-admin/builder";

  useEffect(() => {
    if (isLoginPage || isBuilderPage) { setAuthChecked(true); return; }
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated && (data.user.role === "admin" || data.user.role === "team")) {
          setIsAuthed(true);
        } else {
          window.location.href = "/qh-admin/login";
        }
      })
      .catch(() => { window.location.href = "/qh-admin/login"; })
      .finally(() => setAuthChecked(true));
  }, [isLoginPage]);

  function handleLogout() {
    fetch("/api/auth/logout", { method: "POST" }).then(() => {
      window.location.href = "/qh-admin/login";
    });
  }

  if (isLoginPage || isBuilderPage) return <>{children}</>;
  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#e1e3e5] border-t-[#008060]" />
      </div>
    );
  }
  if (!isAuthed) return null;

  const pageTitle = pageTitleMap[pathname] ||
    Object.entries(pageTitleMap).find(([k]) => pathname.startsWith(k + "/"))?.[1] ||
    "Admin";

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-[220px] flex-col bg-[#1a1a1a] lg:flex">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#1a1a1a] shadow-2xl transition-transform duration-200 lg:hidden",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent pathname={pathname} onClose={() => setSidebarOpen(false)} onLogout={handleLogout} />
      </aside>

      {/* Main */}
      <div className="lg:pl-[220px]">
        <header className="sticky top-0 z-30 border-b border-[#e1e3e5] bg-white px-4 py-3 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-md border border-[#c9cccf] text-[#6d7175] transition-colors hover:bg-[#f6f6f7] lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-[#202223]">{pageTitle}</h1>
            </div>
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-md border border-[#c9cccf] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#202223] shadow-[0_1px_0_rgba(0,0,0,0.05)] transition-all hover:bg-[#f6f6f7] sm:inline-flex"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Store
            </Link>
          </div>
        </header>

        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
