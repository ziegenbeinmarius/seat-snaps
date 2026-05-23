import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import type { Logger } from "drizzle-orm";
import * as schema from "./schema/index.js";

export * from "./schema/index.js";
export { sql, eq, and, or, desc, asc, inArray, isNull, isNotNull, ne, gt, gte, lt, lte } from "drizzle-orm";

export type Database = ReturnType<typeof createDb>;

class QueryLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    const start = performance.now();
    queueMicrotask(() => {
      const duration = (performance.now() - start).toFixed(1);
      console.log(`[db] ${duration}ms | ${query.slice(0, 200)}${query.length > 200 ? "…" : ""}`);
    });
  }
}

export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl, {
    max: 10,
    idle_timeout: 30,
    connect_timeout: 10,
    max_lifetime: 60 * 30,
  });
  return drizzle(client, { schema, logger: new QueryLogger() });
}
