import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  Get,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import type { AttendeeSession } from "@seat-snaps/db";
import type { IPushSubscriptionService } from "./domain/IPushSubscriptionService";
import { PUSH_SUBSCRIPTION_SERVICE } from "./domain/IPushSubscriptionService";
import { SavePushSubscriptionDto } from "./dto/save-push-subscription.dto";
import { AttendeeSessionGuard } from "../attendee-sessions/guards/attendee-session.guard";
import { CsrfGuard } from "../attendee-sessions/guards/csrf.guard";
import { Public } from "../auth/decorators/public.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SessionUser } from "@seat-snaps/shared";
import { createParamDecorator, ExecutionContext } from "@nestjs/common";

const CurrentAttendeeSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AttendeeSession => {
    const request = ctx.switchToHttp().getRequest<{ attendeeSession: AttendeeSession }>();
    return request.attendeeSession;
  },
);

@Controller("push-subscriptions")
export class PushSubscriptionsController {
  constructor(
    @Inject(PUSH_SUBSCRIPTION_SERVICE)
    private readonly service: IPushSubscriptionService,
  ) {}

  @Public()
  @Get("vapid-key")
  getVapidKey() {
    return { publicKey: this.service.getVapidPublicKey() };
  }

  @Public()
  @UseGuards(CsrfGuard, AttendeeSessionGuard)
  @Post("attendee/:eventId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async subscribeAttendee(
    @Param("eventId") eventId: string,
    @Body() dto: SavePushSubscriptionDto,
    @CurrentAttendeeSession() attendeeSession: AttendeeSession,
  ) {
    await this.service.save({
      eventId,
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
      attendeeSessionId: attendeeSession.id,
    });
  }

  @Public()
  @UseGuards(CsrfGuard, AttendeeSessionGuard)
  @Delete("attendee")
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribeAttendee(@Body() dto: Pick<SavePushSubscriptionDto, "endpoint">) {
    await this.service.remove(dto.endpoint);
  }

  @Post("organizer/:eventId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async subscribeOrganizer(
    @Param("eventId") eventId: string,
    @Body() dto: SavePushSubscriptionDto,
    @CurrentUser() user: SessionUser,
  ) {
    await this.service.save({
      eventId,
      endpoint: dto.endpoint,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
      userId: user.id,
    });
  }

  @Delete("organizer")
  @HttpCode(HttpStatus.NO_CONTENT)
  async unsubscribeOrganizer(@Body() dto: Pick<SavePushSubscriptionDto, "endpoint">) {
    await this.service.remove(dto.endpoint);
  }
}
