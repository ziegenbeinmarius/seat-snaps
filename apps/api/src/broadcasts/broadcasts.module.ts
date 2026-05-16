import { Module } from "@nestjs/common";
import { BroadcastsService } from "./broadcasts.service";
import { BroadcastsController } from "./broadcasts.controller";
import { BroadcastGateway } from "./broadcasts.gateway";
import { BROADCAST_SERVICE } from "./domain/IBroadcastService";
import { AuthModule } from "../auth/auth.module";
import { AttendeeSessionsModule } from "../attendee-sessions/attendee-sessions.module";

@Module({
  imports: [AuthModule, AttendeeSessionsModule],
  controllers: [BroadcastsController],
  providers: [
    BroadcastsService,
    { provide: BROADCAST_SERVICE, useClass: BroadcastsService },
    BroadcastGateway,
  ],
  exports: [BroadcastGateway],
})
export class BroadcastsModule {}
