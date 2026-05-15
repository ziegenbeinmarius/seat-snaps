import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { events } from "./events.js";

export const scheduleItems = pgTable(
  "schedule_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("schedule_items_event_id_idx").on(t.eventId)],
);

export type ScheduleItem = typeof scheduleItems.$inferSelect;
export type NewScheduleItem = typeof scheduleItems.$inferInsert;
