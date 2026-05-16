import { Module, Global } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
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
} from "../domain/repositories";

export const DATABASE = Symbol("DATABASE");

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useFactory: (config: ConfigService) => {
        return createDb(config.getOrThrow<string>("app.databaseUrl"));
      },
      inject: [ConfigService],
    },
    {
      provide: USER_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleUserRepository(db),
      inject: [DATABASE],
    },
    {
      provide: EVENT_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleEventRepository(db),
      inject: [DATABASE],
    },
    {
      provide: EVENT_MEMBERSHIP_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleEventMembershipRepository(db),
      inject: [DATABASE],
    },
    {
      provide: ORGANIZER_INVITE_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleOrganizerInviteRepository(db),
      inject: [DATABASE],
    },
    {
      provide: ATTENDEE_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleAttendeeRepository(db),
      inject: [DATABASE],
    },
    {
      provide: TABLE_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleTableRepository(db),
      inject: [DATABASE],
    },
    {
      provide: SEAT_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleSeatRepository(db),
      inject: [DATABASE],
    },
    {
      provide: PHOTO_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzlePhotoRepository(db),
      inject: [DATABASE],
    },
    {
      provide: ATTENDEE_SESSION_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) =>
        new DrizzleAttendeeSessionRepository(db),
      inject: [DATABASE],
    },
    {
      provide: SCHEDULE_ITEM_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleScheduleItemRepository(db),
      inject: [DATABASE],
    },
    {
      provide: EVENT_THEME_REPOSITORY,
      useFactory: (db: ReturnType<typeof createDb>) => new DrizzleEventThemeRepository(db),
      inject: [DATABASE],
    },
  ],
  exports: [
    DATABASE,
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
  ],
})
export class DatabaseModule {}
