import type { Seat } from "@seat-snaps/db";

export interface ISeatService {
  listForEvent(eventId: string): Promise<Seat[]>;
  assign(seatId: string, eventId: string, attendeeId: string): Promise<Seat>;
  unassign(seatId: string, eventId: string): Promise<Seat>;
}

export const SEAT_SERVICE = Symbol("ISeatService");
