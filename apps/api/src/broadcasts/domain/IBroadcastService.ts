import type { Broadcast } from "@seat-snaps/db";
import type { CreateBroadcastInput } from "@seat-snaps/shared";

export interface BroadcastWithCount extends Broadcast {
  recipientCount: number;
}

export interface IBroadcastService {
  create(eventId: string, data: CreateBroadcastInput, userId: string): Promise<BroadcastWithCount>;
  listByEvent(eventId: string, requesterId: string, requesterType: "user" | "attendee"): Promise<Broadcast[]>;
  delete(broadcastId: string, eventId: string, userId: string): Promise<void>;
}

export const BROADCAST_SERVICE = Symbol("IBroadcastService");
