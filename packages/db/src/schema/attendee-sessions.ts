import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { attendees } from "./attendees.js";
import { events } from "./events.js";

export const attendeeSessions = pgTable(
  "attendee_sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendeeId: uuid("attendee_id")
      .notNull()
      .references(() => attendees.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    deviceFingerprint: text("device_fingerprint"),
    token: text("token").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("attendee_sessions_attendee_id_idx").on(t.attendeeId),
    index("attendee_sessions_event_id_idx").on(t.eventId),
  ],
);

export type AttendeeSession = typeof attendeeSessions.$inferSelect;
export type NewAttendeeSession = typeof attendeeSessions.$inferInsert;
