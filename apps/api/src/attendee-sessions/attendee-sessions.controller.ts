import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import type { FastifyReply } from "fastify";
import type { Attendee } from "@seat-snaps/db";
import { AttendeeSessionsService } from "./attendee-sessions.service";
import { CreateAttendeeSessionDto } from "./dto/create-attendee-session.dto";
import { AttendeeSessionGuard, ATTENDEE_SESSION_COOKIE } from "./guards/attendee-session.guard";
import { CurrentAttendee } from "./decorators/current-attendee.decorator";
import { Public } from "../auth/decorators/public.decorator";

const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60;

@Controller("attendee-sessions")
export class AttendeeSessionsController {
  constructor(private readonly service: AttendeeSessionsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateAttendeeSessionDto, @Res() reply: FastifyReply) {
    if (!dto.qrToken && !(dto.attendeeId && dto.eventId)) {
      throw new BadRequestException("Provide qrToken or attendeeId + eventId");
    }

    const result = dto.qrToken
      ? await this.service.createFromQrToken(dto.qrToken, dto.deviceFingerprint)
      : await this.service.createFromManualSelection(
          dto.attendeeId!,
          dto.eventId!,
          dto.deviceFingerprint,
        );

    reply.setCookie(ATTENDEE_SESSION_COOKIE, result.session.token, {
      httpOnly: true,
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
    });
  }

  @UseGuards(AttendeeSessionGuard)
  @Public()
  @Get("me")
  getMe(@CurrentAttendee() attendee: Attendee) {
    return attendee;
  }
}
