import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ThemeConfig = {
  activePreset: string;
  customOverrides: Record<string, string>;
};

const DEFAULT_THEME: ThemeConfig = {
  activePreset: "vibrant-sunshine",
  customOverrides: {},
};

async function readThemeFromBuilder(siteId: string): Promise<ThemeConfig> {
  const result = await query<{ schema_json: any }>(
    "select schema_json from builder_pages where id = 'main' and site_id = $1 limit 1",
    [siteId],
  );
  const schema = result.rows[0]?.schema_json;
  const theme = schema?.themeSettings;
  if (!theme) return DEFAULT_THEME;

  return {
    activePreset: theme.activePreset || DEFAULT_THEME.activePreset,
    customOverrides: theme.customOverrides || DEFAULT_THEME.customOverrides,
  };
}

/** GET /api/theme - Read theme from DB-backed builder schema */
export async function GET(request: NextRequest) {
  const siteId = request.nextUrl.searchParams.get("site_id") || "quirkyhome";
  try {
    const config = await readThemeFromBuilder(siteId);
    return NextResponse.json(config, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json(DEFAULT_THEME, { headers: { "Cache-Control": "no-store" } });
  }
}

/** PUT /api/theme - Persist theme inside builder schema in DB */
export async function PUT(request: NextRequest) {
  const siteId = request.nextUrl.searchParams.get("site_id") || "quirkyhome";
  try {
    const body = await request.json();
    const result = await query<{ schema_json: any }>(
      "select schema_json from builder_pages where id = 'main' and site_id = $1 limit 1",
      [siteId],
    );

    const schema = result.rows[0]?.schema_json || {
      themeSettings: {},
      pages: { home: { name: "Home Page", slug: "home", sections: [] } },
    };

    schema.themeSettings = schema.themeSettings || {};
    if (body.activePreset) schema.themeSettings.activePreset = body.activePreset;
    if (body.customOverrides !== undefined) schema.themeSettings.customOverrides = body.customOverrides;

    await query(
      `insert into builder_pages (id, schema_json, site_id, updated_at)
       values ('main', $1, $2, now())
       on conflict (id, site_id) do update
       set schema_json = $1, updated_at = now()`,
      [JSON.stringify(schema), siteId],
    );

    return NextResponse.json(
      {
        ok: true,
        activePreset: schema.themeSettings.activePreset || DEFAULT_THEME.activePreset,
        customOverrides: schema.themeSettings.customOverrides || DEFAULT_THEME.customOverrides,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to save" }, { status: 500 });
  }
}
