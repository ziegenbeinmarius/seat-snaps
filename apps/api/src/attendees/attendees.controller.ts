import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Res,
  HttpCode,
  HttpStatus,
  Inject,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { randomBytes } from "node:crypto";
import type { FastifyReply } from "fastify";
import { AttendeesService } from "./attendees.service";
import { CreateAttendeeDto } from "./dto/create-attendee.dto";
import { UpdateAttendeeDto } from "./dto/update-attendee.dto";
import { UpdateAttendeeStatusDto } from "./dto/update-attendee-status.dto";
import { BulkStatusDto } from "./dto/bulk-status.dto";
import { CheckinDto } from "./dto/checkin.dto";
import { RsvpRegistrationDto } from "./dto/rsvp-registration.dto";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Public } from "../auth/decorators/public.decorator";
import type { IAttendeeSessionService } from "../attendee-sessions/domain/IAttendeeSessionService";
import { ATTENDEE_SESSION_SERVICE } from "../attendee-sessions/domain/IAttendeeSessionService";
import { ATTENDEE_SESSION_COOKIE } from "../attendee-sessions/guards/attendee-session.guard";
import { CSRF_COOKIE } from "../attendee-sessions/guards/csrf.guard";
import type { SessionUser } from "@seat-snaps/shared";

const SESSION_TTL_SECONDS = 90 * 24 * 60 * 60;

@Controller("events/:eventId/attendees")
export class AttendeesController {
  constructor(
    private readonly attendeesService: AttendeesService,
    @Inject(ATTENDEE_SESSION_SERVICE)
    private readonly sessionService: IAttendeeSessionService,
  ) {}

  @Public()
  @Get("public")
  listPublic(@Param("eventId") eventId: string) {
    return this.attendeesService.listPublic(eventId);
  }

  @Public()
  @Post("rsvp")
  @HttpCode(HttpStatus.CREATED)
  async rsvp(
    @Param("eventId") eventId: string,
    @Body() dto: RsvpRegistrationDto,
    @Res() reply: FastifyReply,
  ) {
    const attendee = await this.attendeesService.createFromRsvp(eventId, dto);
    const result = await this.sessionService.createFromQrToken(attendee.qrToken);

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
      attendee,
      eventId,
      token: result.session.token,
      csrfToken,
    });
  }

  @Get()
  list(
    @Param("eventId") eventId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.listForEvent(eventId, user.id);
  }

  @Post()
  create(
    @Param("eventId") eventId: string,
    @Body() dto: CreateAttendeeDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.create(eventId, dto, user.id);
  }

  @Post("checkin")
  checkIn(
    @Param("eventId") eventId: string,
    @Body() dto: CheckinDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.checkIn(eventId, dto.qrToken, user.id);
  }

  @Post("bulk-status")
  @HttpCode(HttpStatus.OK)
  bulkStatus(
    @Param("eventId") eventId: string,
    @Body() dto: BulkStatusDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.bulkUpdateStatus(dto.attendeeIds, eventId, dto.status, user.id);
  }

  @Post("import")
  async importCsv(
    @Param("eventId") eventId: string,
    @Body() body: { csv: string },
    @CurrentUser() user: SessionUser,
  ) {
    if (!body.csv) throw new BadRequestException("csv field is required");
    const MAX_CSV_BYTES = 1_048_576; // 1 MB
    if (Buffer.byteLength(body.csv, "utf8") > MAX_CSV_BYTES) {
      throw new BadRequestException("CSV payload exceeds the 1 MB limit");
    }
    return this.attendeesService.bulkImport(eventId, body.csv, user.id);
  }

  @Get(":attendeeId")
  getOne(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.getById(attendeeId, eventId, user.id);
  }

  @Patch(":attendeeId/status")
  @HttpCode(HttpStatus.OK)
  updateStatus(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @Body() dto: UpdateAttendeeStatusDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.updateStatus(attendeeId, eventId, dto.status, user.id);
  }

  @Patch(":attendeeId/unassign")
  @HttpCode(HttpStatus.OK)
  unassign(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.clearSeatAssignment(attendeeId, eventId, user.id);
  }

  @Patch(":attendeeId")
  update(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @Body() dto: UpdateAttendeeDto,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.update(attendeeId, eventId, dto, user.id);
  }

  @Delete(":attendeeId")
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @CurrentUser() user: SessionUser,
  ) {
    return this.attendeesService.delete(attendeeId, eventId, user.id);
  }
}
