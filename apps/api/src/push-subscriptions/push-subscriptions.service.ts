import { Injectable, Inject, Logger } from "@nestjs/common";
import webpush from "web-push";
import type { IPushSubscriptionRepository } from "../domain/repositories/IPushSubscriptionRepository";
import { PUSH_SUBSCRIPTION_REPOSITORY } from "../domain/repositories/IPushSubscriptionRepository";
import type { IPushSubscriptionService, SavePushSubscriptionInput } from "./domain/IPushSubscriptionService";

const logger = new Logger("PushSubscriptionsService");

@Injectable()
export class PushSubscriptionsService implements IPushSubscriptionService {
  private readonly hasVapidConfig: boolean;

  constructor(
    @Inject(PUSH_SUBSCRIPTION_REPOSITORY)
    private readonly repository: IPushSubscriptionRepository,
  ) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    this.hasVapidConfig = Boolean(publicKey && privateKey && subject);

    if (this.hasVapidConfig) {
      webpush.setVapidDetails(subject!, publicKey!, privateKey!);
    } else {
      const missing = [
        !publicKey ? "VAPID_PUBLIC_KEY" : null,
        !privateKey ? "VAPID_PRIVATE_KEY" : null,
        !subject ? "VAPID_SUBJECT" : null,
      ]
        .filter(Boolean)
        .join(", ");
      logger.warn(`VAPID config incomplete (${missing}) — push notifications will not be sent`);
    }
  }

  async save(data: SavePushSubscriptionInput): Promise<void> {
    if (data.attendeeSessionId) {
      await this.repository.deleteOthersForAttendeeSession(
        data.eventId,
        data.attendeeSessionId,
        data.endpoint,
      );
    }

    if (data.userId) {
      await this.repository.deleteOthersForUser(data.eventId, data.userId, data.endpoint);
    }

    await this.repository.upsert({
      eventId: data.eventId,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      attendeeSessionId: data.attendeeSessionId ?? null,
      userId: data.userId ?? null,
    });
  }

  async remove(endpoint: string): Promise<void> {
    await this.repository.deleteByEndpoint(endpoint);
  }

  getVapidPublicKey(): string {
    return process.env.VAPID_PUBLIC_KEY ?? "";
  }

  async sendToEvent(
    eventId: string,
    payload: { title: string; body: string; url?: string },
  ): Promise<void> {
    if (!this.hasVapidConfig) {
      logger.warn(`Skipping push send for event ${eventId}: VAPID config is incomplete`);
      return;
    }

    const subscriptions = await this.repository.findByEventId(eventId);
    if (subscriptions.length === 0) {
      logger.log(`No push subscriptions found for event ${eventId}`);
      return;
    }

    logger.log(`Sending push broadcast to ${subscriptions.length} subscription(s) for event ${eventId}`);

    const json = JSON.stringify(payload);
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          json,
        ),
      ),
    );

    const expiredEndpoints: string[] = [];
    let successCount = 0;

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        successCount += 1;
      } else {
        const err = result.reason as { statusCode?: number; body?: string; message?: string };
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(subscriptions[i].endpoint);
        } else {
          logger.warn(
            `Failed push delivery for endpoint ${subscriptions[i].endpoint} (status: ${err.statusCode ?? "unknown"}) - ${err.message ?? "no message"} - ${err.body ?? "no body"}`,
          );
        }
      }
    });

    logger.log(
      `Push send result for event ${eventId}: ${successCount} success, ${expiredEndpoints.length} expired, ${subscriptions.length - successCount - expiredEndpoints.length} failed`,
    );

    await Promise.all(expiredEndpoints.map((ep) => this.repository.deleteByEndpoint(ep)));
  }
}
