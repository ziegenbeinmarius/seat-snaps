import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { TablesService } from "./tables.service";
import { CreateTableDto } from "./dto/create-table.dto";
import { UpdateTableDto } from "./dto/update-table.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("events/:eventId/tables")
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  list(@Param("eventId") eventId: string, @CurrentUser() user: SessionUser) {
    return this.tablesService.listForEvent(eventId, user.id);
  }

  @Post()
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateTableDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.tablesService.create(eventId, dto, user.id);
  }

  @Get(":tableId")
  getOne(
    @Param("eventId") eventId: string,
    @Param("tableId") tableId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.tablesService.getById(tableId, eventId, user.id);
  }

  @Patch(":tableId")
  update(
    @Param("eventId") eventId: string,
    @Param("tableId") tableId: string,
    @Body() dto: UpdateTableDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.tablesService.update(tableId, eventId, dto, user.id);
  }

  @Delete(":tableId")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param("eventId") eventId: string,
    @Param("tableId") tableId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.tablesService.delete(tableId, eventId, user.id);
  }
}
