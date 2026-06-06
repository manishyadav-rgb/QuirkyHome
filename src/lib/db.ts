type QueryResult<T> = {
  rows: T[];
};

type PoolLike = {
  query: <T = Record<string, unknown>>(text: string, params?: unknown[]) => Promise<QueryResult<T>>;
};

declare global {
  var qhPgPool: PoolLike | undefined;
}

function getConnectionString() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not configured");

  // Make pg's SSL behavior explicit so modern versions don't warn about
  // legacy sslmode aliases in connection strings copied from hosted DBs.
  if (
    /sslmode=(prefer|require|verify-ca)\b/i.test(databaseUrl) &&
    !/uselibpqcompat=/i.test(databaseUrl)
  ) {
    const separator = databaseUrl.includes("?") ? "&" : "?";
    return `${databaseUrl}${separator}uselibpqcompat=true`;
  }

  return databaseUrl;
}

export function getDb() {
  if (!globalThis.qhPgPool) {
    const { Pool } = require("pg");
    globalThis.qhPgPool = new Pool({
      connectionString: getConnectionString(),
      ssl: { rejectUnauthorized: false },
      max: 5,
    });
  }

  return globalThis.qhPgPool as PoolLike;
}

export async function query<T = Record<string, unknown>>(text: string, params?: unknown[]) {
  return getDb().query<T>(text, params);
}

export const db: PoolLike = {
  query,
};
