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
import { EventsService } from "./events.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("events")
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  listEvents(@CurrentUser() user: SessionUser) {
    return this.eventsService.listForUser(user.id);
  }

  @Post()
  createEvent(@Body() dto: CreateEventDto, @CurrentUser() user: SessionUser) {
    console.log("yoo");
    
    return this.eventsService.create(
      {
        title: dto.title,
        description: dto.description,
        date: new Date(dto.date),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        location: dto.location,
        type: dto.type,
      },
      user.id,
    );
  }

  @Public()
  @Get(":id/info")
  getEventPublic(@Param("id") id: string) {
    return this.eventsService.getPublicInfo(id);
  }

  @Get(":id")
  getEvent(@Param("id") id: string, @CurrentUser() user: SessionUser) {
    return this.eventsService.getById(id, user.id);
  }

  @Patch(":id")
  updateEvent(
    @Param("id") id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.eventsService.update(
      id,
      {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.date !== undefined && { date: new Date(dto.date) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.type !== undefined && { type: dto.type }),
      },
      user.id,
    );
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteEvent(@Param("id") id: string, @CurrentUser() user: SessionUser) {
    return this.eventsService.delete(id, user.id);
  }
}
