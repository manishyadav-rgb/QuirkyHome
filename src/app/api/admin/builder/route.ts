import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function buildDefaultBuilderSchema(siteId: string) {
  return {
    themeSettings: {
      colors: {
        primary: "#008060",
        secondary: "#5c6ac4",
        background: "#ffffff",
        surface: "#f6f6f7",
        text: "#1a1a1a",
        textMuted: "#6d7175",
        accent: "#b98900",
        border: "#e1e3e5",
      },
      typography: {
        fontFamily: "Inter, system-ui, sans-serif",
        headingFamily: "Inter, system-ui, sans-serif",
        baseSize: "16px",
        headingWeight: "700",
      },
      spacing: {
        sectionPadding: "64px",
        containerMax: "1200px",
        borderRadius: "8px",
      },
    },
    pages: {
      home: {
        name: "Home Page",
        slug: "home",
        sections: [],
      },
    },
  };
}

function isLegacyBuilderSchema(schema: any) {
  const sections = schema?.pages?.home?.sections;
  if (!Array.isArray(sections)) return true;
  return false;
}

// GET - Load saved builder schema for a site
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get("site_id") || "quirkyhome";

  try {
    // Ensure table exists
    await query(`
      create table if not exists builder_pages (
        id varchar(50) not null,
        schema_json jsonb not null,
        site_id varchar(50) not null default 'quirkyhome',
        updated_at timestamptz not null default now(),
        primary key (id, site_id)
      )
    `);

    const result = await query<{ schema_json: any }>(
      "select schema_json from builder_pages where id = 'main' and site_id = $1 limit 1",
      [siteId],
    );
    if (result.rows.length > 0) {
      const existing = result.rows[0].schema_json;
      if (isLegacyBuilderSchema(existing)) {
        const upgraded = buildDefaultBuilderSchema(siteId);
        await query(
          "update builder_pages set schema_json = $1, updated_at = now() where id = 'main' and site_id = $2",
          [JSON.stringify(upgraded), siteId],
        );
        return NextResponse.json({ schema: upgraded }, { headers: { "Cache-Control": "no-store" } });
      }
      return NextResponse.json({ schema: existing }, { headers: { "Cache-Control": "no-store" } });
    }
    const fallback = await query<{ schema_json: any }>(
      "select schema_json from builder_pages where id = 'main' and site_id = 'quirkyhome' limit 1",
    );
    const seeded = fallback.rows.length > 0 && !isLegacyBuilderSchema(fallback.rows[0].schema_json)
      ? fallback.rows[0].schema_json
      : buildDefaultBuilderSchema(siteId);
    await query(
      `insert into builder_pages (id, schema_json, site_id, updated_at)
       values ('main', $1, $2, now())
       on conflict (id, site_id) do nothing`,
      [JSON.stringify(seeded), siteId],
    );
    return NextResponse.json({ schema: seeded }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ schema: null }, { headers: { "Cache-Control": "no-store" } });
  }
}

// POST - Save builder schema (admin only)
export async function POST(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || (auth.role !== "admin" && auth.role !== "team")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { schema, site_id } = body.schema ? { schema: body.schema, site_id: body.site_id } : { schema: body, site_id: "quirkyhome" };
  const siteId = site_id || "quirkyhome";

  try {
    // Ensure table exists
    await query(`
      create table if not exists builder_pages (
        id varchar(50) not null,
        schema_json jsonb not null,
        site_id varchar(50) not null default 'quirkyhome',
        updated_at timestamptz not null default now(),
        primary key (id, site_id)
      )
    `);

    // Upsert
    await query(
      `insert into builder_pages (id, schema_json, site_id, updated_at)
       values ('main', $1, $2, now())
       on conflict (id, site_id) do update set schema_json = $1, updated_at = now()`,
      [JSON.stringify(schema), siteId],
    );

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
