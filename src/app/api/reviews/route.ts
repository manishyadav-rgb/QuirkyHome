import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";

type ReviewRow = {
  id: string;
  user_id: string;
  product_slug: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
  user_name: string | null;
};

async function ensureReviewsTable() {
  await query(`
    create table if not exists product_reviews (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      product_slug varchar(260) not null,
      rating smallint not null check (rating >= 1 and rating <= 5),
      title varchar(180),
      comment text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique(user_id, product_slug)
    )
  `);
  // Legacy compatibility: some existing schemas have order_id NOT NULL.
  // For product-level reviews, order_id should be optional.
  await query(`
    do $$
    begin
      if exists (
        select 1
        from information_schema.columns
        where table_name = 'product_reviews'
          and column_name = 'order_id'
          and is_nullable = 'NO'
      ) then
        alter table product_reviews alter column order_id drop not null;
      end if;
    end $$;
  `);
  // Backfill safety: if legacy rows allowed duplicates, keep latest row per user+product.
  await query(`
    delete from product_reviews pr
    using product_reviews newer
    where pr.user_id = newer.user_id
      and pr.product_slug = newer.product_slug
      and pr.updated_at < newer.updated_at
  `);
  await query(`
    delete from product_reviews pr
    using product_reviews dup
    where pr.user_id = dup.user_id
      and pr.product_slug = dup.product_slug
      and pr.updated_at = dup.updated_at
      and pr.id < dup.id
  `);
  await query("create unique index if not exists uq_product_reviews_user_product on product_reviews(user_id, product_slug)");
  await query("create index if not exists idx_product_reviews_slug on product_reviews(product_slug, created_at desc)");
}

async function hasPurchasedProduct(userId: string, productSlug: string) {
  const purchased = await query<{ ok: number }>(
    `select 1 as ok
     from customer_order_items oi
     join customer_orders o on o.id = oi.order_id
     where o.user_id = $1 and oi.product_slug = $2
     limit 1`,
    [userId, productSlug],
  );
  return purchased.rows.length > 0;
}

export async function GET(request: Request) {
  try {
    await ensureReviewsTable();
    const { searchParams } = new URL(request.url);
    const mine = searchParams.get("mine") === "1";
    const productSlug = (searchParams.get("product_slug") || "").trim();

    if (mine) {
      const auth = await getAuthFromCookies();
      if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

      const rows = await query<ReviewRow>(
        `select pr.id, pr.user_id, pr.product_slug, pr.rating, pr.title, pr.comment,
                pr.created_at::text, pr.updated_at::text, u.full_name as user_name
         from product_reviews pr
         join users u on u.id = pr.user_id
         where pr.user_id = $1
         order by pr.updated_at desc`,
        [auth.sub],
      );
      return NextResponse.json({ reviews: rows.rows });
    }

    if (!productSlug) {
      return NextResponse.json({ reviews: [], stats: { average: 0, count: 0 } });
    }

    const rows = await query<ReviewRow>(
      `select pr.id, pr.user_id, pr.product_slug, pr.rating, pr.title, pr.comment,
              pr.created_at::text, pr.updated_at::text, u.full_name as user_name
       from product_reviews pr
       join users u on u.id = pr.user_id
       where pr.product_slug = $1
       order by pr.created_at desc
       limit 100`,
      [productSlug],
    );

    const stats = await query<{ average: string; count: string }>(
      `select coalesce(avg(rating), 0)::text as average, count(*)::text as count
       from product_reviews
       where product_slug = $1`,
      [productSlug],
    );

    return NextResponse.json({
      reviews: rows.rows,
      stats: {
        average: Number(stats.rows[0]?.average || 0),
        count: Number(stats.rows[0]?.count || 0),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureReviewsTable();
    const auth = await getAuthFromCookies();
    if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const body = await request.json();
    const productSlug = String(body?.productSlug || "").trim();
    const rating = Number(body?.rating || 0);
    const title = String(body?.title || "").trim();
    const comment = String(body?.comment || "").trim();

    if (!productSlug) return NextResponse.json({ error: "Product slug is required" }, { status: 400 });
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    const purchased = await hasPurchasedProduct(auth.sub, productSlug);
    if (!purchased) {
      return NextResponse.json({ error: "Only purchased products can be reviewed" }, { status: 403 });
    }

    const upsert = await query<{ id: string }>(
      `insert into product_reviews (user_id, product_slug, rating, title, comment, updated_at)
       values ($1, $2, $3, $4, $5, now())
       on conflict (user_id, product_slug)
       do update set rating = excluded.rating, title = excluded.title, comment = excluded.comment, updated_at = now()
       returning id`,
      [auth.sub, productSlug, rating, title || null, comment || null],
    );

    return NextResponse.json({ ok: true, id: upsert.rows[0]?.id });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to save review" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureReviewsTable();
    const auth = await getAuthFromCookies();
    if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const id = String(searchParams.get("id") || "");
    if (!id) return NextResponse.json({ error: "Review id is required" }, { status: 400 });

    await query("delete from product_reviews where id = $1 and user_id = $2", [id, auth.sub]);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete review" }, { status: 500 });
  }
}
