"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image: string | null;
  image_alt: string | null;
  content_html: string;
  published: boolean;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminContentPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [message, setMessage] = useState("");
  const editorRef = useRef<HTMLTextAreaElement>(null);

  async function loadPosts() {
    const res = await fetch("/api/admin/content");
    const data = await res.json();
    setPosts(Array.isArray(data.posts) ? data.posts : []);
  }

  useEffect(() => {
    loadPosts();
  }, []);

  function wrapSelection(before: string, after: string) {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const selected = contentHtml.slice(start, end) || "text";
    const next = `${contentHtml.slice(0, start)}${before}${selected}${after}${contentHtml.slice(end)}`;
    setContentHtml(next);
  }

  function insertImageTag() {
    const src = coverImage.trim();
    if (!src) return;
    const alt = imageAlt.trim() || title.trim() || "blog image";
    const html = `<img src="${src}" alt="${alt}" />`;
    setContentHtml((prev) => `${prev}\n${html}\n`);
  }

  async function savePost() {
    const body = {
      title,
      slug: slug || toSlug(title),
      excerpt,
      coverImage,
      imageAlt,
      contentHtml,
      published: true,
    };
    const res = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setMessage(data.error || "Save failed");
      return;
    }
    setMessage("Blog saved");
    await loadPosts();
  }

  async function deletePost(id: number) {
    const res = await fetch(`/api/admin/content?id=${id}`, { method: "DELETE" });
    if (res.ok) loadPosts();
  }

  const builderSlugs = useMemo(() => posts.map((p) => p.slug).join(", "), [posts]);

  return (
    <div className="grid gap-5">
      <div>
        <h2 className="text-xl font-semibold text-[#202223]">Content</h2>
        <p className="text-[13px] text-[#6d7175]">Manage your store pages and blog posts</p>
        <p className="mt-1 text-[13px] text-[#6d7175]">Create pages and blog posts. Add pages like About Us, Contact, FAQs and manage blog content.</p>
      </div>

      <div className="rounded-lg border border-[#e1e3e5] bg-white p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input value={title} onChange={(e) => { setTitle(e.target.value); if (!slug) setSlug(toSlug(e.target.value)); }} placeholder="Blog title" className="rounded-md border border-[#c9cccf] px-3 py-2 text-sm" />
          <input value={slug} onChange={(e) => setSlug(toSlug(e.target.value))} placeholder="blog-slug" className="rounded-md border border-[#c9cccf] px-3 py-2 text-sm" />
          <input value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="Cover image URL" className="rounded-md border border-[#c9cccf] px-3 py-2 text-sm" />
          <input value={imageAlt} onChange={(e) => setImageAlt(e.target.value)} placeholder="Image alt text" className="rounded-md border border-[#c9cccf] px-3 py-2 text-sm" />
        </div>
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Short excerpt" rows={2} className="mt-3 w-full rounded-md border border-[#c9cccf] px-3 py-2 text-sm" />

        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => wrapSelection("<h2>", "</h2>")} className="rounded border px-3 py-1 text-xs">H2</button>
          <button onClick={() => wrapSelection("<strong>", "</strong>")} className="rounded border px-3 py-1 text-xs font-bold">Bold</button>
          <button onClick={() => wrapSelection('<a href="">', "</a>")} className="rounded border px-3 py-1 text-xs">Hyperlink</button>
          <button onClick={insertImageTag} className="rounded border px-3 py-1 text-xs">Insert Image + Alt</button>
        </div>

        <textarea ref={editorRef} value={contentHtml} onChange={(e) => setContentHtml(e.target.value)} rows={14} className="mt-3 w-full rounded-md border border-[#c9cccf] px-3 py-2 text-sm" placeholder="Write HTML content here..." />
        <div className="mt-3 flex gap-2">
          <button onClick={savePost} className="rounded bg-[#008060] px-4 py-2 text-sm font-semibold text-white">Save Blog</button>
          {message ? <span className="text-sm text-[#6d7175]">{message}</span> : null}
        </div>
      </div>

      <div className="rounded-lg border border-[#e1e3e5] bg-white p-4">
        <h3 className="mb-2 text-sm font-semibold text-[#202223]">Blog list ({posts.length})</h3>
        <p className="mb-3 text-xs text-[#6d7175]">Builder BlogGrid me `blogSlugs` me ye values use karo: {builderSlugs || "no blogs yet"}</p>
        <div className="grid gap-2">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center justify-between rounded border border-[#e1e3e5] px-3 py-2">
              <div>
                <p className="text-sm font-semibold">{post.title}</p>
                <p className="text-xs text-[#6d7175]">/{post.slug}</p>
              </div>
              <button onClick={() => deletePost(post.id)} className="rounded border px-2 py-1 text-xs text-[#b42318]">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
