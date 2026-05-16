import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./health/health.module";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { EventsModule } from "./events/events.module";
import { EventMembershipsModule } from "./event-memberships/event-memberships.module";
import { OrganizerInvitesModule } from "./organizer-invites/organizer-invites.module";
import { AttendeesModule } from "./attendees/attendees.module";
import { TablesModule } from "./tables/tables.module";
import { SeatsModule } from "./seats/seats.module";
import { QrModule } from "./qr/qr.module";
import { AttendeeSessionsModule } from "./attendee-sessions/attendee-sessions.module";
import { ScheduleItemsModule } from "./schedule-items/schedule-items.module";
import { PhotosModule } from "./photos/photos.module";
import { ThemesModule } from "./themes/themes.module";
import { AdminModule } from "./admin/admin.module";
import { BroadcastsModule } from "./broadcasts/broadcasts.module";
import { FastifyThrottlerGuard } from "./common/guards/fastify-throttler.guard";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      { name: "short", ttl: 60_000, limit: 10 },
      { name: "long", ttl: 600_000, limit: 100 },
    ]),
    DatabaseModule,
    AuthModule,
    HealthModule,
    EventsModule,
    EventMembershipsModule,
    OrganizerInvitesModule,
    AttendeesModule,
    TablesModule,
    SeatsModule,
    QrModule,
    AttendeeSessionsModule,
    ScheduleItemsModule,
    PhotosModule,
    ThemesModule,
    AdminModule,
    BroadcastsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: FastifyThrottlerGuard },
  ],
})
export class AppModule {}
