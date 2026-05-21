import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { randomBytes } from "crypto";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

type CheckoutSessionRow = {
  id: string;
  user_id: string;
  cashfree_order_id: string;
  status: string;
  finalized_at: string | null;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  notes: string | null;
  subtotal: string | null;
  shipping_total: string | null;
  discount_amount: string | null;
  order_amount: string | null;
  coupon_code: string | null;
  cart_snapshot: Array<{
    product_slug: string;
    product_title: string;
    product_image: string | null;
    unit_price: string;
    quantity: number;
  }>;
};

function generateOrderNumber() {
  const date = new Date();
  const prefix = `QH${date.getFullYear().toString().slice(2)}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `${prefix}-${random}`;
}

async function verifyPayment(orderId: string) {
  const cashfreeUrl = process.env.CASHFREE_ENVIRONMENT === "SANDBOX"
    ? `https://sandbox.cashfree.com/pg/orders/${orderId}`
    : `https://api.cashfree.com/pg/orders/${orderId}`;

  const appId = (process.env.CASHFREE_APP_ID || process.env.CASHFREE_CLIENT_ID || "").trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || process.env.CASHFREE_CLIENT_SECRET || "").trim();
  if (!appId || !secretKey) return null;

  const response = await fetch(cashfreeUrl, {
    method: "GET",
    headers: {
      "x-client-id": appId,
      "x-client-secret": secretKey,
      "x-api-version": "2023-08-01",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;
  return await response.json();
}

async function finalizeOrderIfPaid(orderId: string) {
  const sessionResult = await query<CheckoutSessionRow>(
    `select id, user_id, cashfree_order_id, status, finalized_at, shipping_name, shipping_phone,
            shipping_address, shipping_city, shipping_state, shipping_pincode, notes,
            subtotal::text, shipping_total::text, discount_amount::text, order_amount::text, coupon_code, cart_snapshot
     from payment_checkout_sessions
     where cashfree_order_id = $1
     limit 1`,
    [orderId],
  );

  const session = sessionResult.rows[0];
  if (!session || session.finalized_at) return;

  const orderNumber = generateOrderNumber();
  const fallbackSubtotal = session.cart_snapshot.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0);
  const subtotal = session.subtotal ? Number(session.subtotal) : fallbackSubtotal;
  const shippingTotal = session.shipping_total ? Number(session.shipping_total) : (subtotal >= 499 ? 0 : 49);
  const discountAmount = session.discount_amount ? Number(session.discount_amount) : 0;
  const grandTotal = session.order_amount ? Number(session.order_amount) : Math.max(0, subtotal + shippingTotal - discountAmount);

  const orderResult = await query<{ id: string }>(
    `insert into customer_orders (order_number, user_id, status, payment_status, subtotal, shipping_total, grand_total,
      shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, notes, placed_at)
     values ($1,$2,'pending','paid',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now())
     returning id`,
    [
      orderNumber,
      session.user_id,
      subtotal,
      shippingTotal,
      grandTotal,
      session.shipping_name,
      session.shipping_phone,
      session.shipping_address,
      session.shipping_city,
      session.shipping_state,
      session.shipping_pincode,
      session.notes ? `${session.notes}${session.coupon_code ? `\nCoupon Applied: ${session.coupon_code} (INR ${discountAmount})` : ""}` : (session.coupon_code ? `Coupon Applied: ${session.coupon_code} (INR ${discountAmount})` : null),
    ],
  );

  const dbOrderId = orderResult.rows[0].id;

  for (const item of session.cart_snapshot) {
    const lineTotal = parseFloat(item.unit_price) * item.quantity;
    await query(
      `insert into customer_order_items (order_id, product_slug, product_title, product_image, unit_price, quantity, line_total)
       values ($1,$2,$3,$4,$5,$6,$7)`,
      [dbOrderId, item.product_slug, item.product_title, item.product_image, item.unit_price, item.quantity, lineTotal],
    );
  }

  await query(
    `delete from customer_cart_items
     where cart_id in (select id from customer_carts where user_id = $1)`,
    [session.user_id],
  );

  await query(
    `update payment_checkout_sessions set status = 'paid', finalized_at = now(), updated_at = now() where id = $1`,
    [session.id],
  );
}

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string }>;
}) {
  const { order_id } = await searchParams;

  if (!order_id) {
    return (
      <div className="qh-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-bold">Invalid Request</h1>
        <p className="mt-2 text-text-muted">No order ID found.</p>
        <Link href="/" className="mt-6 text-brand-primary hover:underline">Return to Home</Link>
      </div>
    );
  }

  const orderData = await verifyPayment(order_id);
  const isSuccess = orderData?.order_status === "PAID";

  if (isSuccess) {
    await finalizeOrderIfPaid(order_id);
  }

  return (
    <div className="qh-container flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-full ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
        {isSuccess ? <CheckCircle2 className="h-10 w-10" /> : <XCircle className="h-10 w-10" />}
      </div>

      <h1 className="mb-2 font-display text-3xl font-bold text-text-main">
        {isSuccess ? "Payment Successful!" : "Payment Failed"}
      </h1>

      <p className="mb-8 text-text-muted">
        {isSuccess
          ? `Thank you for your purchase. Your order (${order_id}) has been confirmed.`
          : `We couldn't process your payment for order ${order_id}. Please try again.`}
      </p>

      <div className="flex gap-4">
        {isSuccess ? (
          <Link href="/account/orders" className="qh-focus rounded-full bg-brand-primary px-8 py-3 font-semibold text-white hover:bg-brand-secondary">
            View My Orders
          </Link>
        ) : (
          <Link href="/checkout" className="qh-focus rounded-full bg-brand-primary px-8 py-3 font-semibold text-white hover:bg-brand-secondary">
            Try Again
          </Link>
        )}
      </div>
    </div>
  );
}
