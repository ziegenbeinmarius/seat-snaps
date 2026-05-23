import { eq, inArray, isNull } from "@seat-snaps/db";
import type { Database, Event, NewEvent } from "@seat-snaps/db";
import { events, eventMemberships } from "@seat-snaps/db";
import type { IEventRepository, EventFilters, UpdateEventData } from "../../domain/repositories/IEventRepository";

export class DrizzleEventRepository implements IEventRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Event | null> {
    const result = await this.db.select().from(events).where(eq(events.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findAll(filters?: EventFilters): Promise<Event[]> {
    const query = this.db.select().from(events);
    if (filters?.type) {
      return query.where(eq(events.type, filters.type));
    }
    return query;
  }

  async findByMemberId(userId: string): Promise<Event[]> {
    const memberships = await this.db
      .select({ eventId: eventMemberships.eventId })
      .from(eventMemberships)
      .where(eq(eventMemberships.userId, userId));

    if (memberships.length === 0) return [];

    const eventIds = memberships.map((m) => m.eventId);
    return this.db
      .select()
      .from(events)
      .where(inArray(events.id, eventIds));
  }

  async create(data: NewEvent): Promise<Event> {
    const result = await this.db.insert(events).values(data).returning();
    return result[0];
  }

  async update(id: string, data: UpdateEventData): Promise<Event> {
    const result = await this.db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    if (!result[0]) throw new Error(`Event ${id} not found`);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(events).where(eq(events.id, id));
  }

  async softDelete(id: string): Promise<void> {
    await this.db
      .update(events)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(events.id, id));
  }

  async reactivate(id: string): Promise<Event> {
    const result = await this.db
      .update(events)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    if (!result[0]) throw new Error(`Event ${id} not found`);
    return result[0];
  }
}
