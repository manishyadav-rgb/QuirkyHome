import { query } from "@/lib/db";
import { type DynamoInventoryItem, getDynamoImageBySku, getDynamoImagesBySkus } from "@/lib/dynamodb";

export type AdminProductRow = {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  size: string | null;
  collection: string | null;
  description: string | null;
  long_description: string | null;
  sale_price: string | null;
  mrp: string | null;
  quantity_available: number | null;
  image_url: string | null;
  gallery_images: string[] | null;
  category: string | null;
  is_active: boolean;
  created_at: string;
};

export async function listAdminProducts() {
  const result = await query<AdminProductRow>(
    `select
       p.id,
       p.title,
       p.slug,
       p.short_description as description,
       p.long_description,
       pv.sku,
       pv.attributes->>'size' as size,
       pv.attributes->>'collection' as collection,
       pv.sale_price::text,
       pv.mrp::text,
       ii.quantity_available,
       coalesce(pi0.image_url, pi.image_url) as image_url,
       pig.gallery_images,
       c.slug as category,
       p.is_active,
       p.created_at::text
     from products p
     left join product_variants pv on pv.product_id = p.id
     left join inventory_items ii on ii.variant_id = pv.id
     left join product_images pi on pi.product_id = p.id and pi.sort_order = 0
     left join lateral (
       select image_url
       from product_images
       where product_id = p.id
       order by sort_order asc nulls last, created_at asc
       limit 1
     ) pi0 on true
     left join lateral (
       select array_remove(array_agg(image_url order by sort_order asc nulls last, created_at asc), null) as gallery_images
       from product_images
       where product_id = p.id
     ) pig on true
     left join product_category_map pcm on pcm.product_id = p.id
     left join categories c on c.id = pcm.category_id
     order by p.created_at desc
     limit 100`,
  );

  const rows = result.rows;
  const missingImageSkus = rows
    .filter((row) => !row.image_url && row.sku)
    .map((row) => String(row.sku));

  if (missingImageSkus.length > 0) {
    const imageMap = await getDynamoImagesBySkus(missingImageSkus);
    for (const row of rows) {
      const key = String(row.sku || "").trim().toUpperCase();
      if (!row.image_url && key && imageMap[key]) {
        row.image_url = imageMap[key];
      }
    }
  }

  return rows;
}

export async function importInventoryItem(item: DynamoInventoryItem) {
  if (!item.sku || item.sku.trim().toUpperCase() === "SKU") {
    throw new Error("Invalid SKU received from DynamoDB row. Product was not imported.");
  }

  if (!item.title || item.title.trim().toUpperCase() === "SKU") {
    throw new Error("Invalid product title received from DynamoDB row. Product was not imported.");
  }

  const skuSlug = item.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const productSlug = skuSlug || item.slug;
  const collectionSlug = item.collection.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const categorySlug = item.category && item.category !== "uncategorized" ? item.category : collectionSlug || "general";
  const categoryResult = await query<{ id: string }>(
    `insert into categories (name, slug)
     values ($1, $2)
     on conflict (slug) do update set name = excluded.name
     returning id`,
    [categorySlug.replace(/-/g, " "), categorySlug],
  );
  const categoryId = categoryResult.rows[0].id;

  const productResult = await query<{ id: string }>(
    `insert into products (title, slug, short_description, long_description, is_active, is_searchable)
     values ($1, $2, $3, $4, true, true)
     on conflict (slug) do update
     set title = excluded.title,
         short_description = excluded.short_description,
         long_description = excluded.long_description,
         is_active = true,
         is_searchable = true,
         updated_at = now()
     returning id`,
    [item.title, productSlug, item.description, item.description],
  );
  const productId = productResult.rows[0].id;

  await query(
    `insert into product_category_map (product_id, category_id)
     values ($1, $2)
     on conflict do nothing`,
    [productId, categoryId],
  );

  const variantResult = await query<{ id: string }>(
    `insert into product_variants (product_id, sku, title, attributes, mrp, sale_price, is_active)
     values ($1, $2, $3, $4::jsonb, $5, $6, true)
     on conflict (sku) do update
     set product_id = excluded.product_id,
         title = excluded.title,
         attributes = excluded.attributes,
         mrp = excluded.mrp,
         sale_price = excluded.sale_price,
         is_active = true,
         updated_at = now()
     returning id`,
    [
      productId,
      item.sku,
      item.title,
      JSON.stringify({ source: "dynamodb", collection: item.collection, category: item.category }),
      item.mrp || item.sale_price,
      item.sale_price || item.mrp,
    ],
  );
  const variantId = variantResult.rows[0].id;

  await query(
    `insert into inventory_items (variant_id, quantity_available)
     values ($1, $2)
     on conflict (variant_id) do update
     set quantity_available = excluded.quantity_available,
         updated_at = now()`,
    [variantId, item.quantity_available],
  );

  let imageUrls = Array.from(
    new Set(
      (item.image_urls && item.image_urls.length ? item.image_urls : [item.image_url])
        .map((url) => (url || "").trim())
        .filter(Boolean),
    ),
  ).slice(0, 10);

  if (imageUrls.length === 0 && item.sku) {
    const fallbackImage = await getDynamoImageBySku(item.sku);
    if (fallbackImage) {
      imageUrls = [fallbackImage];
    }
  }

  if (imageUrls.length > 0) {
    await query("delete from product_images where product_id = $1", [productId]);

    for (let i = 0; i < imageUrls.length; i++) {
      await query(
        `insert into product_images (product_id, variant_id, image_url, alt_text, sort_order)
         values ($1, $2, $3, $4, $5)`,
        [productId, variantId, imageUrls[i], item.title, i],
      );
    }
  }

  await query(
    `insert into inventory_source_mapping (variant_id, source_system, source_table, source_pk, source_sk, include_in_sync, sync_status, last_synced_at)
     values ($1, 'dynamodb', $2, $3, $4, true, 'synced', now())
     on conflict (variant_id) do update
     set source_table = excluded.source_table,
         source_pk = excluded.source_pk,
         source_sk = excluded.source_sk,
         include_in_sync = true,
         sync_status = 'synced',
         last_synced_at = now(),
         sync_error = null`,
    [variantId, process.env.DYNAMODB_TABLE_NAME ?? process.env.DYNAMO_DATA_TABLE ?? "dynamodb", item.source_pk, item.source_sk ?? null],
  );

  return { productId, variantId };
}
