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
import { ScheduleItemsService } from "./schedule-items.service";
import { CreateScheduleItemDto } from "./dto/create-schedule-item.dto";
import { UpdateScheduleItemDto } from "./dto/update-schedule-item.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("events/:eventId/schedule")
export class ScheduleItemsController {
  constructor(private readonly service: ScheduleItemsService) {}

  @Public()
  @Get()
  list(@Param("eventId") eventId: string) {
    return this.service.listForEvent(eventId);
  }

  @Public()
  @Get(":id")
  getOne(@Param("eventId") eventId: string, @Param("id") id: string) {
    return this.service.getById(id, eventId);
  }

  @Post()
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateScheduleItemDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.create(eventId, dto as never, user.id);
  }

  @Patch(":id")
  update(
    @Param("eventId") eventId: string,
    @Param("id") id: string,
    @Body() dto: UpdateScheduleItemDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.update(id, eventId, dto as never, user.id);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param("eventId") eventId: string,
    @Param("id") id: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.service.delete(id, eventId, user.id);
  }
}
