import type { OrganizerInvite, NewOrganizerInvite } from "@seat-snaps/db";

export interface IOrganizerInviteRepository {
  findByEventId(eventId: string): Promise<OrganizerInvite[]>;
  findByToken(token: string): Promise<OrganizerInvite | null>;
  create(data: NewOrganizerInvite): Promise<OrganizerInvite>;
  markAccepted(id: string): Promise<OrganizerInvite>;
  markExpired(id: string): Promise<OrganizerInvite>;
}

export const ORGANIZER_INVITE_REPOSITORY = Symbol("IOrganizerInviteRepository");
