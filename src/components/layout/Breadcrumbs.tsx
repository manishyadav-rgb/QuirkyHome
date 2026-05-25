"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { categories } from "@/data/categories";

type Crumb = { name: string; href: string };

function prettyLabel(segment: string): string {
  const category = categories.find((c) => c.slug === segment);
  if (category) return category.name;
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildCrumbs(pathname: string): Crumb[] {
  const trimmed = pathname.split("?")[0].split("#")[0];
  const segments = trimmed.split("/").filter(Boolean);
  const crumbs: Crumb[] = [{ name: "Home", href: "/" }];

  let running = "";
  for (const segment of segments) {
    running += `/${segment}`;
    crumbs.push({ name: prettyLabel(segment), href: running });
  }
  return crumbs;
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const hidden =
    !pathname ||
    pathname === "/" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/qh-admin") ||
    pathname.startsWith("/api");

  if (hidden) return null;

  const crumbs = buildCrumbs(pathname);
  if (crumbs.length <= 1) return null;

  return (
    <>
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
    </>
  );
}
