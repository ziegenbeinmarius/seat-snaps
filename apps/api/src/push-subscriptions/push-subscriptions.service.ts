import { Injectable, Inject, Logger } from "@nestjs/common";
import webpush from "web-push";
import type { IPushSubscriptionRepository } from "../domain/repositories/IPushSubscriptionRepository";
import { PUSH_SUBSCRIPTION_REPOSITORY } from "../domain/repositories/IPushSubscriptionRepository";
import type { IPushSubscriptionService, SavePushSubscriptionInput } from "./domain/IPushSubscriptionService";

const logger = new Logger("PushSubscriptionsService");

@Injectable()
export class PushSubscriptionsService implements IPushSubscriptionService {
  constructor(
    @Inject(PUSH_SUBSCRIPTION_REPOSITORY)
    private readonly repository: IPushSubscriptionRepository,
  ) {
    const publicKey = process.env.VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (publicKey && privateKey && subject) {
      webpush.setVapidDetails(subject, publicKey, privateKey);
    } else {
      logger.warn("VAPID keys not configured — push notifications will not be sent");
    }
  }

  async save(data: SavePushSubscriptionInput): Promise<void> {
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
    if (!process.env.VAPID_PUBLIC_KEY) return;

    const subscriptions = await this.repository.findByEventId(eventId);
    if (subscriptions.length === 0) return;

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
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        const err = result.reason as { statusCode?: number };
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(subscriptions[i].endpoint);
        } else {
          logger.warn("Failed to send push notification", err);
        }
      }
    });

    await Promise.all(expiredEndpoints.map((ep) => this.repository.deleteByEndpoint(ep)));
  }
}
