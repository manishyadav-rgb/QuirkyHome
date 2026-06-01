import { notFound } from "next/navigation";
import { query } from "@/lib/db";

type BlogRow = {
  slug: string;
  title: string;
  content_html: string;
  cover_image: string | null;
  image_alt: string | null;
};

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const row = await query<BlogRow>(
    `select slug, title, content_html, cover_image, image_alt
     from blog_posts
     where slug = $1 and published = true
     limit 1`,
    [slug],
  );
  const post = row.rows[0];
  if (!post) notFound();

  return (
    <article className="qh-container qh-section-pad">
      <h1 className="mb-4 font-display text-3xl font-black text-text-main">{post.title}</h1>
      {post.cover_image ? <img src={post.cover_image} alt={post.image_alt || post.title} className="mb-5 max-h-[380px] w-full rounded-xl object-cover" /> : null}
      <div className="qh-seo-copy max-w-none" dangerouslySetInnerHTML={{ __html: post.content_html || "" }} />
    </article>
  );
}
