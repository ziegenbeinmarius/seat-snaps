import { eq, and } from "@seat-snaps/db";
import type { Database, Attendee, NewAttendee } from "@seat-snaps/db";
import { attendees } from "@seat-snaps/db";
import type { IAttendeeRepository, UpdateAttendeeData } from "../../domain/repositories/IAttendeeRepository";

export class DrizzleAttendeeRepository implements IAttendeeRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Attendee | null> {
    const result = await this.db.select().from(attendees).where(eq(attendees.id, id)).limit(1);
    return result[0] ?? null;
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

  async update(id: string, data: UpdateAttendeeData): Promise<Attendee> {
    const result = await this.db
      .update(attendees)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(attendees.id, id))
      .returning();
    if (!result[0]) throw new Error(`Attendee ${id} not found`);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(attendees).where(eq(attendees.id, id));
  }
}
