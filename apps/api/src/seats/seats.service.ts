import { Injectable, Inject, NotFoundException, ConflictException } from "@nestjs/common";
import { type Database, type Seat, seats, attendees, eq } from "@seat-snaps/db";
import type { ISeatRepository } from "../domain/repositories/ISeatRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import { DATABASE } from "../database/database.module";
import type { ISeatService } from "./domain/ISeatService";

@Injectable()
export class SeatsService implements ISeatService {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
    @Inject(SEAT_REPOSITORY)
    private readonly seatRepository: ISeatRepository,
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
  ) {}

  async listForEvent(eventId: string): Promise<Seat[]> {
    return this.seatRepository.findByEventId(eventId);
  }

  async assign(seatId: string, eventId: string, attendeeId: string): Promise<Seat> {
    const seat = await this.seatRepository.findById(seatId);
    if (!seat || seat.eventId !== eventId) throw new NotFoundException("Seat not found");

    if (seat.attendeeId) throw new ConflictException("Seat is already occupied");

    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");

    const allSeats = await this.seatRepository.findByEventId(eventId);
    const alreadySeated = allSeats.find((s) => s.attendeeId === attendeeId);
    if (alreadySeated) throw new ConflictException("Attendee is already assigned to a seat");

    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(seats)
        .set({ attendeeId })
        .where(eq(seats.id, seatId))
        .returning();
      await tx
        .update(attendees)
        .set({ seatId, tableId: seat.tableId })
        .where(eq(attendees.id, attendeeId));
      return updated;
    });
  }

  async unassign(seatId: string, eventId: string): Promise<Seat> {
    const seat = await this.seatRepository.findById(seatId);
    if (!seat || seat.eventId !== eventId) throw new NotFoundException("Seat not found");

    return this.db.transaction(async (tx) => {
      const [updated] = await tx
        .update(seats)
        .set({ attendeeId: null })
        .where(eq(seats.id, seatId))
        .returning();
      if (seat.attendeeId) {
        await tx
          .update(attendees)
          .set({ seatId: null, tableId: null })
          .where(eq(attendees.id, seat.attendeeId));
      }
      return updated;
    });
  }
}
