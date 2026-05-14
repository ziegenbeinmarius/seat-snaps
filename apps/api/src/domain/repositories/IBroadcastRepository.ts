import type { Broadcast, NewBroadcast } from "@seat-snaps/db";

export interface IBroadcastRepository {
  findById(id: string): Promise<Broadcast | null>;
  findByEventId(eventId: string): Promise<Broadcast[]>;
  create(data: NewBroadcast): Promise<Broadcast>;
  delete(id: string): Promise<void>;
}

export const BROADCAST_REPOSITORY = Symbol("IBroadcastRepository");
