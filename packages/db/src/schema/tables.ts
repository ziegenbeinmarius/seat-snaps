import { pgTable, uuid, text, timestamp, integer, real, index, pgEnum } from "drizzle-orm/pg-core";
import { events } from "./events.js";

export const tableShapeEnum = pgEnum("table_shape", ["round", "rectangular", "long"]);

export const tables = pgTable(
  "tables",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    label: text("label"),
    capacity: integer("capacity"),
    positionX: real("position_x"),
    positionY: real("position_y"),
    shape: tableShapeEnum("shape").default("rectangular"),
    rotation: real("rotation").default(0),
    width: real("width"),
    height: real("height"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tables_event_id_idx").on(t.eventId)],
);

export type Table = typeof tables.$inferSelect;
export type NewTable = typeof tables.$inferInsert;
export type TableShape = typeof tableShapeEnum.enumValues[number];
