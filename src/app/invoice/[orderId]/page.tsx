import { notFound } from "next/navigation";
import { query } from "@/lib/db";
import { getAuthFromCookies } from "@/lib/auth";
import { PrintControls } from "./PrintControls";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  total_mrp: string | null;
  product_discount: string | null;
  coupon_code: string | null;
  discount_amount: string | null;
  subtotal: string;
  shipping_total: string;
  grand_total: string;
  shipping_name: string | null;
  shipping_phone: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pincode: string | null;
  created_at: string;
};

type ItemRow = {
  product_title: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export const dynamic = "force-dynamic";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const auth = await getAuthFromCookies();
  if (!auth) notFound();

  const { orderId } = await params;

  const orderResult = await query<OrderRow>(
    `select id, order_number, status, payment_status, total_mrp::text, product_discount::text, coupon_code, discount_amount::text,
            subtotal::text, shipping_total::text, grand_total::text,
            shipping_name, shipping_phone, shipping_address, shipping_city, shipping_state, shipping_pincode, created_at
     from customer_orders
     where id = $1 and user_id = $2
     limit 1`,
    [orderId, auth.sub],
  );

  const order = orderResult.rows[0];
  if (!order) notFound();

  const allowedStatuses = new Set(["accepted", "shipped", "delivered"]);
  if (!allowedStatuses.has((order.status || "").toLowerCase())) notFound();

  const itemsResult = await query<ItemRow>(
    `select product_title, unit_price::text, quantity, line_total::text
     from customer_order_items
     where order_id = $1`,
    [order.id],
  );

  const totalMrp = Number(order.total_mrp || order.subtotal || 0);
  const productDiscount = Number(order.product_discount || 0);
  const couponDiscount = Number(order.discount_amount || 0);
  const overallDiscount = productDiscount + couponDiscount;
  const offPercent = totalMrp > 0 ? Math.round((overallDiscount / totalMrp) * 100) : 0;

  return (
    <div className="mx-auto max-w-4xl p-6 print:p-0">
      <PrintControls />
      <div className="rounded-xl border border-gray-200 bg-white p-8 print:rounded-none print:border-0">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">INVOICE</h1>
            <p className="text-sm text-gray-600">QuirkyHome</p>
          </div>
          <div className="text-right text-sm">
            <p><span className="font-semibold">Order #:</span> {order.order_number}</p>
            <p><span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleString("en-IN")}</p>
            <p><span className="font-semibold">Status:</span> {order.status}</p>
            <p><span className="font-semibold">Payment:</span> {order.payment_status}</p>
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Billed To</p>
            <p className="font-semibold">{order.shipping_name || "-"}</p>
            <p className="text-sm text-gray-700">{order.shipping_phone || "-"}</p>
            <p className="mt-1 text-sm text-gray-700">{order.shipping_address || "-"}</p>
            <p className="text-sm text-gray-700">
              {[order.shipping_city, order.shipping_state, order.shipping_pincode].filter(Boolean).join(", ") || "-"}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-semibold">Item</th>
                <th className="px-4 py-3 font-semibold">Qty</th>
                <th className="px-4 py-3 font-semibold">Unit Price</th>
                <th className="px-4 py-3 font-semibold">Line Total</th>
              </tr>
            </thead>
            <tbody>
              {itemsResult.rows.map((item, idx) => (
                <tr key={`${item.product_title}-${idx}`} className="border-t border-gray-100">
                  <td className="px-4 py-3">{item.product_title}</td>
                  <td className="px-4 py-3">{item.quantity}</td>
                  <td className="px-4 py-3">INR {Number(item.unit_price || 0).toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">INR {Number(item.line_total || 0).toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span>MRP Total</span>
            <span>INR {totalMrp.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Line Total</span>
            <span>INR {Number(order.subtotal || 0).toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Product Discount</span>
            <span>- INR {productDiscount.toLocaleString("en-IN")}</span>
          </div>
          <div className="flex justify-between">
            <span>Coupon ({order.coupon_code || "-"})</span>
            <span>- INR {couponDiscount.toLocaleString("en-IN")}</span>
          </div>
          {offPercent > 0 ? (
            <div className="flex justify-between text-[13px] font-semibold text-green-700">
              <span>Overall OFF</span>
              <span>{offPercent}%</span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-gray-200 pt-2 text-base font-bold">
            <span>Grand Total</span>
            <span>INR {Number(order.grand_total || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
