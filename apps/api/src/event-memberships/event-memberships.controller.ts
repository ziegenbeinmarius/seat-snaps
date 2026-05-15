import {
  Controller,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { EventMembershipsService } from "./event-memberships.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller("events/:eventId/members")
export class EventMembershipsController {
  constructor(private readonly membershipsService: EventMembershipsService) {}

  @Get()
  listMembers(@Param("eventId") eventId: string, @CurrentUser() user: SessionUser) {
    return this.membershipsService.listMembers(eventId, user.id);
  }

  @Delete(":userId")
  @HttpCode(HttpStatus.NO_CONTENT)
  removeMember(
    @Param("eventId") eventId: string,
    @Param("userId") userId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.membershipsService.removeMember(eventId, userId, user.id);
  }
}
