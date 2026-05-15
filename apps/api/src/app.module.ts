import { Module } from "@nestjs/common";
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

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
