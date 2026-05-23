import { Module, Global } from "@nestjs/common";
import { createDb } from "@seat-snaps/db";
import {
  DrizzleUserRepository,
  DrizzleEventRepository,
  DrizzleEventMembershipRepository,
  DrizzleOrganizerInviteRepository,
  DrizzleAttendeeRepository,
  DrizzleTableRepository,
  DrizzleSeatRepository,
  DrizzlePhotoRepository,
  DrizzleAttendeeSessionRepository,
  DrizzleScheduleItemRepository,
  DrizzleEventThemeRepository,
  DrizzleBroadcastRepository,
  DrizzlePushSubscriptionRepository,
  DrizzleUserCreditRepository,
  DrizzlePaymentRepository,
  DrizzlePricingTierRepository,
} from "../infrastructure/repositories";
import {
  USER_REPOSITORY,
  EVENT_REPOSITORY,
  EVENT_MEMBERSHIP_REPOSITORY,
  ORGANIZER_INVITE_REPOSITORY,
  ATTENDEE_REPOSITORY,
  TABLE_REPOSITORY,
  SEAT_REPOSITORY,
  PHOTO_REPOSITORY,
  ATTENDEE_SESSION_REPOSITORY,
  SCHEDULE_ITEM_REPOSITORY,
  EVENT_THEME_REPOSITORY,
  BROADCAST_REPOSITORY,
  PUSH_SUBSCRIPTION_REPOSITORY,
  USER_CREDIT_REPOSITORY,
  PAYMENT_REPOSITORY,
  PRICING_TIER_REPOSITORY,
} from "../domain/repositories";

export const DB_PROVIDER = Symbol("DATABASE");

@Global()
@Module({
  providers: [
    {
      provide: DB_PROVIDER,
      useFactory: () => {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error("DATABASE_URL is not set");
        return createDb(url);
      },
    },
    {
      provide: USER_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleUserRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: EVENT_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleEventRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: EVENT_MEMBERSHIP_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleEventMembershipRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: ORGANIZER_INVITE_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleOrganizerInviteRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: ATTENDEE_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleAttendeeRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: TABLE_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleTableRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SEAT_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleSeatRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: PHOTO_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzlePhotoRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: ATTENDEE_SESSION_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) =>
        new DrizzleAttendeeSessionRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: SCHEDULE_ITEM_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleScheduleItemRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: EVENT_THEME_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleEventThemeRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: BROADCAST_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleBroadcastRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: PUSH_SUBSCRIPTION_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzlePushSubscriptionRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: USER_CREDIT_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleUserCreditRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: PAYMENT_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzlePaymentRepository(db),
      inject: [DB_PROVIDER],
    },
    {
      provide: PRICING_TIER_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzlePricingTierRepository(db),
      inject: [DB_PROVIDER],
    },
  ],
  exports: [
    DB_PROVIDER,
    USER_REPOSITORY,
    EVENT_REPOSITORY,
    EVENT_MEMBERSHIP_REPOSITORY,
    ORGANIZER_INVITE_REPOSITORY,
    ATTENDEE_REPOSITORY,
    TABLE_REPOSITORY,
    SEAT_REPOSITORY,
    PHOTO_REPOSITORY,
    ATTENDEE_SESSION_REPOSITORY,
    SCHEDULE_ITEM_REPOSITORY,
    EVENT_THEME_REPOSITORY,
    BROADCAST_REPOSITORY,
    PUSH_SUBSCRIPTION_REPOSITORY,
    USER_CREDIT_REPOSITORY,
    PAYMENT_REPOSITORY,
    PRICING_TIER_REPOSITORY,
  ],
})
export class DatabaseModule {}
