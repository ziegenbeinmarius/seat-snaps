import { eq, and } from "@seat-snaps/db";
import type { Database, EventMembership, NewEventMembership } from "@seat-snaps/db";
import { eventMemberships, users } from "@seat-snaps/db";
import type { IEventMembershipRepository } from "../../domain/repositories/IEventMembershipRepository";

export class DrizzleEventMembershipRepository implements IEventMembershipRepository {
  constructor(private readonly db: Database) {}

  async findByEventId(eventId: string): Promise<EventMembership[]> {
    return this.db
      .select()
      .from(eventMemberships)
      .where(eq(eventMemberships.eventId, eventId));
  }

  async findByEventIdWithUsers(
    eventId: string,
  ): Promise<(EventMembership & { user: { id: string; email: string; name: string } })[]> {
    const rows = await this.db
      .select({
        id: eventMemberships.id,
        userId: eventMemberships.userId,
        eventId: eventMemberships.eventId,
        role: eventMemberships.role,
        status: eventMemberships.status,
        createdAt: eventMemberships.createdAt,
        user: {
          id: users.id,
          email: users.email,
          name: users.name,
        },
      })
      .from(eventMemberships)
      .innerJoin(users, eq(eventMemberships.userId, users.id))
      .where(eq(eventMemberships.eventId, eventId));

    return rows;
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<EventMembership | null> {
    const result = await this.db
      .select()
      .from(eventMemberships)
      .where(and(eq(eventMemberships.userId, userId), eq(eventMemberships.eventId, eventId)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewEventMembership): Promise<EventMembership> {
    const result = await this.db.insert(eventMemberships).values(data).returning();
    return result[0];
  }

  async remove(userId: string, eventId: string): Promise<void> {
    await this.db
      .delete(eventMemberships)
      .where(and(eq(eventMemberships.userId, userId), eq(eventMemberships.eventId, eventId)));
  }
}
