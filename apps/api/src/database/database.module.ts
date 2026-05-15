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
} from "../infrastructure/repositories";
import {
  USER_REPOSITORY,
  EVENT_REPOSITORY,
  EVENT_MEMBERSHIP_REPOSITORY,
  ORGANIZER_INVITE_REPOSITORY,
  ATTENDEE_REPOSITORY,
  TABLE_REPOSITORY,
  SEAT_REPOSITORY,
} from "../domain/repositories";

const DB_PROVIDER = Symbol("DATABASE");

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
  ],
  exports: [
    USER_REPOSITORY,
    EVENT_REPOSITORY,
    EVENT_MEMBERSHIP_REPOSITORY,
    ORGANIZER_INVITE_REPOSITORY,
    ATTENDEE_REPOSITORY,
    TABLE_REPOSITORY,
    SEAT_REPOSITORY,
  ],
})
export class DatabaseModule {}
