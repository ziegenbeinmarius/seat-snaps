import { Module } from "@nestjs/common";
import { SeatsService } from "./seats.service";
import { SeatsController } from "./seats.controller";
import { SEAT_SERVICE } from "./domain/ISeatService";
import { BroadcastsModule } from "../broadcasts/broadcasts.module";

@Module({
  imports: [BroadcastsModule],
  controllers: [SeatsController],
  providers: [
    SeatsService,
    {
      provide: SEAT_SERVICE,
      useClass: SeatsService,
    },
  ],
  exports: [SeatsService],
})
export class SeatsModule {}
