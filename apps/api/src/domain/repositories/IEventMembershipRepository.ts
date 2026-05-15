import type { EventMembership, NewEventMembership } from "@seat-snaps/db";

export interface IEventMembershipRepository {
  findByEventId(eventId: string): Promise<EventMembership[]>;
  findByEventIdWithUsers(eventId: string): Promise<(EventMembership & { user: { id: string; email: string; name: string } })[]>;
  findByUserAndEvent(userId: string, eventId: string): Promise<EventMembership | null>;
  create(data: NewEventMembership): Promise<EventMembership>;
  remove(userId: string, eventId: string): Promise<void>;
}

export const EVENT_MEMBERSHIP_REPOSITORY = Symbol("IEventMembershipRepository");
