import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

type WishlistRow = { id: string };
type WishlistItemRow = {
  id: string;
  product_slug: string;
  product_title: string;
  product_image: string | null;
  unit_price: string;
  mrp: string | null;
};

// Auto-migration: Ensure tables exist
async function ensureTables() {
  await query(`
    CREATE TABLE IF NOT EXISTS customer_wishlists (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now()
    );
  `);
  await query(`
    CREATE TABLE IF NOT EXISTS customer_wishlist_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      wishlist_id UUID REFERENCES customer_wishlists(id) ON DELETE CASCADE,
      product_slug VARCHAR(255) NOT NULL,
      product_title VARCHAR(255) NOT NULL,
      product_image TEXT,
      unit_price DECIMAL(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT now(),
      updated_at TIMESTAMP DEFAULT now(),
      UNIQUE (wishlist_id, product_slug)
    );
  `);
  await query(`ALTER TABLE customer_wishlist_items ADD COLUMN IF NOT EXISTS mrp DECIMAL(10, 2)`);
  await query("ALTER TABLE customer_wishlist_items DROP CONSTRAINT IF EXISTS customer_wishlist_items_wishlist_id_key");
  await query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'customer_wishlist_items_wishlist_id_product_slug_key'
      ) THEN
        ALTER TABLE customer_wishlist_items
          ADD CONSTRAINT customer_wishlist_items_wishlist_id_product_slug_key UNIQUE (wishlist_id, product_slug);
      END IF;
    END $$;
  `);
}

async function getOrCreateWishlist(userId: string): Promise<string> {
  await ensureTables();
  const existing = await query<WishlistRow>(
    "select id from customer_wishlists where user_id::text = $1 limit 1",
    [userId],
  );
  if (existing.rows[0]) return existing.rows[0].id;

  const created = await query<WishlistRow>(
    "insert into customer_wishlists (user_id) values ($1) returning id",
    [userId],
  );
  return created.rows[0].id;
}

// GET - Get wishlist items
export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const wishlistId = await getOrCreateWishlist(auth.sub);
    const items = await query<WishlistItemRow>(
      `select id, product_slug, product_title, product_image, 
              unit_price::text, coalesce(mrp, unit_price)::text as mrp
       from customer_wishlist_items 
       where wishlist_id = $1 
       order by created_at desc`,
      [wishlistId],
    );

    // Map DB items to the frontend Product structure expected
    const products = items.rows.map(item => ({
      slug: item.product_slug,
      title: item.product_title,
      image: item.product_image || "",
      price: parseFloat(item.unit_price),
      mrp: item.mrp ? parseFloat(item.mrp) : undefined,
    }));

    return NextResponse.json({ items: products });
  } catch (error: any) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Add to wishlist
export async function POST(request: Request) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const { slug, title, image, price, mrp } = body;

    if (!slug || !title || price == null) {
      return NextResponse.json({ error: "slug, title, and price are required" }, { status: 400 });
    }

    const wishlistId = await getOrCreateWishlist(auth.sub);

    await query(
      `insert into customer_wishlist_items (wishlist_id, product_slug, product_title, product_image, unit_price, mrp)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (wishlist_id, product_slug) do update
       set unit_price = $5,
           mrp = $6,
           product_title = $3,
           product_image = $4,
           updated_at = now()`,
      [wishlistId, slug, title, image, price, mrp],
    );

    await query("update customer_wishlists set updated_at = now() where id = $1", [wishlistId]);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove from wishlist
export async function DELETE(request: Request) {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    const wishlistId = await getOrCreateWishlist(auth.sub);

    await query(
      "delete from customer_wishlist_items where wishlist_id = $1 and product_slug = $2",
      [wishlistId, slug],
    );

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
