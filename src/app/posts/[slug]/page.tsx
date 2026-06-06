import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { getBuilderSchema } from "@/lib/builder/fetch-schema";
import { PuckContentRenderer } from "@/components/storefront/PuckContentRenderer";
import { RenderSections } from "@/components/storefront/SectionRenderer";
import type { Metadata } from "next";
import { BASE_URL } from "@/lib/sitemaps";

type BlogRow = {
  slug: string;
  title: string;
  content_html: string;
  cover_image: string | null;
  image_alt: string | null;
  created_at?: string;
  updated_at?: string;
};

async function getPostContext(slug: string) {
  const schema = await getBuilderSchema("quirkyhome");
  const page = Object.values(schema?.pages || {}).find((p: any) => p?.slug === slug) as any;
  const row = await query<BlogRow>(
    `select slug, title, content_html, cover_image, image_alt, created_at, updated_at
     from blog_posts
     where slug = $1 and published = true
     limit 1`,
    [slug],
  );
  const post = row.rows[0] || null;
  return { schema, page, post };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { page, post } = await getPostContext(slug);
  const title = post?.title || page?.name || "Post";
  const description = post?.content_html
    ? String(post.content_html).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160)
    : `Read ${title} on QuirkyHome.`;
  return {
    title,
    description,
    alternates: { canonical: `/posts/${slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `${BASE_URL}/posts/${slug}`,
      images: post?.cover_image ? [{ url: post.cover_image, alt: post.image_alt || title }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { schema, page, post } = await getPostContext(slug);

  if (page?.lastPublishedBuilder === "advanced" && page?.puckData) {
    const postTitle = post?.title || page?.name || slug;
    const image = post?.cover_image || null;
    const updated = post?.updated_at || page?.lastPublishedAt || null;
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: postTitle,
              url: `${BASE_URL}/posts/${slug}`,
              image: image ? [image] : undefined,
              dateModified: updated ? new Date(updated).toISOString() : undefined,
              author: { "@type": "Organization", name: "QuirkyHome" },
              publisher: { "@type": "Organization", name: "QuirkyHome" },
            }),
          }}
        />
        <PuckContentRenderer data={page.puckData} />
      </>
    );
  }

  if (page?.lastPublishedBuilder === "legacy" && Array.isArray(page?.sections) && page.sections.length > 0 && schema?.themeSettings) {
    return <RenderSections sections={page.sections} theme={schema.themeSettings as any} />;
  }
  if (!post) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            url: `${BASE_URL}/posts/${slug}`,
            image: post.cover_image ? [post.cover_image] : undefined,
            datePublished: post.created_at ? new Date(post.created_at).toISOString() : undefined,
            dateModified: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
            author: { "@type": "Organization", name: "QuirkyHome" },
            publisher: { "@type": "Organization", name: "QuirkyHome" },
          }),
        }}
      />
      <article className="qh-container qh-section-pad">
        <h1 className="mb-4 font-display text-3xl font-black text-text-main">{post.title}</h1>
        {post.cover_image ? <img src={post.cover_image} alt={post.image_alt || post.title} className="mb-5 max-h-[380px] w-full rounded-xl object-cover" /> : null}
        <div className="qh-seo-copy max-w-none" dangerouslySetInnerHTML={{ __html: post.content_html || "" }} />
      </article>
    </>
  );
}
