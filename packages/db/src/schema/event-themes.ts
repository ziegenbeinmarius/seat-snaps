import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { events } from "./events.js";

export const eventThemes = pgTable(
  "event_themes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .unique()
      .references(() => events.id, { onDelete: "cascade" }),
    primaryColor: text("primary_color"),
    secondaryColor: text("secondary_color"),
    logoUrl: text("logo_url"),
    backgroundUrl: text("background_url"),
    customCss: text("custom_css"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("event_themes_event_id_idx").on(t.eventId)],
);

export type EventTheme = typeof eventThemes.$inferSelect;
export type NewEventTheme = typeof eventThemes.$inferInsert;
