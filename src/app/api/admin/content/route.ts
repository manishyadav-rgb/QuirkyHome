import { query } from "@/lib/db";

type BlogRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  image_alt: string | null;
  content_html: string;
  published: boolean;
  created_at: string;
  updated_at: string;
};

async function ensureBlogTable() {
  await query(`
    create table if not exists blog_posts (
      id bigserial primary key,
      slug text not null unique,
      title text not null,
      excerpt text,
      cover_image text,
      image_alt text,
      content_html text not null default '',
      published boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function GET() {
  try {
    await ensureBlogTable();
    const rows = await query<BlogRow>(
      `select id, slug, title, excerpt, cover_image, image_alt, content_html, published, created_at, updated_at
       from blog_posts
       order by created_at desc`,
    );
    return Response.json({ posts: rows.rows });
  } catch (error) {
    return Response.json({ error: "Failed to load blog posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureBlogTable();
    const body = await request.json();
    const title = String(body?.title || "").trim();
    const slugInput = String(body?.slug || "").trim();
    const slug = toSlug(slugInput || title);
    const excerpt = String(body?.excerpt || "").trim();
    const coverImage = String(body?.coverImage || "").trim();
    const imageAlt = String(body?.imageAlt || "").trim();
    const contentHtml = String(body?.contentHtml || "");
    const published = body?.published !== false;

    if (!title || !slug) {
      return Response.json({ error: "Title and slug are required" }, { status: 400 });
    }

    await query(
      `insert into blog_posts (slug, title, excerpt, cover_image, image_alt, content_html, published, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, now())
       on conflict (slug) do update
       set title = excluded.title,
           excerpt = excluded.excerpt,
           cover_image = excluded.cover_image,
           image_alt = excluded.image_alt,
           content_html = excluded.content_html,
           published = excluded.published,
           updated_at = now()`,
      [slug, title, excerpt || null, coverImage || null, imageAlt || null, contentHtml, published],
    );

    return Response.json({ ok: true, slug });
  } catch (error) {
    return Response.json({ error: "Failed to save blog post" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await ensureBlogTable();
    const { searchParams } = new URL(request.url);
    const id = Number(searchParams.get("id"));
    if (!Number.isFinite(id)) {
      return Response.json({ error: "Valid id is required" }, { status: 400 });
    }
    await query("delete from blog_posts where id = $1", [id]);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}
