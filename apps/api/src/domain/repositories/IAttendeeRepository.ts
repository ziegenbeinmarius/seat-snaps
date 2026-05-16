import type { Attendee, NewAttendee } from "@seat-snaps/db";

export type UpdateAttendeeData = Partial<
  Pick<
    NewAttendee,
    | "name"
    | "email"
    | "groupLabel"
    | "relationInfo"
    | "conversationStarters"
    | "tableId"
    | "seatId"
    | "photoLimit"
    | "checkedInAt"
  >
>;

export interface IAttendeeRepository {
  findById(id: string): Promise<Attendee | null>;
  findByQrToken(token: string): Promise<Attendee | null>;
  findByEventId(eventId: string): Promise<Attendee[]>;
  findByEventAndEmail(eventId: string, email: string): Promise<Attendee | null>;
  create(data: NewAttendee): Promise<Attendee>;
  update(id: string, data: UpdateAttendeeData): Promise<Attendee>;
  delete(id: string): Promise<void>;
}

export const ATTENDEE_REPOSITORY = Symbol("IAttendeeRepository");
