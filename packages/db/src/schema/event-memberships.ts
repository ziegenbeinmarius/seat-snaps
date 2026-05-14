import { pgTable, uuid, timestamp, pgEnum, index, uniqueIndex } from "drizzle-orm/pg-core";
import { events } from "./events.js";
import { users } from "./users.js";

export const membershipRoleEnum = pgEnum("membership_role", ["owner", "organizer"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "invited", "removed"]);

export const eventMemberships = pgTable(
  "event_memberships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    role: membershipRoleEnum("role").notNull(),
    status: membershipStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("event_memberships_user_event_idx").on(t.userId, t.eventId),
    index("event_memberships_event_id_idx").on(t.eventId),
  ],
);

export type EventMembership = typeof eventMemberships.$inferSelect;
export type NewEventMembership = typeof eventMemberships.$inferInsert;
