import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { getAuthFromCookies } from "@/lib/auth";
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
  order_number: string | null;
  created_at: string;
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
}

async function ensureCouponsTable() {
  await query(`
    create table if not exists discount_coupons (
      id uuid primary key default gen_random_uuid(),
      site_id varchar(80) not null default 'quirkyhome',
      code varchar(60) not null,
      discount_type varchar(20) not null check (discount_type in ('percent', 'flat')),
      discount_value numeric(12,2) not null,
      min_order_amount numeric(12,2),
      max_discount_amount numeric(12,2),
      starts_at timestamptz,
      ends_at timestamptz,
      is_active boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (site_id, code)
    )
  `);
}

async function syncEarnedCoins(userId: string) {
  const orders = await query<EarnableOrderRow>(
    `select id, order_number, grand_total::text, placed_at::text, created_at::text
     from customer_orders
     where user_id = $1
       and lower(coalesce(payment_status, '')) in ('paid', 'success', 'completed')
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

    const transactions = await query<TransactionRow>(
      `select rt.id, rt.type, rt.coins, rt.note, co.order_number, rt.created_at::text
       from customer_reward_transactions rt
       left join customer_orders co on co.id = rt.order_id
       where rt.user_id = $1
       order by rt.created_at desc
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

    const code = `QCOINS${randomBytes(3).toString("hex").toUpperCase()}`;
    await query(
      `insert into discount_coupons
       (site_id, code, discount_type, discount_value, min_order_amount, max_discount_amount, starts_at, ends_at, is_active)
       values ('quirkyhome', $1, 'flat', $2, 0, $2, now(), now() + interval '60 days', true)`,
      [code, balance],
    );
    await query(
      `insert into customer_reward_transactions (user_id, type, coins, note)
       values ($1, 'redeem', $2, $3)`,
      [auth.sub, -balance, `Converted ${balance} coins to coupon ${code}`],
    );

    return NextResponse.json({ ok: true, code, discountAmount: balance, balance: 0 });
  } catch (error) {
    console.error("Rewards POST error:", error);
    return NextResponse.json({ error: "Failed to convert coins" }, { status: 500 });
  }
}
