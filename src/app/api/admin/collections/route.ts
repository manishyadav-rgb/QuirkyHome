import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

type CollectionRow = {
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

// GET - List all collections (with optional site_id filter)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const withProducts = searchParams.get("products") === "1";
  const activeOnly = searchParams.get("active") === "1";
  const siteId = searchParams.get("site_id") || "quirkyhome";

  let sql = "select * from collections where site_id = $1";
  const params: any[] = [siteId];
  if (activeOnly) sql += " and is_active = true";
  sql += " order by sort_order, created_at desc";

  const result = await query<CollectionRow>(sql, params);
  
  if (withProducts) {
    const collections = [];
    for (const col of result.rows) {
      const products = await query(
        "select product_slug, sort_order from collection_products where collection_id = $1 order by sort_order",
        [col.id],
      );
      collections.push({ ...col, products: products.rows.map((p: any) => p.product_slug) });
    }
    return NextResponse.json({ collections });
  }

  return NextResponse.json({ collections: result.rows });
}

// POST - Create a new collection (admin only)
export async function POST(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || (auth.role !== "admin" && auth.role !== "team")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, image_url, products, site_id } = body;
  const siteId = site_id || "quirkyhome";

  if (!name) {
    return NextResponse.json({ error: "Collection name is required" }, { status: 400 });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Ensure site_id column exists
  try {
    await query("alter table collections add column if not exists site_id varchar(50) default 'quirkyhome'");
  } catch { /* column may already exist */ }

  const result = await query<{ id: string }>(
    `insert into collections (name, slug, description, image_url, site_id)
     values ($1, $2, $3, $4, $5)
     returning id`,
    [name, slug, description || null, image_url || null, siteId],
  );

  const collectionId = result.rows[0].id;

  // Add products
  if (Array.isArray(products) && products.length > 0) {
    for (let i = 0; i < products.length; i++) {
      await query(
        `insert into collection_products (collection_id, product_slug, sort_order)
         values ($1, $2, $3)
         on conflict (collection_id, product_slug) do nothing`,
        [collectionId, products[i], i],
      );
    }
  }

  return NextResponse.json({ ok: true, id: collectionId, slug });
}

// DELETE - Remove a collection
export async function DELETE(request: Request) {
  const auth = await getAuthFromCookies();
  if (!auth || (auth.role !== "admin" && auth.role !== "team")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Collection ID required" }, { status: 400 });

  await query("delete from collections where id = $1", [id]);
  return NextResponse.json({ ok: true });
}
