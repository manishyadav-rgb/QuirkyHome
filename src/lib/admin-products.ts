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

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function resolveUniqueProductSlug(baseSlug: string, currentProductId?: string) {
  const normalizedBaseSlug = slugify(baseSlug);
  if (!normalizedBaseSlug) return "";

  let candidate = normalizedBaseSlug;
  let suffix = 2;

  while (true) {
    const existing = await query<{ id: string }>(
      `select id
       from products
       where slug = $1
       limit 1`,
      [candidate],
    );
    const existingId = existing.rows[0]?.id;

    if (!existingId || existingId === currentProductId) {
      return candidate;
    }

    candidate = `${normalizedBaseSlug}-${suffix}`;
    suffix += 1;
  }
}

export async function listAdminProducts() {
  const result = await query<AdminProductRow>(
    `select
       p.id,
       p.title,
       p.slug,
       p.short_description as description,
       p.long_description,
       pv_sel.sku,
       pv_sel.attributes->>'size' as size,
       pv_sel.attributes->>'collection' as collection,
       pv_sel.sale_price::text,
       pv_sel.mrp::text,
       ii.quantity_available,
       pi0.image_url as image_url,
       pig.gallery_images,
       c.slug as category,
       p.is_active,
       p.created_at::text
     from products p
     left join lateral (
       select pv.id, pv.sku, pv.attributes, pv.sale_price, pv.mrp
       from product_variants pv
       where pv.product_id = p.id
       order by
         case when coalesce(pv.attributes->>'size', '') <> '' then 0 else 1 end,
         pv.created_at asc
       limit 1
     ) pv_sel on true
     left join inventory_items ii on ii.variant_id = pv_sel.id
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
     left join lateral (
       select c.slug
       from product_category_map pcm
       join categories c on c.id = pcm.category_id
       where pcm.product_id = p.id
       order by c.sort_order asc, c.created_at asc
       limit 1
     ) c on true
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

  const existingProductResult = await query<{ id: string }>(
    `select p.id
     from product_variants pv
     join products p on p.id = pv.product_id
     where upper(pv.sku) = upper($1)
     limit 1`,
    [item.sku],
  );
  const existingProductId = existingProductResult.rows[0]?.id;
  const baseProductSlug = slugify(item.title) || slugify(item.slug) || slugify(item.sku);
  const productSlug = await resolveUniqueProductSlug(baseProductSlug, existingProductId);
  const collectionSlug = slugify(item.collection || "");
  const categorySlug = item.category && item.category !== "uncategorized" ? item.category : collectionSlug || "general";
  const categoryResult = await query<{ id: string }>(
    `insert into categories (name, slug)
     values ($1, $2)
     on conflict (slug) do update set name = excluded.name
     returning id`,
    [categorySlug.replace(/-/g, " "), categorySlug],
  );
  const categoryId = categoryResult.rows[0].id;

  const productResult = existingProductId
    ? await query<{ id: string }>(
        `update products
         set title = $1,
             slug = $2,
             short_description = $3,
             long_description = $4,
             is_active = true,
             is_searchable = true,
             updated_at = now()
         where id = $5
         returning id`,
        [item.title, productSlug, item.description, item.description, existingProductId],
      )
    : await query<{ id: string }>(
        `insert into products (title, slug, short_description, long_description, is_active, is_searchable)
         values ($1, $2, $3, $4, true, true)
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
