import type { EventMembership, NewEventMembership } from "@seat-snaps/db";
import type { IEventMembershipRepository } from "../../domain/repositories/IEventMembershipRepository";
import { TtlCache } from "../cache/ttl-cache";

export class CachingEventMembershipRepository implements IEventMembershipRepository {
  private readonly cache = new TtlCache<EventMembership | null>(5_000);

  constructor(private readonly inner: IEventMembershipRepository) {}

  private memberKey(userId: string, eventId: string): string {
    return `${userId}:${eventId}`;
  }

  findByEventId(eventId: string): Promise<EventMembership[]> {
    return this.inner.findByEventId(eventId);
  }

  findByEventIdWithUsers(
    eventId: string,
  ): Promise<(EventMembership & { user: { id: string; email: string; name: string } })[]> {
    return this.inner.findByEventIdWithUsers(eventId);
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<EventMembership | null> {
    const key = this.memberKey(userId, eventId);
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const result = await this.inner.findByUserAndEvent(userId, eventId);
    this.cache.set(key, result);
    return result;
  }

  async create(data: NewEventMembership): Promise<EventMembership> {
    this.cache.invalidate(this.memberKey(data.userId, data.eventId));
    return this.inner.create(data);
  }

  async remove(userId: string, eventId: string): Promise<void> {
    this.cache.invalidate(this.memberKey(userId, eventId));
    return this.inner.remove(userId, eventId);
  }
}
