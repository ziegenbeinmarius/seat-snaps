import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ForbiddenException,
  Inject,
} from "@nestjs/common";
import type { Attendee } from "@seat-snaps/db";
import { BroadcastsService } from "./broadcasts.service";
import { CreateBroadcastDto } from "./dto/create-broadcast.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { CurrentAttendee } from "../attendee-sessions/decorators/current-attendee.decorator";
import { AttendeeSessionGuard } from "../attendee-sessions/guards/attendee-session.guard";
import { Public } from "../auth/decorators/public.decorator";
import type { IBroadcastService } from "./domain/IBroadcastService";
import { BROADCAST_SERVICE } from "./domain/IBroadcastService";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("events/:id/broadcasts")
export class BroadcastsController {
  constructor(
    @Inject(BROADCAST_SERVICE)
    private readonly broadcastsService: IBroadcastService,
  ) {}

  @Post()
  create(
    @Param("id") eventId: string,
    @Body() dto: CreateBroadcastDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.broadcastsService.create(
      eventId,
      {
        title: dto.title,
        content: dto.content,
        targetType: dto.targetType,
        targetId: dto.targetId,
      },
      user.id,
    );
  }

  @Get()
  list(@Param("id") eventId: string, @CurrentUser() user: SessionUser) {
    return this.broadcastsService.listByEvent(eventId, user.id, "user");
  }

  @Public()
  @UseGuards(AttendeeSessionGuard)
  @Get("feed")
  listFeed(@Param("id") eventId: string, @CurrentAttendee() attendee: Attendee) {
    if (attendee.eventId !== eventId) throw new ForbiddenException("Access denied");
    return this.broadcastsService.listByEvent(eventId, attendee.id, "attendee");
  }
}
