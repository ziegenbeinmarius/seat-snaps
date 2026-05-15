import type { Seat } from "@seat-snaps/db";

export interface ISeatService {
  listForEvent(eventId: string, userId: string): Promise<Seat[]>;
  assign(seatId: string, eventId: string, attendeeId: string, userId: string): Promise<Seat>;
  unassign(seatId: string, eventId: string, userId: string): Promise<Seat>;
}

export const SEAT_SERVICE = Symbol("ISeatService");
