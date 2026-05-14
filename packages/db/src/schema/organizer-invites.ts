import { pgTable, uuid, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";
import { events } from "./events.js";

export const inviteStatusEnum = pgEnum("invite_status", ["pending", "accepted", "expired"]);

export const organizerInvites = pgTable(
  "organizer_invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull(),
    token: text("token").notNull().unique(),
    status: inviteStatusEnum("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("organizer_invites_event_id_idx").on(t.eventId)],
);

export type OrganizerInvite = typeof organizerInvites.$inferSelect;
export type NewOrganizerInvite = typeof organizerInvites.$inferInsert;
