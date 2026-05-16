export interface SavePushSubscriptionInput {
  eventId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  attendeeSessionId?: string;
  userId?: string;
}

export interface IPushSubscriptionService {
  save(data: SavePushSubscriptionInput): Promise<void>;
  remove(endpoint: string): Promise<void>;
  getVapidPublicKey(): string;
}

export const PUSH_SUBSCRIPTION_SERVICE = Symbol("IPushSubscriptionService");
