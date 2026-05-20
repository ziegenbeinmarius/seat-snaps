import type { Attendee, AttendeeSession } from "@seat-snaps/db";

export interface AttendeeSessionWithAttendee {
  session: AttendeeSession;
  attendee: Attendee;
}

export interface IAttendeeSessionService {
  createFromQrToken(
    qrToken: string,
    deviceFingerprint?: string,
  ): Promise<AttendeeSessionWithAttendee>;
  createFromAttendeeId(
    attendeeId: string,
    eventId: string,
    deviceFingerprint?: string,
  ): Promise<AttendeeSessionWithAttendee>;
  getByToken(token: string): Promise<AttendeeSessionWithAttendee>;
  updateSelf(
    attendeeId: string,
    data: { description?: string; conversationStarters?: string[] },
  ): Promise<Attendee>;
}

export const ATTENDEE_SESSION_SERVICE = Symbol("IAttendeeSessionService");
