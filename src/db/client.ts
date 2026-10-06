import "server-only";

import { connect } from "./connection";

let connection: ReturnType<typeof connect> | undefined;

// Connect lazily so `next build` does not need a database.
function getConnection() {
  if (!connection) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    connection = connect(url);
  }
  return connection;
}

export const getDb = () => getConnection().db;

export async function pingDatabase(): Promise<void> {
  await getConnection().client`select 1`;
}
