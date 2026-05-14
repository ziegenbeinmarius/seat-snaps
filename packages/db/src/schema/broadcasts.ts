import { pgTable, uuid, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { events } from "./events.js";
import { users } from "./users.js";

export const broadcastTargetTypeEnum = pgEnum("broadcast_target_type", [
  "all",
  "table",
  "custom",
]);

export const broadcasts = pgTable(
  "broadcasts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    createdById: uuid("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    targetType: broadcastTargetTypeEnum("target_type").notNull(),
    targetId: uuid("target_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("broadcasts_event_id_idx").on(t.eventId)],
);

export type Broadcast = typeof broadcasts.$inferSelect;
export type NewBroadcast = typeof broadcasts.$inferInsert;
