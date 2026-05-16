import type { PushSubscription, NewPushSubscription } from "@seat-snaps/db";

export interface IPushSubscriptionRepository {
  findByEventId(eventId: string): Promise<PushSubscription[]>;
  findByEndpoint(endpoint: string): Promise<PushSubscription | null>;
  upsert(data: NewPushSubscription): Promise<PushSubscription>;
  deleteOthersForAttendeeSession(eventId: string, attendeeSessionId: string, endpoint: string): Promise<void>;
  deleteOthersForUser(eventId: string, userId: string, endpoint: string): Promise<void>;
  deleteByEndpoint(endpoint: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}

export const PUSH_SUBSCRIPTION_REPOSITORY = Symbol("IPushSubscriptionRepository");
