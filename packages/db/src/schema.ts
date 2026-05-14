import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

// Placeholder table — replace with actual domain tables in Sprint 2+
export const _placeholder = pgTable("_placeholder", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
