import { eq, and, inArray } from "@seat-snaps/db";
import type { Database, Attendee, NewAttendee } from "@seat-snaps/db";
import { attendees } from "@seat-snaps/db";
import type { IAttendeeRepository, UpdateAttendeeData } from "../../domain/repositories/IAttendeeRepository";

export class DrizzleAttendeeRepository implements IAttendeeRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Attendee | null> {
    const result = await this.db.select().from(attendees).where(eq(attendees.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByIds(ids: string[]): Promise<Attendee[]> {
    if (ids.length === 0) return [];
    return this.db.select().from(attendees).where(inArray(attendees.id, ids));
  }

  async findByQrToken(token: string): Promise<Attendee | null> {
    const result = await this.db
      .select()
      .from(attendees)
      .where(eq(attendees.qrToken, token))
      .limit(1);
    return result[0] ?? null;
  }

  async findByEventId(eventId: string): Promise<Attendee[]> {
    return this.db.select().from(attendees).where(eq(attendees.eventId, eventId));
  }

  async findByEventAndEmail(eventId: string, email: string): Promise<Attendee | null> {
    const result = await this.db
      .select()
      .from(attendees)
      .where(and(eq(attendees.eventId, eventId), eq(attendees.email, email)))
      .limit(1);
    return result[0] ?? null;
  }

  async create(data: NewAttendee): Promise<Attendee> {
    const result = await this.db.insert(attendees).values(data).returning();
    return result[0];
  }

  async bulkCreate(data: NewAttendee[]): Promise<Attendee[]> {
    if (data.length === 0) return [];
    return this.db.insert(attendees).values(data).returning();
  }

  async update(id: string, data: UpdateAttendeeData): Promise<Attendee> {
    const result = await this.db
      .update(attendees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(attendees.id, id))
      .returning();
    if (!result[0]) throw new Error(`Attendee ${id} not found`);
    return result[0];
  }

  async bulkUpdateStatus(ids: string[], status: "confirmed" | "pending" | "declined"): Promise<Attendee[]> {
    if (ids.length === 0) return [];
    return this.db
      .update(attendees)
      .set({ status, updatedAt: new Date() })
      .where(inArray(attendees.id, ids))
      .returning();
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(attendees).where(eq(attendees.id, id));
  }
}
