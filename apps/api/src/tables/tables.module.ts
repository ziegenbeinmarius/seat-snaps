import { Module } from "@nestjs/common";
import { TablesService } from "./tables.service";
import { TablesController } from "./tables.controller";
import { TABLE_SERVICE } from "./domain/ITableService";
import { BroadcastsModule } from "../broadcasts/broadcasts.module";

@Module({
  imports: [BroadcastsModule],
  controllers: [TablesController],
  providers: [
    TablesService,
    {
      provide: TABLE_SERVICE,
      useClass: TablesService,
    },
  ],
  exports: [TablesService],
})
export class TablesModule {}
