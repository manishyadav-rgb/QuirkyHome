import Link from "next/link";
import { query } from "@/lib/db";

type BlogRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  image_alt: string | null;
};

export default async function BlogPage() {
  const rows = await query<BlogRow>(
    `select slug, title, excerpt, cover_image, image_alt
     from blog_posts
     where published = true
     order by created_at desc`,
  );

  return (
    <section className="qh-container qh-section-pad">
      <h1 className="mb-5 font-display text-3xl font-black text-text-main">Blog</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {rows.rows.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="overflow-hidden rounded-xl border border-border bg-background-elevated">
            <div className="h-28 bg-background-soft md:h-36">
              {post.cover_image ? <img src={post.cover_image} alt={post.image_alt || post.title} className="h-full w-full object-cover" /> : null}
            </div>
            <div className="p-3">
              <h3 className="line-clamp-2 text-sm font-bold text-text-main">{post.title}</h3>
              {post.excerpt ? <p className="mt-1 line-clamp-2 text-xs text-text-muted">{post.excerpt}</p> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

