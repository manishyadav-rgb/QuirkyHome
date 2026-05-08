import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

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
      return NextResponse.json({ schema: result.rows[0].schema_json });
    }
    return NextResponse.json({ schema: null });
  } catch {
    return NextResponse.json({ schema: null });
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
