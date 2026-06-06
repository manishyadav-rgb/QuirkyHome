import { query } from "@/lib/db";

type CountRow = {
  count: string;
};

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return Response.json({
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalCarts: 0,
      totalWishlists: 0,
    });
  }

  try {
    const [usersResult, productsResult, ordersResult, cartsResult, wishlistsResult] = await Promise.all([
      query<CountRow>("SELECT COUNT(*) as count FROM users"),
      query<CountRow>("SELECT COUNT(*) as count FROM products"),
      query<CountRow>("SELECT COUNT(*) as count FROM customer_orders"),
      query<CountRow>("SELECT COUNT(*) as count FROM customer_carts"),
      query<CountRow>("SELECT COUNT(*) as count FROM customer_wishlists"),
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
    return Response.json({
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalCarts: 0,
      totalWishlists: 0,
    });
  }
}
