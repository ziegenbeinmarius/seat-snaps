import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";

export * from "./schema/index.js";
export { sql, eq, and, or, desc, asc, inArray, isNull, isNotNull, ne, gt, gte, lt, lte } from "drizzle-orm";

export type Database = ReturnType<typeof createDb>;

export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, { max: 10 });
  return drizzle(client, { schema });
}
