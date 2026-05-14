import { eq } from "@seat-snaps/db";
import type { Database, Broadcast, NewBroadcast } from "@seat-snaps/db";
import { broadcasts } from "@seat-snaps/db";
import type { IBroadcastRepository } from "../../domain/repositories/IBroadcastRepository";

export class DrizzleBroadcastRepository implements IBroadcastRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Broadcast | null> {
    const result = await this.db.select().from(broadcasts).where(eq(broadcasts.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByEventId(eventId: string): Promise<Broadcast[]> {
    return this.db.select().from(broadcasts).where(eq(broadcasts.eventId, eventId));
  }

  async create(data: NewBroadcast): Promise<Broadcast> {
    const result = await this.db.insert(broadcasts).values(data).returning();
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(broadcasts).where(eq(broadcasts.id, id));
  }
}
