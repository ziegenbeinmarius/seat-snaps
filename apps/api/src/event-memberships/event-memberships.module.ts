import { Module } from "@nestjs/common";
import { EventMembershipsService } from "./event-memberships.service";
import { EventMembershipsController } from "./event-memberships.controller";
import { EVENT_MEMBERSHIP_SERVICE } from "./domain/IEventMembershipService";

@Module({
  controllers: [EventMembershipsController],
  providers: [
    EventMembershipsService,
    {
      provide: EVENT_MEMBERSHIP_SERVICE,
      useClass: EventMembershipsService,
    },
  ],
  exports: [EventMembershipsService],
})
export class EventMembershipsModule {}
