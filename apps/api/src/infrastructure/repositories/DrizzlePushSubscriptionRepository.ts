import { and, eq, ne } from "@seat-snaps/db";
import type { Database, PushSubscription, NewPushSubscription } from "@seat-snaps/db";
import { pushSubscriptions } from "@seat-snaps/db";
import type { IPushSubscriptionRepository } from "../../domain/repositories/IPushSubscriptionRepository";

export class DrizzlePushSubscriptionRepository implements IPushSubscriptionRepository {
  constructor(private readonly db: Database) {}

  async findByEventId(eventId: string): Promise<PushSubscription[]> {
    return this.db.select().from(pushSubscriptions).where(eq(pushSubscriptions.eventId, eventId));
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    const result = await this.db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, endpoint))
      .limit(1);
    return result[0] ?? null;
  }

  async upsert(data: NewPushSubscription): Promise<PushSubscription> {
    const result = await this.db
      .insert(pushSubscriptions)
      .values(data)
      .onConflictDoUpdate({
        target: pushSubscriptions.endpoint,
        set: {
          p256dh: data.p256dh,
          auth: data.auth,
          eventId: data.eventId,
          attendeeSessionId: data.attendeeSessionId ?? null,
          userId: data.userId ?? null,
        },
      })
      .returning();
    return result[0];
  }

  async deleteOthersForAttendeeSession(
    eventId: string,
    attendeeSessionId: string,
    endpoint: string,
  ): Promise<void> {
    await this.db.delete(pushSubscriptions).where(
      and(
        eq(pushSubscriptions.eventId, eventId),
        eq(pushSubscriptions.attendeeSessionId, attendeeSessionId),
        ne(pushSubscriptions.endpoint, endpoint),
      ),
    );
  }

  async deleteOthersForUser(eventId: string, userId: string, endpoint: string): Promise<void> {
    await this.db.delete(pushSubscriptions).where(
      and(
        eq(pushSubscriptions.eventId, eventId),
        eq(pushSubscriptions.userId, userId),
        ne(pushSubscriptions.endpoint, endpoint),
      ),
    );
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint));
  }

  async deleteById(id: string): Promise<void> {
    await this.db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, id));
  }
}
