"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { categories } from "@/data/categories";

type Crumb = { name: string; href: string };

function prettyLabel(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch (e) {
    // fallback
  }

  const category = categories.find((c) => c.slug === decoded || c.slug === segment);
  if (category) return category.name;
  
  const label = decoded
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  // Truncate long product or title labels to keep breadcrumbs layout clean
  if (label.length > 25) {
    return label.slice(0, 22) + "...";
  }
  return label;
}

function buildCrumbs(pathname: string): Crumb[] {
  const trimmed = pathname.split("?")[0].split("#")[0];
  const segments = trimmed.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ name: "Home", href: "/" }];

  // Custom mapping for collections to skip non-existent parent "/collections" index route
  if (segments[0] === "collections" && segments.length === 2) {
    crumbs.push({ name: prettyLabel(segments[1]), href: `/collections/${segments[1]}` });
    return crumbs;
  }

  let running = "";
  for (const segment of segments) {
    running += `/${segment}`;
    crumbs.push({ name: prettyLabel(segment), href: running });
  }
  return crumbs;
}

const systemFolders = [
  "blog", "posts", "collections", "all-product", 
  "account", "admin", "qh-admin", "api", 
  "invoice", "wishlist", "track-order", "search", 
  "cart", "checkout", "payment-status"
];

export function Breadcrumbs() {
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    setPathname(window.location.pathname);
  }, []);

  const segments = pathname.split("/").filter(Boolean);
  const isPdp = segments.length === 2 && !systemFolders.includes(segments[0]);

  const hidden =
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/qh-admin") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/cart") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/invoice") ||
    pathname.startsWith("/payment-status") ||
    pathname.startsWith("/all-product") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/wishlist") ||
    pathname.startsWith("/track-order") ||
    // Hide on product detail pages (already has beautiful PDP local breadcrumbs)
    isPdp;

  if (hidden) return null;

  const crumbs = buildCrumbs(pathname);
  if (crumbs.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="qh-container py-2 text-xs sm:text-sm">
      <ol className="flex flex-wrap items-center gap-1 text-text-muted">
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <li key={`${crumb.href}-${idx}`} className="inline-flex items-center gap-1">
              {isLast ? (
                <span className="font-semibold text-text-main">{crumb.name}</span>
              ) : (
                <Link href={crumb.href} className="hover:text-brand-primary">
                  {crumb.name}
                </Link>
              )}
              {!isLast ? <span className="text-text-soft">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
