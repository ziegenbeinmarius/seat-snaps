import type { OrganizerInvite, Event } from "@seat-snaps/db";

export interface InviteWithEvent extends OrganizerInvite {
  event: Event;
}

export interface IOrganizerInviteService {
  listForEvent(eventId: string, requesterId: string): Promise<OrganizerInvite[]>;
  createInvite(eventId: string, email: string, role: string, expiresInDays: number, requesterId: string): Promise<OrganizerInvite>;
  getByToken(token: string): Promise<InviteWithEvent>;
  acceptInvite(token: string, userId: string): Promise<void>;
}

export const ORGANIZER_INVITE_SERVICE = Symbol("IOrganizerInviteService");
