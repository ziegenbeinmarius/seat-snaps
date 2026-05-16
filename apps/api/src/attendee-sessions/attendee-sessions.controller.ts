import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import { Throttle } from "@nestjs/throttler";
import type { FastifyReply } from "fastify";
import type { Attendee } from "@seat-snaps/db";
import { AttendeeSessionsService } from "./attendee-sessions.service";
import type { AttendeeSessionWithAttendee } from "./domain/IAttendeeSessionService";
import { CreateAttendeeSessionDto } from "./dto/create-attendee-session.dto";
import { UpdateAttendeeSelfDto } from "./dto/update-attendee-self.dto";
import { AttendeeSessionGuard, ATTENDEE_SESSION_COOKIE } from "./guards/attendee-session.guard";
import { CsrfGuard, CSRF_COOKIE } from "./guards/csrf.guard";
import { CurrentAttendee } from "./decorators/current-attendee.decorator";
import { Public } from "../auth/decorators/public.decorator";

const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60;

@Controller("attendee-sessions")
export class AttendeeSessionsController {
  constructor(private readonly service: AttendeeSessionsService) {}

  @Public()
  @Throttle({ short: { ttl: 60_000, limit: 5 }, long: { ttl: 600_000, limit: 20 } })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAttendeeSessionDto, @Res() reply: FastifyReply) {
    let result: AttendeeSessionWithAttendee;
    if (dto.qrToken) {
      result = await this.service.createFromQrToken(dto.qrToken, dto.deviceFingerprint);
    } else if (dto.attendeeId && dto.eventId) {
      result = await this.service.createFromAttendeeId(
        dto.attendeeId,
        dto.eventId,
        dto.deviceFingerprint,
      );
    } else {
      throw new BadRequestException("Provide either qrToken or attendeeId with eventId");
    }

    reply.setCookie(ATTENDEE_SESSION_COOKIE, result.session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    const csrfToken = randomBytes(32).toString("hex");
    reply.setCookie(CSRF_COOKIE, csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return reply.status(201).send({
      token: result.session.token,
      attendeeId: result.attendee.id,
      eventId: result.attendee.eventId,
      name: result.attendee.name,
      csrfToken,
    });
  }

  @UseGuards(AttendeeSessionGuard)
  @Public()
  @Get("me")
  getMe(@CurrentAttendee() attendee: Attendee) {
    return attendee;
  }

  @UseGuards(CsrfGuard, AttendeeSessionGuard)
  @Public()
  @Patch("me")
  @HttpCode(HttpStatus.OK)
  updateMe(@CurrentAttendee() attendee: Attendee, @Body() dto: UpdateAttendeeSelfDto) {
    return this.service.updateSelf(attendee.id, dto);
  }
}
