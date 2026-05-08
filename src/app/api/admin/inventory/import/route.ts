import { importInventoryItem } from "@/lib/admin-products";
import { extractDynamoInventoryItems, normalizeDynamoInventoryItem, type DynamoInventoryItem } from "@/lib/dynamodb";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCandidate = body?.raw ?? body;
    let item: DynamoInventoryItem;

    if (typeof body?.sku === "string" && body.sku.trim() && typeof body?.title === "string" && body.title.trim()) {
      const base = normalizeDynamoInventoryItem(body);
      item = {
        ...base,
        source_pk: typeof body.source_pk === "string" && body.source_pk.trim() ? body.source_pk.trim() : base.source_pk,
        source_sk: typeof body.source_sk === "string" && body.source_sk.trim() ? body.source_sk.trim() : base.source_sk,
        sku: body.sku.trim(),
        title: body.title.trim(),
        slug: typeof body.slug === "string" && body.slug.trim() ? body.slug.trim() : base.slug,
        category: typeof body.category === "string" && body.category.trim() ? body.category.trim() : base.category,
        collection: typeof body.collection === "string" && body.collection.trim() ? body.collection.trim() : base.collection,
        description: typeof body.description === "string" && body.description.trim() ? body.description.trim() : base.description,
        image_url: typeof body.image_url === "string" && body.image_url.trim() ? body.image_url.trim() : base.image_url,
        mrp: Number.isFinite(Number(body.mrp)) ? Number(body.mrp) : base.mrp,
        sale_price: Number.isFinite(Number(body.sale_price)) ? Number(body.sale_price) : base.sale_price,
        quantity_available: Number.isFinite(Number(body.quantity_available)) ? Number(body.quantity_available) : base.quantity_available,
        raw: typeof body.raw === "object" && body.raw ? body.raw : base.raw,
      };
    } else {
      item = extractDynamoInventoryItems(rawCandidate)[0] ?? normalizeDynamoInventoryItem(rawCandidate);
    }

    if (!item?.sku || item.sku.trim().toUpperCase() === "SKU") {
      return Response.json({ error: "Invalid SKU received from DynamoDB row. Product was not imported." }, { status: 400 });
    }

    const result = await importInventoryItem(item);

    return Response.json({ ok: true, ...result });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to import product" },
      { status: 500 },
    );
  }
}
