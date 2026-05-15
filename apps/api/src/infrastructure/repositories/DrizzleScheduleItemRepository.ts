import { eq, asc } from "@seat-snaps/db";
import type { Database, ScheduleItem, NewScheduleItem } from "@seat-snaps/db";
import { scheduleItems } from "@seat-snaps/db";
import type {
  IScheduleItemRepository,
  UpdateScheduleItemData,
} from "../../domain/repositories/IScheduleItemRepository";

export class DrizzleScheduleItemRepository implements IScheduleItemRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<ScheduleItem | null> {
    const result = await this.db
      .select()
      .from(scheduleItems)
      .where(eq(scheduleItems.id, id))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEventId(eventId: string): Promise<ScheduleItem[]> {
    return this.db
      .select()
      .from(scheduleItems)
      .where(eq(scheduleItems.eventId, eventId))
      .orderBy(asc(scheduleItems.position), asc(scheduleItems.startTime));
  }

  async create(data: NewScheduleItem): Promise<ScheduleItem> {
    const result = await this.db.insert(scheduleItems).values(data).returning();
    return result[0];
  }

  async update(id: string, data: UpdateScheduleItemData): Promise<ScheduleItem> {
    const result = await this.db
      .update(scheduleItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(scheduleItems.id, id))
      .returning();
    if (!result[0]) throw new Error(`ScheduleItem ${id} not found`);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(scheduleItems).where(eq(scheduleItems.id, id));
  }
}
