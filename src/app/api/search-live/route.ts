import { NextResponse } from "next/server";
import { getCatalogProducts } from "@/lib/catalog";

export const runtime = "nodejs";

export async function GET() {
  try {
    const products = await getCatalogProducts();
    // Return only essential fields to keep payload extremely small and fast
    const slim = products.map((p) => ({
      title: p.title,
      slug: p.slug,
      image: p.image,
      price: p.price,
      mrp: p.mrp,
      category: p.category,
    }));
    return NextResponse.json({ products: slim });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
