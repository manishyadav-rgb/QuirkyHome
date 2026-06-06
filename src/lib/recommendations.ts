import { QdrantClient } from "@qdrant/js-client-rest";
import { listAdminProducts, type AdminProductRow } from "@/lib/admin-products";
import { getCatalogProducts } from "@/lib/catalog";
import type { Product } from "@/data/products";

const VECTOR_SIZE = 384;
const COLLECTION = process.env.QDRANT_COLLECTION || "qh_products_reco_v1";
const EMBED_MODEL = process.env.QDRANT_EMBED_MODEL || "intfloat/multilingual-e5-small";

function getQdrantClient() {
  const url = process.env.QDRANT_URL || "";
  const apiKey = process.env.QDRANT_API_KEY || "";
  if (!url || !apiKey) return null;
  return new QdrantClient({ url, apiKey });
}

function buildSemanticText(parts: string[]) {
  return parts
    .map((p) => String(p || "").trim())
    .filter(Boolean)
    .join(". ");
}

function rowToPayload(row: AdminProductRow) {
  const textParts = [
    row.title || "",
    row.category || "",
    row.collection || "",
    row.description || "",
    row.long_description || "",
  ];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category || "bedsheet",
    collection: row.collection || "",
    price: Number(row.sale_price || row.mrp || 0),
    image: row.image_url || "",
    text: buildSemanticText(textParts),
  };
}

export async function ensureRecoCollection() {
  const client = getQdrantClient();
  if (!client) return { ok: false, reason: "Qdrant env missing" as const };

  const collections = await client.getCollections();
  const exists = collections.collections.some((c) => c.name === COLLECTION);
  if (!exists) {
    await client.createCollection(COLLECTION, {
      vectors: { size: VECTOR_SIZE, distance: "Cosine" },
    });
  }
  return { ok: true as const };
}

export async function syncRecommendationsIndex() {
  const client = getQdrantClient();
  if (!client) return { ok: false, reason: "Qdrant env missing", indexed: 0 };

  await ensureRecoCollection();
  const rows = await listAdminProducts();
  const activeRows = rows.filter((r) => r.is_active && r.slug);
  if (!activeRows.length) return { ok: true, indexed: 0 };

  const points = activeRows.map((row) => {
    const payload = rowToPayload(row);
    return {
      id: payload.id,
      vector: {
        text: payload.text,
        model: EMBED_MODEL,
      },
      payload: {
        slug: payload.slug,
        title: payload.title,
        category: payload.category,
        collection: payload.collection,
        price: payload.price,
        image: payload.image,
      },
    };
  });

  await client.upsert(COLLECTION, { points, wait: true } as any);
  return { ok: true, indexed: points.length };
}

function enrichByCatalog(slugs: string[]) {
  return getCatalogProducts().then((products) => {
    const bySlug = new Map(products.map((p) => [p.slug, p]));
    return slugs.map((slug) => bySlug.get(slug)).filter((p): p is Product => !!p);
  });
}

export async function getRecommendedProducts(slug: string, limit = 8) {
  const client = getQdrantClient();
  if (!client) return [];

  await ensureRecoCollection();
  const rows = await listAdminProducts();
  const source = rows.find((r) => r.slug === slug);
  if (!source) return [];

  const sourcePayload = rowToPayload(source);
  const rawResults = await client.query(
    COLLECTION,
    {
      query: {
        text: sourcePayload.text,
        model: EMBED_MODEL,
      },
      limit: Math.max(limit + 4, 12),
      with_payload: true,
    } as any,
  );
  const results: any[] = Array.isArray(rawResults)
    ? rawResults
    : Array.isArray((rawResults as any)?.points)
      ? (rawResults as any).points
      : [];

  const rankedSlugs = results
    .map((r) => String((r.payload as any)?.slug || ""))
    .filter((s) => s && s !== slug);

  const catalog = await enrichByCatalog(rankedSlugs);
  const unique = new Map<string, Product>();
  for (const p of catalog) {
    if (!unique.has(p.slug)) unique.set(p.slug, p);
    if (unique.size >= limit) break;
  }
  return Array.from(unique.values());
}
