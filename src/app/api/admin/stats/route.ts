import { query } from "@/lib/db";

type CountRow = {
  count: string;
};

export async function GET() {
  try {
    const [usersResult, productsResult, ordersResult, cartsResult, wishlistsResult] = await Promise.all([
      query<CountRow>("SELECT COUNT(*) as count FROM users"),
      query<CountRow>("SELECT COUNT(*) as count FROM products"),
      query<CountRow>("SELECT COUNT(*) as count FROM orders"),
      query<CountRow>("SELECT COUNT(*) as count FROM carts"),
      query<CountRow>("SELECT COUNT(*) as count FROM wishlists"),
    ]);

    const stats = {
      totalUsers: parseInt(usersResult.rows[0]?.count || "0"),
      totalProducts: parseInt(productsResult.rows[0]?.count || "0"),
      totalOrders: parseInt(ordersResult.rows[0]?.count || "0"),
      totalCarts: parseInt(cartsResult.rows[0]?.count || "0"),
      totalWishlists: parseInt(wishlistsResult.rows[0]?.count || "0"),
    };

    return Response.json(stats);
  } catch (error) {
    console.error("Admin stats error:", error);
    return Response.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
