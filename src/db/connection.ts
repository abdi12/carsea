import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

/**
 * Opens a database connection. Usable from scripts as well as the app;
 * the app goes through `client.ts`, which keeps it server-only.
 */
export function connect(url: string, options: { max?: number } = {}) {
  const client = postgres(url, { max: options.max ?? 10, onnotice: () => {} });
  return { client, db: drizzle(client, { schema }) };
}

export type Database = ReturnType<typeof connect>["db"];
