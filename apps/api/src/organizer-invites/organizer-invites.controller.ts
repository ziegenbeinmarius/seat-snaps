import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { OrganizerInvitesService } from "./organizer-invites.service";
import { CreateInviteDto } from "./dto/create-invite.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { SessionUser } from "@seat-snaps/shared";

@Controller()
export class OrganizerInvitesController {
  constructor(private readonly invitesService: OrganizerInvitesService) {}

  @Get("events/:eventId/invites")
  listInvites(@Param("eventId") eventId: string, @CurrentUser() user: SessionUser) {
    return this.invitesService.listForEvent(eventId, user.id);
  }

  @Post("events/:eventId/invites")
  createInvite(
    @Param("eventId") eventId: string,
    @Body() dto: CreateInviteDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.invitesService.createInvite(
      eventId,
      dto.email,
      dto.role,
      dto.expiresInDays ?? 7,
      user.id,
    );
  }

  @Get("invites/:token")
  @Public()
  getInvite(@Param("token") token: string) {
    return this.invitesService.getByToken(token);
  }

  @Post("invites/:token/accept")
  @HttpCode(HttpStatus.OK)
  acceptInvite(@Param("token") token: string, @CurrentUser() user: SessionUser) {
    return this.invitesService.acceptInvite(token, user.id);
  }
}
