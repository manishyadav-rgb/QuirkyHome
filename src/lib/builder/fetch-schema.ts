/**
 * Fetch builder schema for the storefront (server-side).
 * 
 * Used by the dynamic homepage to load sections from DB.
 */

import { query } from "@/lib/db";
import type { BuilderSchema } from "@/lib/builder/types";

export async function getBuilderSchema(siteId: string = "quirkyhome"): Promise<BuilderSchema | null> {
  try {
    const result = await query<{ schema_json: BuilderSchema }>(
      "select schema_json from builder_pages where id = 'main' and site_id = $1 limit 1",
      [siteId],
    );

    if (result.rows.length > 0 && result.rows[0].schema_json) {
      return result.rows[0].schema_json as BuilderSchema;
    }
    return null;
  } catch {
    return null;
  }
}
