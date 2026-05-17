import { pgTable, uuid, text, timestamp, jsonb, pgEnum, boolean } from "drizzle-orm/pg-core";

export const eventTypeEnum = pgEnum("event_type", ["wedding", "birthday", "corporate", "other"]);

export const events = pgTable("events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date", { withTimezone: true }).notNull(),
  endDate: timestamp("end_date", { withTimezone: true }),
  location: text("location"),
  type: eventTypeEnum("type").notNull(),
  hasSeating: boolean("has_seating").notNull().default(true),
  isFinished: boolean("is_finished").notNull().default(false),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
