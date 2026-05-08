/**
 * QuirkyHome Visual Page Builder — Section Registry
 * 
 * Maps each SectionType to its metadata, default settings,
 * and the field schema used by the dynamic sidebar editor.
 */

import type { SectionDefinition } from "./types";

export const sectionRegistry: SectionDefinition[] = [
  {
    type: "HeroBanner",
    label: "Hero Banner",
    icon: "Image",
    fields: [
      { key: "heading", label: "Heading", type: "text", defaultValue: "Buy Home Decor Items Online for Every Indian Home" },
      { key: "subheading", label: "Subheading", type: "textarea", defaultValue: "Shop bedsheets, wall decor, table lamps, kitchen essentials, dining pieces, planters, gifts, and curated home accessories at friendly prices." },
      { key: "badgeText", label: "Badge Text", type: "text", defaultValue: "Festive Home Refresh Sale" },
      { key: "button1Text", label: "Primary Button Text", type: "text", defaultValue: "Shop the Sale" },
      { key: "button1Link", label: "Primary Button Link", type: "text", defaultValue: "/category/wall-decor" },
      { key: "button2Text", label: "Secondary Button Text", type: "text", defaultValue: "Explore Collections" },
      { key: "button2Link", label: "Secondary Button Link", type: "text", defaultValue: "/search" },
      { key: "imageUrl", label: "Background Image URL", type: "image", defaultValue: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80" },
      { key: "feature1", label: "Feature 1", type: "text", defaultValue: "Fast delivery" },
      { key: "feature2", label: "Feature 2", type: "text", defaultValue: "Secure checkout" },
      { key: "feature3", label: "Feature 3", type: "text", defaultValue: "Curated picks" },
    ],
    defaultSettings: {
      heading: "Buy Home Decor Items Online for Every Indian Home",
      subheading: "Shop bedsheets, wall decor, table lamps, kitchen essentials, dining pieces, planters, gifts, and curated home accessories at friendly prices.",
      badgeText: "Festive Home Refresh Sale",
      button1Text: "Shop the Sale",
      button1Link: "/category/wall-decor",
      button2Text: "Explore Collections",
      button2Link: "/search",
      imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=80",
      feature1: "Fast delivery",
      feature2: "Secure checkout",
      feature3: "Curated picks",
    },
  },
  {
    type: "SearchBand",
    label: "Search Band",
    icon: "Search",
    fields: [
      { key: "label", label: "Label", type: "text", defaultValue: "Search for" },
      { key: "chips", label: "Chips (comma separated)", type: "text", defaultValue: "Bedsheets, Wall Art, Lamps, Planters" },
    ],
    defaultSettings: {
      label: "Search for",
      chips: "Bedsheets, Wall Art, Lamps, Planters",
    },
  },
  {
    type: "CategoryGrid",
    label: "Category Grid",
    icon: "Grid",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text", defaultValue: "Shop by category" },
      { key: "heading", label: "Heading", type: "text", defaultValue: "Home decor, furnishing and essentials" },
      { key: "subheading", label: "Subheading", type: "text", defaultValue: "Find bedding, wall decor, lighting, kitchen, dining, bath, garden, gifts, storage and showpieces in one place." },
    ],
    defaultSettings: {
      eyebrow: "Shop by category",
      heading: "Home decor, furnishing and essentials",
      subheading: "Find bedding, wall decor, lighting, kitchen, dining, bath, garden, gifts, storage and showpieces in one place.",
    },
  },
  {
    type: "CollectionsSection",
    label: "Collections Section",
    icon: "FolderOpen",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text", defaultValue: "Collections" },
      { key: "heading", label: "Heading", type: "text", defaultValue: "Shop by collection" },
      { key: "subheading", label: "Subheading", type: "text", defaultValue: "Curated product sets to help you discover your style." },
    ],
    defaultSettings: {
      eyebrow: "Collections",
      heading: "Shop by collection",
      subheading: "Curated product sets to help you discover your style.",
    },
  },
  {
    type: "ProductGrid",
    label: "Product Grid",
    icon: "Grid3x3",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text", defaultValue: "Sale picks" },
      { key: "heading", label: "Heading", type: "text", defaultValue: "Premium finds, friendly prices" },
      { key: "subheading", label: "Subheading", type: "text", defaultValue: "Shop bestselling home decor products with clear pricing, ratings, wishlist and add-to-cart actions." },
    ],
    defaultSettings: {
      eyebrow: "Sale picks",
      heading: "Premium finds, friendly prices",
      subheading: "Shop bestselling home decor products with clear pricing, ratings, wishlist and add-to-cart actions.",
    },
  },
  {
    type: "PromisesSection",
    label: "Promises Section",
    icon: "ShieldCheck",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text", defaultValue: "Why choose us" },
      { key: "heading", label: "Heading", type: "text", defaultValue: "A calmer, warmer way to shop for home" },
    ],
    defaultSettings: {
      eyebrow: "Why choose us",
      heading: "A calmer, warmer way to shop for home",
    },
  },
  {
    type: "Newsletter",
    label: "Newsletter Signup",
    icon: "Mail",
    fields: [
      { key: "eyebrow", label: "Eyebrow Text", type: "text", defaultValue: "Decor notes" },
      { key: "heading", label: "Heading", type: "text", defaultValue: "Ideas, offers and new drops" },
      { key: "subheading", label: "Subheading", type: "text", defaultValue: "Get room styling inspiration, festive sale alerts and new home essentials in your inbox." },
      { key: "buttonText", label: "Button Text", type: "text", defaultValue: "Join Newsletter" },
    ],
    defaultSettings: {
      eyebrow: "Decor notes",
      heading: "Ideas, offers and new drops",
      subheading: "Get room styling inspiration, festive sale alerts and new home essentials in your inbox.",
      buttonText: "Join Newsletter",
    },
  },
  {
    type: "SeoArticle",
    label: "SEO Article",
    icon: "FileText",
    fields: [
      { key: "content", label: "HTML Content", type: "textarea", defaultValue: "<h2>QuirkyHome - Buy Home Decor Items Online in India</h2><p>QuirkyHome is built for people who want beautiful home decor without making shopping feel complicated...</p>" },
    ],
    defaultSettings: {
      content: "<h2>QuirkyHome - Buy Home Decor Items Online in India</h2><p>QuirkyHome is built for people who want beautiful home decor without making shopping feel complicated.</p><h2>Shop Home Decor by Category</h2><p>Every product card keeps price, discount, rating, wishlist and add-to-cart actions easy to scan on mobile and desktop.</p>",
    },
  },

  {
    type: "BannerStrip",
    label: "Announcement Bar",
    icon: "Megaphone",
    fields: [
      { key: "text", label: "Announcement Text", type: "text", defaultValue: "Free shipping on orders above ₹999!" },
      { key: "bgColor", label: "Background Color", type: "color", defaultValue: "#008060" },
      { key: "textColor", label: "Text Color", type: "color", defaultValue: "#ffffff" },
      { key: "link", label: "Link (optional)", type: "text", defaultValue: "" },
    ],
    defaultSettings: {
      text: "Free shipping on orders above ₹999!",
      bgColor: "#008060",
      textColor: "#ffffff",
      link: "",
    },
  },
];

/** Lookup a section definition by type */
export function getSectionDef(type: string): SectionDefinition | undefined {
  return sectionRegistry.find((s) => s.type === type);
}
