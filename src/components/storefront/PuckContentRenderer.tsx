import { Render } from "@puckeditor/core";

function lines(input: string) {
  return String(input || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}

const puckRenderConfig: any = {
  components: {
    AnnouncementBar: {
      render: ({ text, bgColor, textColor }: any) => (
        <div style={{ background: bgColor || "#8a6636", color: textColor || "#fff", padding: "10px 16px", textAlign: "center", fontWeight: 700 }}>{text}</div>
      ),
    },
    HeadingBlock: {
      render: ({ title, subtitle, align }: any) => (
        <section style={{ textAlign: align || "left", padding: "28px 20px" }}>
          <h2 style={{ fontSize: "clamp(24px,4vw,38px)", lineHeight: 1.15, fontWeight: 800 }}>{title}</h2>
          {subtitle ? <p style={{ marginTop: 10, color: "#666", fontSize: 16 }}>{subtitle}</p> : null}
        </section>
      ),
    },
    HeroSection: {
      render: ({ title, subtitle, buttonText, buttonLink, imageUrl }: any) => (
        <section style={{ padding: "28px 20px" }}>
          <div style={{ borderRadius: 22, overflow: "hidden", background: "#f4efe7", display: "grid", gap: 18, padding: 22 }}>
            {imageUrl ? <img src={imageUrl} alt="" style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 16 }} /> : null}
            <div>
              <h2 style={{ fontSize: "clamp(24px,4vw,40px)", lineHeight: 1.1, fontWeight: 800 }}>{title}</h2>
              <p style={{ marginTop: 10, color: "#5f5a53", fontSize: 16 }}>{subtitle}</p>
              {buttonText ? <a href={buttonLink || "#"} style={{ marginTop: 14, display: "inline-flex", padding: "10px 18px", borderRadius: 999, background: "#8a6636", color: "#fff", textDecoration: "none", fontWeight: 700 }}>{buttonText}</a> : null}
            </div>
          </div>
        </section>
      ),
    },
    RichTextBlock: {
      render: ({ content }: any) => <section style={{ padding: "16px 20px", color: "#333", lineHeight: 1.7, fontSize: 15 }}>{content}</section>,
    },
    CategoryGrid: {
      render: ({ heading, items }: any) => (
        <section style={{ padding: "22px 20px" }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>{heading}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
            {lines(items).map((item) => <div key={item} style={{ border: "1px solid #e8e2d8", borderRadius: 14, padding: "14px 12px", background: "#fff", fontWeight: 700 }}>{item}</div>)}
          </div>
        </section>
      ),
    },
    ProductGrid: {
      render: ({ heading, cardTitles }: any) => (
        <section style={{ padding: "22px 20px" }}>
          <h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 14 }}>{heading}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12 }}>
            {lines(cardTitles).map((item, i) => <div key={`${item}-${i}`} style={{ border: "1px solid #e8e2d8", borderRadius: 16, overflow: "hidden", background: "#fff" }}><div style={{ height: 130, background: "#f5f3ef" }} /><div style={{ padding: 12, fontWeight: 700 }}>{item}</div></div>)}
          </div>
        </section>
      ),
    },
    ImageBanner: {
      render: ({ imageUrl, alt, height }: any) => <section style={{ padding: "12px 20px" }}><div style={{ borderRadius: 20, overflow: "hidden", background: "#f2f2f2", minHeight: 180, height: Number(height) || 360 }}>{imageUrl ? <img src={imageUrl} alt={alt || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : null}</div></section>,
    },
    Testimonials: {
      render: ({ heading, quotes }: any) => <section style={{ padding: "22px 20px" }}><h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{heading}</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>{lines(quotes).map((q, i) => <div key={`${q}-${i}`} style={{ border: "1px solid #e8e2d8", borderRadius: 14, padding: 14, background: "#fff" }}>"{q}"</div>)}</div></section>,
    },
    FAQSection: {
      render: ({ heading, questions }: any) => <section style={{ padding: "22px 20px" }}><h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{heading}</h3><div style={{ display: "grid", gap: 8 }}>{lines(questions).map((q, i) => <details key={`${q}-${i}`} style={{ border: "1px solid #e8e2d8", borderRadius: 12, padding: "10px 12px", background: "#fff" }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>{q}</summary></details>)}</div></section>,
    },
    CTAButton: {
      render: ({ text, href, align }: any) => <section style={{ textAlign: align || "left", padding: "16px 20px 28px" }}><a href={href || "#"} style={{ display: "inline-flex", padding: "11px 20px", borderRadius: 999, background: "#8a6636", color: "#fff", fontWeight: 700, textDecoration: "none" }}>{text || "Shop now"}</a></section>,
    },
    Divider: { render: ({ height }: any) => <div style={{ height: Number(height) || 32 }} /> },
    CustomHTML: { render: ({ html }: any) => <div dangerouslySetInnerHTML={{ __html: html || "" }} /> },
    PromoStrip: { render: ({ title, subtitle, ctaText, ctaHref }: any) => <section style={{ padding: "20px" }}><div style={{ borderRadius: 18, padding: "18px 16px", background: "linear-gradient(135deg,#8a6636,#6e4f2b)", color: "#fff" }}><h3 style={{ marginTop: 2, fontSize: 24, fontWeight: 800 }}>{title}</h3><p style={{ marginTop: 8 }}>{subtitle}</p><a href={ctaHref || "#"} style={{ marginTop: 14, display: "inline-flex", background: "#fff", color: "#6e4f2b", borderRadius: 999, padding: "9px 16px", textDecoration: "none", fontWeight: 700 }}>{ctaText}</a></div></section> },
    TrustBadges: { render: ({ heading, badges }: any) => <section style={{ padding: "20px" }}><h3 style={{ fontSize: 24, fontWeight: 800 }}>{heading}</h3><div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))", gap: 10 }}>{lines(badges).map((item, i) => <div key={`${item}-${i}`} style={{ border: "1px solid #e8e2d8", borderRadius: 12, padding: "12px", background: "#fff", fontWeight: 600 }}>{item}</div>)}</div></section> },
    LogoStrip: { render: ({ heading, logos }: any) => <section style={{ padding: "20px" }}><h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{heading}</h3><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 10 }}>{lines(logos).map((logo, i) => <div key={`${logo}-${i}`} style={{ border: "1px solid #e8e2d8", borderRadius: 10, background: "#fff", minHeight: 64, display: "grid", placeItems: "center", padding: 8 }}><img src={logo} alt={`logo-${i + 1}`} style={{ maxHeight: 40, width: "100%", objectFit: "contain" }} /></div>)}</div></section> },
    NewsletterBlock: { render: ({ heading, subheading, buttonText }: any) => <section style={{ padding: "20px" }}><div style={{ border: "1px solid #e8e2d8", borderRadius: 16, padding: 16, background: "#fffdf9" }}><h3 style={{ fontSize: 24, fontWeight: 800 }}>{heading}</h3><p style={{ marginTop: 8, color: "#5f5a53" }}>{subheading}</p><button style={{ marginTop: 12, borderRadius: 10, border: "none", background: "#8a6636", color: "#fff", padding: "10px 14px", fontWeight: 700 }}>{buttonText}</button></div></section> },
    ContactBlock: { render: ({ heading, subheading }: any) => <section style={{ padding: "20px" }}><div style={{ border: "1px solid #e8e2d8", borderRadius: 16, padding: 16, background: "#fff" }}><h3 style={{ fontSize: 24, fontWeight: 800 }}>{heading}</h3><p style={{ marginTop: 8, color: "#5f5a53" }}>{subheading}</p></div></section> },
    VideoEmbed: { render: ({ heading, videoUrl }: any) => <section style={{ padding: "20px" }}><h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{heading}</h3><div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e8e2d8", background: "#000" }}><iframe title="video" src={videoUrl} style={{ width: "100%", height: 360, border: "none" }} allowFullScreen /></div></section> },
    ReelCards: { render: ({ heading, images }: any) => <section style={{ padding: "20px" }}><h3 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>{heading}</h3><div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "minmax(170px,220px)", gap: 10, overflowX: "auto", paddingBottom: 6 }}>{lines(images).map((img, i) => <div key={`${img}-${i}`} style={{ borderRadius: 14, overflow: "hidden", background: "#f5f3ef", height: 280 }}><img src={img} alt={`reel-${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>)}</div></section> },
    BlogPost: {
      render: ({ title, headingTag, headingSize, excerpt, excerptSize, coverImage, imageAlt, contentHtml, contentSize, contentLineHeight }: any) => {
        const HeadingTag = (["h1", "h2", "h3", "h4"].includes(String(headingTag)) ? String(headingTag) : "h1") as "h1" | "h2" | "h3" | "h4";
        return (
          <article style={{ padding: "24px 20px", maxWidth: 860, margin: "0 auto" }}>
            <HeadingTag style={{ fontSize: `clamp(28px,4vw,${Number(headingSize) || 42}px)`, lineHeight: 1.1, fontWeight: 900 }}>{title}</HeadingTag>
            {excerpt ? <p style={{ marginTop: 10, color: "#5f5a53", fontSize: Number(excerptSize) || 16 }}>{excerpt}</p> : null}
            {coverImage ? <img src={coverImage} alt={imageAlt || title || ""} style={{ width: "100%", marginTop: 16, borderRadius: 16, objectFit: "cover", maxHeight: 480 }} /> : null}
            <div style={{ marginTop: 16, color: "#2f2c29", lineHeight: Number(contentLineHeight) || 1.8, fontSize: Number(contentSize) || 16 }} dangerouslySetInnerHTML={{ __html: contentHtml || "" }} />
          </article>
        );
      },
    },
  },
};

export function PuckContentRenderer({ data }: { data: any }) {
  return <Render config={puckRenderConfig} data={data || { content: [] }} />;
}
