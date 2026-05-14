import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";
import { events } from "./events.js";
import { tables } from "./tables.js";
import { attendees } from "./attendees.js";

export const seats = pgTable(
  "seats",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tableId: uuid("table_id")
      .notNull()
      .references(() => tables.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    label: text("label"),
    position: integer("position"),
    attendeeId: uuid("attendee_id").references(() => attendees.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("seats_event_id_idx").on(t.eventId),
    index("seats_table_id_idx").on(t.tableId),
  ],
);

export type Seat = typeof seats.$inferSelect;
export type NewSeat = typeof seats.$inferInsert;
