import { listAdminProducts } from "@/lib/admin-products";
import { query } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("skus") === "1") {
      const rows = await query<{ sku: string }>(
        `select distinct pv.sku
         from product_variants pv
         where pv.sku is not null
           and pv.is_active = true`,
      );
      return Response.json({ skus: rows.rows.map((row) => row.sku) });
    }

    return Response.json(await listAdminProducts());
  } catch (error) {
    console.error("Admin products error:", error);
    return Response.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("clearAll") === "1";

    if (clearAll) {
      await query("delete from products");
      return Response.json({ ok: true, cleared: true });
    }

    if (!id) {
      return Response.json({ error: "Product id is required" }, { status: 400 });
    }

    await query("delete from products where id = $1", [id]);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Admin product delete error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to delete product from relational database" },
      { status: 500 },
    );
  }
}
