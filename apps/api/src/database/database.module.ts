import { Module, Global } from "@nestjs/common";
import { createDb } from "@seat-snaps/db";
import {
  DrizzleUserRepository,
  DrizzleEventRepository,
  DrizzleEventMembershipRepository,
  DrizzleOrganizerInviteRepository,
} from "../infrastructure/repositories";
import {
  USER_REPOSITORY,
  EVENT_REPOSITORY,
  EVENT_MEMBERSHIP_REPOSITORY,
  ORGANIZER_INVITE_REPOSITORY,
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
  ],
  exports: [USER_REPOSITORY, EVENT_REPOSITORY, EVENT_MEMBERSHIP_REPOSITORY, ORGANIZER_INVITE_REPOSITORY],
})
export class DatabaseModule {}
