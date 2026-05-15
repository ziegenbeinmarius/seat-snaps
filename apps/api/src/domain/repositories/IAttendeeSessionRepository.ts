import type { AttendeeSession, NewAttendeeSession } from "@seat-snaps/db";

export interface IAttendeeSessionRepository {
  findByToken(token: string): Promise<AttendeeSession | null>;
  findByAttendeeId(attendeeId: string): Promise<AttendeeSession[]>;
  create(data: NewAttendeeSession): Promise<AttendeeSession>;
  deleteByToken(token: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export const ATTENDEE_SESSION_REPOSITORY = Symbol("IAttendeeSessionRepository");
