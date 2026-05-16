import type { Broadcast } from "@seat-snaps/db";
import type { CreateBroadcastInput } from "@seat-snaps/shared";

export interface IBroadcastService {
  create(eventId: string, data: CreateBroadcastInput, userId: string): Promise<Broadcast>;
  listByEvent(eventId: string, requesterId: string, requesterType: "user" | "attendee"): Promise<Broadcast[]>;
}

export const BROADCAST_SERVICE = Symbol("IBroadcastService");
