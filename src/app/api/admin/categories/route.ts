import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  site_id: string;
  created_at: string;
};

function toSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function ensureCategoriesTable() {
  await query(`
    create table if not exists categories (
      id uuid primary key default gen_random_uuid(),
      name varchar(150) not null,
      slug varchar(160) not null unique,
      description text,
      image_url text,
      is_active boolean not null default true,
      sort_order int not null default 0,
      site_id varchar(50) not null default 'quirkyhome',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await query("alter table categories add column if not exists description text");
  await query("alter table categories add column if not exists image_url text");
  await query("alter table categories add column if not exists is_active boolean not null default true");
  await query("alter table categories add column if not exists sort_order int not null default 0");
  await query("alter table categories add column if not exists site_id varchar(50) not null default 'quirkyhome'");
  await query("alter table categories add column if not exists created_at timestamptz not null default now()");
  await query("alter table categories add column if not exists updated_at timestamptz not null default now()");
}

export async function GET(request: Request) {
  try {
    await ensureCategoriesTable();
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get("site_id") || "quirkyhome";
    const activeOnly = searchParams.get("active") === "1";

    let sql = "select * from categories where site_id = $1";
    if (activeOnly) sql += " and is_active = true";
    sql += " order by sort_order asc, created_at desc";

    const result = await query<CategoryRow>(sql, [siteId]);
    return NextResponse.json({ categories: result.rows });
  } catch (error) {
    console.error("Admin categories GET error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || (auth.role !== "admin" && auth.role !== "team")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureCategoriesTable();
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const imageUrl = typeof body?.image_url === "string" ? body.image_url.trim() : "";
    const siteId = typeof body?.site_id === "string" && body.site_id.trim() ? body.site_id.trim() : "quirkyhome";
    const slugRaw = typeof body?.slug === "string" ? body.slug : name;
    const slug = toSlug(slugRaw);

    if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    if (!slug) return NextResponse.json({ error: "Valid category slug is required" }, { status: 400 });

    const result = await query<{ id: string; slug: string }>(
      `insert into categories (name, slug, description, image_url, site_id)
       values ($1, $2, $3, $4, $5)
       on conflict (slug) do update
       set name = excluded.name,
           description = excluded.description,
           image_url = excluded.image_url,
           site_id = excluded.site_id,
           updated_at = now()
       returning id, slug`,
      [name, slug, description || null, imageUrl || null, siteId],
    );

    return NextResponse.json({ ok: true, category: result.rows[0] });
  } catch (error) {
    console.error("Admin categories POST error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || (auth.role !== "admin" && auth.role !== "team")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await ensureCategoriesTable();
    const body = await request.json();
    const id = typeof body?.id === "string" ? body.id : "";
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description = typeof body?.description === "string" ? body.description.trim() : "";
    const imageUrl = typeof body?.image_url === "string" ? body.image_url.trim() : "";
    const slugRaw = typeof body?.slug === "string" && body.slug.trim() ? body.slug : name;
    const slug = toSlug(slugRaw);
    const isActive = body?.is_active !== false;

    if (!id) return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    if (!name) return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    if (!slug) return NextResponse.json({ error: "Valid category slug is required" }, { status: 400 });

    await query(
      `update categories
       set name = $2,
           slug = $3,
           description = $4,
           image_url = $5,
           is_active = $6,
           updated_at = now()
       where id = $1`,
      [id, name, slug, description || null, imageUrl || null, isActive],
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin categories PUT error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || (auth.role !== "admin" && auth.role !== "team")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Category ID required" }, { status: 400 });

    await query("delete from categories where id = $1", [id]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin categories DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
