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
    category: "hero",
    description: "Catchy main banner with headline and CTA",
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
    category: "utility",
    description: "Quick search bar with suggested keywords",
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
    category: "content",
    description: "Grid of product categories with images",
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
    category: "content",
    description: "Showcase of curated collections",
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
    category: "product",
    description: "Dynamic list of products from catalog",
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
    category: "trust",
    description: "Trust badges and brand promises",
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
    category: "form",
    description: "Email signup form for updates",
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
    category: "content",
    description: "SEO-friendly content with heading and paragraph fields",
    fields: [
      {
        key: "headingTag",
        label: "Heading Level",
        type: "select",
        defaultValue: "h2",
        options: [
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
          { label: "H3", value: "h3" },
          { label: "H4", value: "h4" },
          { label: "H5", value: "h5" },
          { label: "H6", value: "h6" },
        ],
      },
      { key: "headingText", label: "Main Heading", type: "text", defaultValue: "QuirkyHome - Buy Home Decor Items Online in India" },
      { key: "content", label: "Content Paragraph 1", type: "textarea", defaultValue: "QuirkyHome is built for people who want beautiful home decor without making shopping feel complicated. Explore bedding, home furnishing, wall decor, table lamps, dining essentials, kitchen products, bath accessories, planters, storage baskets, showpieces and thoughtful gifts for Indian homes." },
      {
        key: "subheadingTag",
        label: "Second Heading Level",
        type: "select",
        defaultValue: "h2",
        options: [
          { label: "H1", value: "h1" },
          { label: "H2", value: "h2" },
          { label: "H3", value: "h3" },
          { label: "H4", value: "h4" },
          { label: "H5", value: "h5" },
          { label: "H6", value: "h6" },
        ],
      },
      { key: "subheadingText", label: "Second Heading", type: "text", defaultValue: "Shop Home Decor by Category" },
      { key: "content2", label: "Content Paragraph 2", type: "textarea", defaultValue: "Whether you are refreshing a bedroom, setting up a living room, styling a dining table or choosing a housewarming gift, our category-led shopping experience helps you find the right product quickly. Every product card keeps price, discount, rating, wishlist and add-to-cart actions easy to scan on mobile and desktop." },
    ],
    defaultSettings: {
      headingTag: "h2",
      headingText: "QuirkyHome - Buy Home Decor Items Online in India",
      content: "QuirkyHome is built for people who want beautiful home decor without making shopping feel complicated. Explore bedding, home furnishing, wall decor, table lamps, dining essentials, kitchen products, bath accessories, planters, storage baskets, showpieces and thoughtful gifts for Indian homes.",
      subheadingTag: "h2",
      subheadingText: "Shop Home Decor by Category",
      content2: "Whether you are refreshing a bedroom, setting up a living room, styling a dining table or choosing a housewarming gift, our category-led shopping experience helps you find the right product quickly. Every product card keeps price, discount, rating, wishlist and add-to-cart actions easy to scan on mobile and desktop.",
    },
  },

  {
    type: "BannerStrip",
    label: "Announcement Bar",
    icon: "Megaphone",
    category: "hero",
    description: "Announcement strip for the top of the page",
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
