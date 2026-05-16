import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { events } from "./events.js";
import { eventMemberships } from "./event-memberships.js";
import { organizerInvites } from "./organizer-invites.js";
import { attendees } from "./attendees.js";
import { tables } from "./tables.js";
import { seats } from "./seats.js";
import { attendeeSessions } from "./attendee-sessions.js";
import { photos } from "./photos.js";
import { broadcasts } from "./broadcasts.js";
import { eventThemes } from "./event-themes.js";
import { pushSubscriptions } from "./push-subscriptions.js";

export const usersRelations = relations(users, ({ many }) => ({
  memberships: many(eventMemberships),
  broadcasts: many(broadcasts),
}));

export const eventsRelations = relations(events, ({ many, one }) => ({
  memberships: many(eventMemberships),
  invites: many(organizerInvites),
  attendees: many(attendees),
  tables: many(tables),
  seats: many(seats),
  sessions: many(attendeeSessions),
  photos: many(photos),
  broadcasts: many(broadcasts),
  theme: one(eventThemes, { fields: [events.id], references: [eventThemes.eventId] }),
}));

export const eventMembershipsRelations = relations(eventMemberships, ({ one }) => ({
  user: one(users, { fields: [eventMemberships.userId], references: [users.id] }),
  event: one(events, { fields: [eventMemberships.eventId], references: [events.id] }),
}));

export const organizerInvitesRelations = relations(organizerInvites, ({ one }) => ({
  event: one(events, { fields: [organizerInvites.eventId], references: [events.id] }),
}));

export const attendeesRelations = relations(attendees, ({ one, many }) => ({
  event: one(events, { fields: [attendees.eventId], references: [events.id] }),
  table: one(tables, { fields: [attendees.tableId], references: [tables.id] }),
  seat: one(seats, { fields: [attendees.seatId], references: [seats.id] }),
  sessions: many(attendeeSessions),
  photos: many(photos),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  event: one(events, { fields: [tables.eventId], references: [events.id] }),
  seats: many(seats),
  attendees: many(attendees),
}));

export const seatsRelations = relations(seats, ({ one }) => ({
  table: one(tables, { fields: [seats.tableId], references: [tables.id] }),
  event: one(events, { fields: [seats.eventId], references: [events.id] }),
  attendee: one(attendees, { fields: [seats.attendeeId], references: [attendees.id] }),
}));

export const attendeeSessionsRelations = relations(attendeeSessions, ({ one }) => ({
  attendee: one(attendees, { fields: [attendeeSessions.attendeeId], references: [attendees.id] }),
  event: one(events, { fields: [attendeeSessions.eventId], references: [events.id] }),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  event: one(events, { fields: [photos.eventId], references: [events.id] }),
  attendee: one(attendees, { fields: [photos.attendeeId], references: [attendees.id] }),
}));

export const broadcastsRelations = relations(broadcasts, ({ one }) => ({
  event: one(events, { fields: [broadcasts.eventId], references: [events.id] }),
  createdBy: one(users, { fields: [broadcasts.createdById], references: [users.id] }),
}));

export const eventThemesRelations = relations(eventThemes, ({ one }) => ({
  event: one(events, { fields: [eventThemes.eventId], references: [events.id] }),
}));

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  event: one(events, { fields: [pushSubscriptions.eventId], references: [events.id] }),
  attendeeSession: one(attendeeSessions, {
    fields: [pushSubscriptions.attendeeSessionId],
    references: [attendeeSessions.id],
  }),
  user: one(users, { fields: [pushSubscriptions.userId], references: [users.id] }),
}));
