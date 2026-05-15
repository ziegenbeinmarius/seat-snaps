import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { EVENT_SERVICE } from "./domain/IEventService";

@Module({
  controllers: [EventsController],
  providers: [
    EventsService,
    {
      provide: EVENT_SERVICE,
      useClass: EventsService,
    },
  ],
  exports: [EventsService],
})
export class EventsModule {}
