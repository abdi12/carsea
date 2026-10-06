import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;

// Connect lazily so `next build` does not need a database.
function getClient() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    client = postgres(url, { max: 10 });
  }
  return client;
}

export const getDb = () => drizzle(getClient(), { schema });

export async function pingDatabase(): Promise<void> {
  await getClient()`select 1`;
}
