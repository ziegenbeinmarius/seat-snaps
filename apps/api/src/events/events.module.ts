import { Module } from "@nestjs/common";
import { EventsService } from "./events.service";
import { EventsController } from "./events.controller";
import { EVENT_SERVICE } from "./domain/IEventService";
import { CreditsModule } from "../credits/credits.module";

@Module({
  imports: [CreditsModule],
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
