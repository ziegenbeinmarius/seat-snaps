import type { Attendee } from "@seat-snaps/db";
import type { CreateAttendeeInput, UpdateAttendeeInput } from "@seat-snaps/shared";

export interface IAttendeeService {
  listForEvent(eventId: string, userId: string): Promise<Attendee[]>;
  listPublic(eventId: string): Promise<Pick<Attendee, "id" | "name" | "groupLabel" | "tableId">[]>;
  getById(attendeeId: string, eventId: string, userId: string): Promise<Attendee>;
  create(eventId: string, data: CreateAttendeeInput, userId: string): Promise<Attendee>;
  bulkImport(eventId: string, csv: string, userId: string): Promise<Attendee[]>;
  update(attendeeId: string, eventId: string, data: UpdateAttendeeInput, userId: string): Promise<Attendee>;
  delete(attendeeId: string, eventId: string, userId: string): Promise<void>;
}

export const ATTENDEE_SERVICE = Symbol("IAttendeeService");
