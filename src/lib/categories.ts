import { categories as fallbackCategories, type Category } from "@/data/categories";
import { query } from "@/lib/db";

type CategoryRow = {
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

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

async function seedFallbackCategories(siteId: string) {
  const existing = await query<{ count: string }>(
    "select count(*)::text as count from categories where site_id = $1",
    [siteId],
  );
  if (Number(existing.rows[0]?.count || 0) > 0) return;

  for (const [index, category] of fallbackCategories.entries()) {
    await query(
      `insert into categories (name, slug, description, image_url, site_id, is_active, sort_order)
       values ($1, $2, $3, $4, $5, true, $6)
       on conflict (slug) do nothing`,
      [category.name, category.slug, category.description, category.image, siteId, index],
    );
  }
}

function processCategories(list: Category[]): Category[] {
  const result: Category[] = [];
  list.forEach((cat) => {
    const slug = cat.slug?.toLowerCase();
    const name = cat.name?.toLowerCase();
    if (slug === "bedsheet" || name === "bedsheet" || slug === "bedsheets" || name === "bedsheets" || slug?.includes("bedsheet") || name?.includes("bedsheet")) return; // Skip
    if (slug === "bath-gifts" || name === "bath-gifts" || name === "bath gifts") {
      result.push({
        name: "Bath",
        slug: "bath",
        image: cat.image,
        description: "Bath linens, towels, and self-care essentials."
      });
      result.push({
        name: "Gifts",
        slug: "gifts",
        image: cat.image,
        description: "Thoughtful gifting picks for occasions and festivals."
      });
    } else {
      result.push(cat);
    }
  });
  return result;
}

export async function getStoreCategories(siteId = "quirkyhome"): Promise<Category[]> {
  if (!process.env.DATABASE_URL) return processCategories(fallbackCategories);

  try {
    await ensureCategoriesTable();
    await seedFallbackCategories(siteId);
    const result = await query<CategoryRow>(
      `select name, slug, description, image_url
       from categories
       where site_id = $1 and is_active = true
       order by sort_order asc, created_at desc`,
      [siteId],
    );

    const dbCategories = result.rows
      .filter((row) => row.name && row.slug)
      .map((row) => ({
        name: row.name,
        slug: row.slug,
        image: row.image_url || "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
        description: row.description || `Shop ${row.name} products at QuirkyHome.`,
      }));

    const finalCategories = dbCategories.length ? dbCategories : fallbackCategories;
    return processCategories(finalCategories);
  } catch (error) {
    console.error("getStoreCategories DB error:", error);
    return processCategories(fallbackCategories);
  }
}
