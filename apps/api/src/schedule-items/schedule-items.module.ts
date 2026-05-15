import { Module } from "@nestjs/common";
import { ScheduleItemsService } from "./schedule-items.service";
import { ScheduleItemsController } from "./schedule-items.controller";
import { SCHEDULE_ITEM_SERVICE } from "./domain/IScheduleItemService";

@Module({
  controllers: [ScheduleItemsController],
  providers: [
    ScheduleItemsService,
    {
      provide: SCHEDULE_ITEM_SERVICE,
      useClass: ScheduleItemsService,
    },
  ],
  exports: [SCHEDULE_ITEM_SERVICE],
})
export class ScheduleItemsModule {}
