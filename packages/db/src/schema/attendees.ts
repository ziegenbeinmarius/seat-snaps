import { pgTable, uuid, text, timestamp, integer, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { events } from "./events.js";

export const attendeeStatusEnum = pgEnum("attendee_status", ["confirmed", "pending", "declined"]);

export const attendees = pgTable(
  "attendees",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    groupLabel: text("group_label"),
    relationInfo: text("relation_info"),
    conversationStarters: text("conversation_starters").array(),
    description: text("description"),
    status: attendeeStatusEnum("status").notNull().default("confirmed"),
    // tableId and seatId are denormalized for quick lookup; FKs enforced from the other side
    tableId: uuid("table_id"),
    seatId: uuid("seat_id"),
    qrToken: text("qr_token").notNull().unique(),
    photoLimit: integer("photo_limit").notNull().default(10),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("attendees_event_id_idx").on(t.eventId),
    uniqueIndex("attendees_event_email_uidx").on(t.eventId, t.email),
  ],
);

export type Attendee = typeof attendees.$inferSelect;
export type NewAttendee = typeof attendees.$inferInsert;
