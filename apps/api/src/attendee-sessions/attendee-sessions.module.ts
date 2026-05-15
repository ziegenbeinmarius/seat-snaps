import { Module } from "@nestjs/common";
import { AttendeeSessionsService } from "./attendee-sessions.service";
import { AttendeeSessionsController } from "./attendee-sessions.controller";
import { ATTENDEE_SESSION_SERVICE } from "./domain/IAttendeeSessionService";
import { AttendeeSessionGuard } from "./guards/attendee-session.guard";

@Module({
  controllers: [AttendeeSessionsController],
  providers: [
    AttendeeSessionsService,
    {
      provide: ATTENDEE_SESSION_SERVICE,
      useClass: AttendeeSessionsService,
    },
    AttendeeSessionGuard,
  ],
  exports: [ATTENDEE_SESSION_SERVICE, AttendeeSessionGuard],
})
export class AttendeeSessionsModule {}
