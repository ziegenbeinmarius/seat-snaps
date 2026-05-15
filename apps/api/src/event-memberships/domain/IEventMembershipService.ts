import type { EventMembership } from "@seat-snaps/db";

export interface MemberWithUser extends EventMembership {
  user: { id: string; email: string; name: string };
}

export interface IEventMembershipService {
  listMembers(eventId: string, requesterId: string): Promise<MemberWithUser[]>;
  removeMember(eventId: string, targetUserId: string, requesterId: string): Promise<void>;
}

export const EVENT_MEMBERSHIP_SERVICE = Symbol("IEventMembershipService");
