import { getDynamoTableName, scanAllDynamoInventory, scanDynamoInventory, scanDynamoInventoryPage } from "@/lib/dynamodb";

export const runtime = "nodejs";

function collectPaths(value: unknown, prefix = "", depth = 0, acc = new Set<string>()) {
  if (!value || typeof value !== "object" || depth > 2) return acc;
  const obj = value as Record<string, unknown>;
  for (const [key, child] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    acc.add(path);
    collectPaths(child, path, depth + 1, acc);
  }
  return acc;
}

function inferStructure(rawItems: Array<Record<string, unknown>>) {
  const topLevelCounts: Record<string, number> = {};
  const pathSet = new Set<string>();
  for (const item of rawItems) {
    for (const key of Object.keys(item)) {
      topLevelCounts[key] = (topLevelCounts[key] ?? 0) + 1;
    }
    collectPaths(item, "", 0, pathSet);
  }

  return {
    topLevelKeys: Object.entries(topLevelCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, count]) => ({ key, count })),
    nestedPaths: Array.from(pathSet).sort().slice(0, 200),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "1";
    const debug = searchParams.get("debug") === "1";
    const cursor = searchParams.get("cursor");
    const limit = Math.min(Number(searchParams.get("limit") ?? 50), 500);
    const max = Math.min(Number(searchParams.get("max") ?? 2000), 5000);
    const paged = !all && (searchParams.has("limit") || searchParams.has("cursor"));

    if (paged) {
      const pageLimit = Math.min(Math.max(Number(searchParams.get("limit") ?? 10), 1), 50);
      const result = await scanDynamoInventoryPage(pageLimit, cursor);
      const rawItems = result.items.map((item) => item.raw);
      return Response.json({
        items: result.items,
        nextCursor: result.nextCursor,
        readOnly: true,
        table: getDynamoTableName(),
        ...(debug
          ? {
              structure: inferStructure(rawItems),
              sampleRaw: rawItems.slice(0, 3),
              sampleMapped: result.items.slice(0, 3),
            }
          : {}),
      });
    }

    const items = all ? await scanAllDynamoInventory(max) : await scanDynamoInventory(limit);
    const rawItems = items.map((item) => item.raw);

    return Response.json({
      items,
      readOnly: true,
      table: getDynamoTableName(),
      ...(debug
        ? {
            structure: inferStructure(rawItems),
            sampleRaw: rawItems.slice(0, 3),
            sampleMapped: items.slice(0, 3),
          }
        : {}),
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to read DynamoDB inventory" },
      { status: 500 },
    );
  }
}
