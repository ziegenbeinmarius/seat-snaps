import type { Event, NewEvent } from "@seat-snaps/db";
import type { IEventRepository, EventFilters, UpdateEventData } from "../../domain/repositories/IEventRepository";
import { TtlCache } from "../cache/ttl-cache";

export class CachingEventRepository implements IEventRepository {
  private readonly cache = new TtlCache<Event>(5_000);

  constructor(private readonly inner: IEventRepository) {}

  async findById(id: string): Promise<Event | null> {
    const cached = this.cache.get(id);
    if (cached) return cached;
    const event = await this.inner.findById(id);
    if (event) this.cache.set(id, event);
    return event;
  }

  findAll(filters?: EventFilters): Promise<Event[]> {
    return this.inner.findAll(filters);
  }

  findByMemberId(userId: string): Promise<Event[]> {
    return this.inner.findByMemberId(userId);
  }

  async create(data: NewEvent): Promise<Event> {
    return this.inner.create(data);
  }

  async update(id: string, data: UpdateEventData): Promise<Event> {
    this.cache.invalidate(id);
    return this.inner.update(id, data);
  }

  async delete(id: string): Promise<void> {
    this.cache.invalidate(id);
    return this.inner.delete(id);
  }

  async softDelete(id: string): Promise<void> {
    this.cache.invalidate(id);
    return this.inner.softDelete(id);
  }

  async reactivate(id: string): Promise<Event> {
    this.cache.invalidate(id);
    return this.inner.reactivate(id);
  }
}
