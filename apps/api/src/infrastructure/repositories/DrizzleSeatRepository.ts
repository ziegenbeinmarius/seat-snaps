import { eq } from "@seat-snaps/db";
import type { Database, Seat, NewSeat } from "@seat-snaps/db";
import { seats } from "@seat-snaps/db";
import type { ISeatRepository, UpdateSeatData } from "../../domain/repositories/ISeatRepository";

export class DrizzleSeatRepository implements ISeatRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Seat | null> {
    const result = await this.db.select().from(seats).where(eq(seats.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByTableId(tableId: string): Promise<Seat[]> {
    return this.db.select().from(seats).where(eq(seats.tableId, tableId));
  }

  async findByEventId(eventId: string): Promise<Seat[]> {
    return this.db.select().from(seats).where(eq(seats.eventId, eventId));
  }

  async findByAttendeeId(attendeeId: string): Promise<Seat | null> {
    const result = await this.db
      .select()
      .from(seats)
      .where(eq(seats.attendeeId, attendeeId))
      .limit(1);
    return result[0] ?? null;
  }

  async assignAttendee(seatId: string, attendeeId: string): Promise<Seat> {
    const result = await this.db
      .update(seats)
      .set({ attendeeId })
      .where(eq(seats.id, seatId))
      .returning();
    if (!result[0]) throw new Error(`Seat ${seatId} not found`);
    return result[0];
  }

  async unassignAttendee(seatId: string): Promise<Seat> {
    const result = await this.db
      .update(seats)
      .set({ attendeeId: null })
      .where(eq(seats.id, seatId))
      .returning();
    if (!result[0]) throw new Error(`Seat ${seatId} not found`);
    return result[0];
  }

  async create(data: NewSeat): Promise<Seat> {
    const result = await this.db.insert(seats).values(data).returning();
    return result[0];
  }

  async bulkCreate(data: NewSeat[]): Promise<Seat[]> {
    if (data.length === 0) return [];
    return this.db.insert(seats).values(data).returning();
  }

  async update(id: string, data: UpdateSeatData): Promise<Seat> {
    const result = await this.db
      .update(seats)
      .set(data)
      .where(eq(seats.id, id))
      .returning();
    if (!result[0]) throw new Error(`Seat ${id} not found`);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(seats).where(eq(seats.id, id));
  }
}
