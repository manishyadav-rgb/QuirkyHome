"use client";

import { useEffect, useMemo, useState } from "react";
import { Puck } from "@puckeditor/core";
import "@puckeditor/core/puck.css";

type BuilderSchema = {
  themeSettings: Record<string, any>;
  pages: Record<string, any>;
};

const puckConfig: any = {
  components: {
    HeadingBlock: {
      label: "Heading",
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        title: "Your heading",
        subtitle: "Write a short supporting line",
        align: "left",
      },
      render: ({ title, subtitle, align }: any) => (
        <section style={{ textAlign: align || "left", padding: "28px 20px" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,38px)", lineHeight: 1.15, fontWeight: 800 }}>{title}</h2>
          {subtitle ? <p style={{ marginTop: 10, color: "#666", fontSize: "16px" }}>{subtitle}</p> : null}
        </section>
      ),
    },
    RichTextBlock: {
      label: "Rich Text",
      fields: {
        content: { type: "textarea" },
      },
      defaultProps: {
        content: "Add your content here.",
      },
      render: ({ content }: any) => (
        <section style={{ padding: "16px 20px", color: "#333", lineHeight: 1.7, fontSize: 15 }}>{content}</section>
      ),
    },
    ImageBanner: {
      label: "Image Banner",
      fields: {
        imageUrl: { type: "text" },
        alt: { type: "text" },
        height: { type: "number" },
      },
      defaultProps: {
        imageUrl: "",
        alt: "Banner image",
        height: 360,
      },
      render: ({ imageUrl, alt, height }: any) => (
        <section style={{ padding: "12px 20px" }}>
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              background: "#f2f2f2",
              minHeight: 180,
              height: Number(height) || 360,
            }}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#888", fontWeight: 600 }}>
                Add image URL
              </div>
            )}
          </div>
        </section>
      ),
    },
    CTAButton: {
      label: "CTA Button",
      fields: {
        text: { type: "text" },
        href: { type: "text" },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        text: "Shop now",
        href: "/search",
        align: "left",
      },
      render: ({ text, href, align }: any) => (
        <section style={{ textAlign: align || "left", padding: "16px 20px 28px" }}>
          <a
            href={href || "#"}
            style={{
              display: "inline-flex",
              padding: "11px 20px",
              borderRadius: 999,
              background: "#8a6636",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            {text || "Shop now"}
          </a>
        </section>
      ),
    },
  },
};

export default function QhAdminPuckBuilderPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schema, setSchema] = useState<BuilderSchema | null>(null);
  const [puckData, setPuckData] = useState<any>({ content: [] });

  useEffect(() => {
    fetch("/api/admin/builder?site_id=quirkyhome", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const nextSchema = data?.schema || null;
        setSchema(nextSchema);
        const savedPuck = nextSchema?.pages?.home?.puckData;
        if (savedPuck && typeof savedPuck === "object") {
          setPuckData(savedPuck);
        } else {
          setPuckData({ content: [] });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const header = useMemo(() => {
    if (!schema) return "Puck Builder";
    return `Puck Builder - ${schema.pages?.home?.name || "Home"}`;
  }, [schema]);

  async function handlePublish(data: any) {
    if (!schema) return;
    setSaving(true);
    const nextSchema = {
      ...schema,
      pages: {
        ...schema.pages,
        home: {
          ...(schema.pages?.home || { name: "Home Page", slug: "home", sections: [] }),
          puckData: data,
        },
      },
    };
    const res = await fetch("/api/admin/builder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ schema: nextSchema, site_id: "quirkyhome" }),
    });
    if (res.ok) {
      setSchema(nextSchema);
      setPuckData(data);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f6f7]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#ddd] border-t-[#8a6636]" />
          <p className="mt-3 text-sm text-[#666]">Loading Puck builder...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f7]">
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#e5e2dc] bg-white px-4 py-3">
        <h1 className="text-sm font-bold text-[#1f1f1f]">{header}</h1>
        <div className="text-xs font-semibold text-[#6d7175]">{saving ? "Saving..." : "Auto-ready to publish"}</div>
      </div>
      <Puck config={puckConfig} data={puckData} onPublish={handlePublish} />
    </div>
  );
}
