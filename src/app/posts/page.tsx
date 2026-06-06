import Link from "next/link";
import { query } from "@/lib/db";
import { BASE_URL } from "@/lib/sitemaps";
import type { Metadata } from "next";

type BlogRow = {
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  image_alt: string | null;
};

export const metadata: Metadata = {
  title: "Posts",
  description: "Read latest posts and updates from QuirkyHome.",
  alternates: { canonical: "/posts" },
};

export default async function PostsPage() {
  const rows = await query<BlogRow>(
    `select slug, title, excerpt, cover_image, image_alt
     from blog_posts
     where published = true
     order by created_at desc`,
  );

  return (
    <section className="qh-container qh-section-pad">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "QuirkyHome Posts",
            url: `${BASE_URL}/posts`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: rows.rows.map((post, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: `${BASE_URL}/posts/${post.slug}`,
                name: post.title,
              })),
            },
          }),
        }}
      />
      <h1 className="mb-5 font-display text-3xl font-black text-text-main">Posts</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
        {rows.rows.map((post) => (
          <Link key={post.slug} href={`/posts/${post.slug}`} className="overflow-hidden rounded-xl border border-border bg-background-elevated">
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
