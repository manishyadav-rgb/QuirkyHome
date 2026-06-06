import { collections as fallbackCollections, type Collection } from "@/data/collections";
import { query } from "@/lib/db";

type CollectionRow = {
  title?: string;
  name?: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

async function ensureCollectionsTable() {
  await query(`
    create table if not exists collections (
      id uuid primary key default gen_random_uuid(),
      name varchar(180) not null,
      slug varchar(200) not null unique,
      description text,
      image_url text,
      is_active boolean not null default true,
      sort_order int not null default 0,
      site_id varchar(50) not null default 'quirkyhome',
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
  await query("alter table collections add column if not exists description text");
  await query("alter table collections add column if not exists image_url text");
  await query("alter table collections add column if not exists is_active boolean not null default true");
  await query("alter table collections add column if not exists sort_order int not null default 0");
  await query("alter table collections add column if not exists site_id varchar(50) not null default 'quirkyhome'");
  await query("alter table collections add column if not exists created_at timestamptz not null default now()");
  await query("alter table collections add column if not exists updated_at timestamptz not null default now()");
}

async function seedFallbackCollections(siteId: string) {
  const existing = await query<{ count: string }>(
    "select count(*)::text as count from collections where site_id = $1",
    [siteId],
  );
  if (Number(existing.rows[0]?.count || 0) > 0) return;

  for (const [index, collection] of fallbackCollections.entries()) {
    await query(
      `insert into collections (name, slug, description, image_url, site_id, is_active, sort_order)
       values ($1, $2, $3, $4, $5, true, $6)
       on conflict (slug) do nothing`,
      [collection.title, collection.slug, collection.description, collection.image, siteId, index],
    );
  }
}

export async function getStoreCollections(siteId = "quirkyhome"): Promise<Collection[]> {
  if (!process.env.DATABASE_URL) return fallbackCollections;

  try {
    await ensureCollectionsTable();
    await seedFallbackCollections(siteId);
    const result = await query<CollectionRow>(
      `select name, slug, description, image_url
       from collections
       where site_id = $1 and is_active = true
       order by sort_order asc, created_at desc`,
      [siteId],
    );

    const dbCollections = result.rows
      .filter((row) => (row.name || row.title) && row.slug)
      .map((row) => {
        const title = row.name || row.title || row.slug;
        return {
          title,
          slug: row.slug,
          image: row.image_url || "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80",
          description: row.description || `Explore ${title} collection at QuirkyHome.`,
        };
      });

    return dbCollections.length ? dbCollections : fallbackCollections;
  } catch (error) {
    console.error("getStoreCollections DB error:", error);
    return fallbackCollections;
  }
}
