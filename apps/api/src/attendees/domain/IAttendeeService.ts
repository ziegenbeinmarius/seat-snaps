import type { Attendee } from "@seat-snaps/db";
import type { CreateAttendeeInput, UpdateAttendeeInput } from "@seat-snaps/shared";

export interface IAttendeeService {
  listForEvent(eventId: string): Promise<Attendee[]>;
  listPublic(eventId: string): Promise<Pick<Attendee, "id" | "name" | "groupLabel" | "tableId">[]>;
  getById(attendeeId: string, eventId: string): Promise<Attendee>;
  create(eventId: string, data: CreateAttendeeInput): Promise<Attendee>;
  bulkImport(eventId: string, csv: string): Promise<Attendee[]>;
  update(attendeeId: string, eventId: string, data: UpdateAttendeeInput): Promise<Attendee>;
  clearSeatAssignment(attendeeId: string, eventId: string): Promise<Attendee>;
  delete(attendeeId: string, eventId: string): Promise<void>;
  checkIn(eventId: string, qrToken: string): Promise<Attendee>;
}

export const ATTENDEE_SERVICE = Symbol("IAttendeeService");
