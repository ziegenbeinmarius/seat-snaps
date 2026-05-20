import { Module } from "@nestjs/common";
import { AttendeesService } from "./attendees.service";
import { AttendeesController } from "./attendees.controller";
import { ATTENDEE_SERVICE } from "./domain/IAttendeeService";
import { AttendeeSessionsModule } from "../attendee-sessions/attendee-sessions.module";

@Module({
  imports: [AttendeeSessionsModule],
  controllers: [AttendeesController],
  providers: [
    AttendeesService,
    {
      provide: ATTENDEE_SERVICE,
      useClass: AttendeesService,
    },
  ],
  exports: [AttendeesService],
})
export class AttendeesModule {}
