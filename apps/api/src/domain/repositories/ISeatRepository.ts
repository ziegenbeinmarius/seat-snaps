import type { Seat, NewSeat } from "@seat-snaps/db";

export type UpdateSeatData = Partial<Pick<NewSeat, "label" | "position" | "attendeeId">>;

export interface ISeatRepository {
  findById(id: string): Promise<Seat | null>;
  findByTableId(tableId: string): Promise<Seat[]>;
  findByEventId(eventId: string): Promise<Seat[]>;
  findByAttendeeId(attendeeId: string): Promise<Seat | null>;
  assignAttendee(seatId: string, attendeeId: string): Promise<Seat>;
  unassignAttendee(seatId: string): Promise<Seat>;
  create(data: NewSeat): Promise<Seat>;
  bulkCreate(data: NewSeat[]): Promise<Seat[]>;
  update(id: string, data: UpdateSeatData): Promise<Seat>;
  delete(id: string): Promise<void>;
}

export const SEAT_REPOSITORY = Symbol("ISeatRepository");
