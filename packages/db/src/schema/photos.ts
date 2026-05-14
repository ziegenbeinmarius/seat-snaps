import { pgTable, uuid, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { events } from "./events.js";
import { attendees } from "./attendees.js";

export const photoStatusEnum = pgEnum("photo_status", [
  "pending",
  "approved",
  "rejected",
  "deleted",
]);

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    attendeeId: uuid("attendee_id")
      .notNull()
      .references(() => attendees.id, { onDelete: "cascade" }),
    s3Key: text("s3_key").notNull(),
    thumbnailKey: text("thumbnail_key"),
    caption: text("caption"),
    status: photoStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("photos_event_id_idx").on(t.eventId),
    index("photos_attendee_id_idx").on(t.attendeeId),
  ],
);

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;
