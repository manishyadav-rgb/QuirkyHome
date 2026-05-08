import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

// GET - List all sites
export async function GET() {
  try {
    // Ensure table exists
    await query(`
      create table if not exists sites (
        id varchar(50) primary key,
        name varchar(100) not null,
        domain varchar(200) default '',
        logo_text varchar(10) not null default 'ST',
        brand_color varchar(20) not null default '#008060',
        created_at timestamptz not null default now()
      )
    `);

    // Insert default if empty
    await query(`
      insert into sites (id, name, domain, logo_text, brand_color)
      values ('quirkyhome', 'QuirkyHome', 'quirkyhome.in', 'QH', '#008060')
      on conflict (id) do nothing
    `);

    const result = await query<{
      id: string;
      name: string;
      domain: string;
      logo_text: string;
      brand_color: string;
    }>("select * from sites order by created_at");

    return NextResponse.json({ sites: result.rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, sites: [] }, { status: 500 });
  }
}

// POST - Create a new site (admin only)
export async function POST(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, domain, brand_color } = body;

  if (!name) {
    return NextResponse.json({ error: "Store name is required" }, { status: 400 });
  }

  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 50);
  const logo_text = name.slice(0, 2).toUpperCase();

  try {
    await query(
      `insert into sites (id, name, domain, logo_text, brand_color)
       values ($1, $2, $3, $4, $5)`,
      [id, name, domain || "", logo_text, brand_color || "#008060"],
    );

    return NextResponse.json({ ok: true, site: { id, name, domain, logo_text, brand_color } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE - Remove a site
export async function DELETE(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || auth.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id || id === "quirkyhome") {
    return NextResponse.json({ error: "Cannot delete this store" }, { status: 400 });
  }

  await query("delete from sites where id = $1", [id]);
  return NextResponse.json({ ok: true });
}
