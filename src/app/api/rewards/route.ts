import { randomInt } from "crypto";
import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
import { ensureCouponsTable } from "@/lib/coupons";
import { query } from "@/lib/db";

export const runtime = "nodejs";

type EarnableOrderRow = {
  id: string;
  order_number: string;
  grand_total: string;
  placed_at: string | null;
  created_at: string;
};

type TransactionRow = {
  id: string;
  type: "earn" | "redeem" | "adjust";
  coins: number;
  note: string | null;
  coupon_code: string | null;
  order_number: string | null;
  created_at: string;
};

type RewardCouponRow = {
  code: string;
  discount_value: string;
  ends_at: string | null;
  used_at: string | null;
  is_active: boolean;
};

async function ensureRewardsTable() {
  await query(`
    create table if not exists customer_reward_transactions (
      id uuid primary key default gen_random_uuid(),
      user_id uuid not null references users(id) on delete cascade,
      order_id uuid references customer_orders(id) on delete set null,
      type varchar(20) not null check (type in ('earn', 'redeem', 'adjust')),
      coins integer not null,
      note text,
      created_at timestamptz not null default now(),
      unique (user_id, order_id, type)
    )
  `);
  await query("alter table customer_reward_transactions add column if not exists coupon_code varchar(60)");
  await query("alter table customer_reward_transactions add column if not exists metadata jsonb not null default '{}'::jsonb");
  await query("create index if not exists idx_customer_rewards_user_created on customer_reward_transactions(user_id, created_at desc)");
}

async function syncEarnedCoins(userId: string) {
  const orders = await query<EarnableOrderRow>(
    `select id, order_number, grand_total::text, placed_at::text, created_at::text
     from customer_orders
     where user_id = $1
       and lower(coalesce(status, '')) not in ('cancelled', 'canceled', 'refunded')
       and coalesce(grand_total, 0) > 0
     order by created_at desc
     limit 100`,
    [userId],
  );

  for (const order of orders.rows) {
    const coins = Math.floor(Number(order.grand_total || 0) * 0.02);
    if (coins <= 0) continue;
    await query(
      `insert into customer_reward_transactions (user_id, order_id, type, coins, note)
       values ($1, $2, 'earn', $3, $4)
       on conflict (user_id, order_id, type) do nothing`,
      [userId, order.id, coins, `Reward coins earned on order ${order.order_number}`],
    );
  }
}

function randomAlphabetCode(length = 8) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < length; i += 1) code += alphabet[randomInt(0, alphabet.length)];
  return code;
}

async function generateRewardCouponCode() {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const code = `QH${randomAlphabetCode(8)}`;
    const existing = await query<{ id: string }>(
      "select id from discount_coupons where site_id = 'quirkyhome' and code = $1 limit 1",
      [code],
    );
    if (!existing.rows[0]) return code;
  }
  throw new Error("Could not generate a unique coupon code.");
}

export async function GET() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    await ensureRewardsTable();
    await syncEarnedCoins(auth.sub);

    const balanceResult = await query<{ balance: string; earned: string; redeemed: string }>(
      `select
         coalesce(sum(coins), 0)::text as balance,
         coalesce(sum(coins) filter (where type = 'earn' and coins > 0), 0)::text as earned,
         abs(coalesce(sum(coins) filter (where type = 'redeem' and coins < 0), 0))::text as redeemed
       from customer_reward_transactions
       where user_id = $1`,
      [auth.sub],
    );

    await ensureCouponsTable();

    const transactions = await query<TransactionRow>(
      `select rt.id, rt.type, rt.coins, rt.note, rt.coupon_code, co.order_number, rt.created_at::text
       from customer_reward_transactions rt
       left join customer_orders co on co.id = rt.order_id
       where rt.user_id = $1
       order by rt.created_at desc
       limit 20`,
      [auth.sub],
    );

    const coupons = await query<RewardCouponRow>(
      `select code, discount_value::text, ends_at::text, used_at::text, is_active
       from discount_coupons
       where site_id = 'quirkyhome'
         and user_id = $1
         and source = 'rewards'
       order by created_at desc
       limit 20`,
      [auth.sub],
    );

    const summary = balanceResult.rows[0] || { balance: "0", earned: "0", redeemed: "0" };
    return NextResponse.json({
      balance: Number(summary.balance || 0),
      earned: Number(summary.earned || 0),
      redeemed: Number(summary.redeemed || 0),
      earnRate: 2,
      transactions: transactions.rows,
      coupons: coupons.rows.map((coupon) => ({
        ...coupon,
        discount_value: Number(coupon.discount_value || 0),
      })),
    });
  } catch (error) {
    console.error("Rewards GET error:", error);
    return NextResponse.json({ error: "Failed to load rewards" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const auth = await getAuthFromCookies();
    if (!auth) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    await ensureRewardsTable();
    await ensureCouponsTable();
    await syncEarnedCoins(auth.sub);

    const balanceResult = await query<{ balance: string }>(
      `select coalesce(sum(coins), 0)::text as balance
       from customer_reward_transactions
       where user_id = $1`,
      [auth.sub],
    );
    const balance = Math.floor(Number(balanceResult.rows[0]?.balance || 0));
    if (balance <= 0) {
      return NextResponse.json({ error: "No coins available to convert." }, { status: 400 });
    }

    const code = await generateRewardCouponCode();
    const couponResult = await query<{ ends_at: string | null }>(
      `insert into discount_coupons
       (site_id, code, discount_type, discount_value, min_order_amount, max_discount_amount, starts_at, ends_at,
        is_active, user_id, source, is_single_use)
       values ('quirkyhome', $1, 'flat', $2, 0, $2, now(), now() + interval '60 days', true, $3, 'rewards', true)
       returning ends_at::text`,
      [code, balance, auth.sub],
    );
    await query(
      `insert into customer_reward_transactions (user_id, type, coins, note, coupon_code, metadata)
       values ($1, 'redeem', $2, $3, $4, $5::jsonb)`,
      [auth.sub, -balance, `Converted ${balance} coins to coupon ${code}`, code, JSON.stringify({ discountAmount: balance })],
    );

    return NextResponse.json({ ok: true, code, discountAmount: balance, balance: 0, endsAt: couponResult.rows[0]?.ends_at || null });
  } catch (error) {
    console.error("Rewards POST error:", error);
    return NextResponse.json({ error: "Failed to convert coins" }, { status: 500 });
  }
}
