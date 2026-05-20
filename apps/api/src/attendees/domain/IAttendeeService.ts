import type { Attendee } from "@seat-snaps/db";
import type { CreateAttendeeInput, UpdateAttendeeInput, RsvpRegistrationInput } from "@seat-snaps/shared";

export interface AttendeeStatusCounts {
  pending: number;
  confirmed: number;
  declined: number;
}

export interface AttendeeListResult {
  attendees: Attendee[];
  meta: AttendeeStatusCounts;
}

export interface IAttendeeService {
  listForEvent(eventId: string, userId: string, status?: string): Promise<AttendeeListResult>;
  listPublic(eventId: string): Promise<Pick<Attendee, "id" | "name" | "groupLabel" | "tableId" | "description" | "conversationStarters">[]>;
  getById(attendeeId: string, eventId: string, userId: string): Promise<Attendee>;
  create(eventId: string, data: CreateAttendeeInput, userId: string): Promise<Attendee>;
  createFromRsvp(eventId: string, data: RsvpRegistrationInput): Promise<Attendee>;
  bulkImport(eventId: string, csv: string, userId: string): Promise<Attendee[]>;
  update(attendeeId: string, eventId: string, data: UpdateAttendeeInput, userId: string): Promise<Attendee>;
  clearSeatAssignment(attendeeId: string, eventId: string, userId: string): Promise<Attendee>;
  delete(attendeeId: string, eventId: string, userId: string): Promise<void>;
  checkIn(eventId: string, qrToken: string, userId: string): Promise<Attendee>;
  updateStatus(attendeeId: string, eventId: string, status: "confirmed" | "declined", userId: string): Promise<Attendee>;
  bulkUpdateStatus(attendeeIds: string[], eventId: string, status: "confirmed" | "declined", userId: string): Promise<{ updated: Attendee[] }>;
}

export const ATTENDEE_SERVICE = Symbol("IAttendeeService");
