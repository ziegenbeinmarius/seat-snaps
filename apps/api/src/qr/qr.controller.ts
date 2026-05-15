import { Controller, Get, Post, Param, Res } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { QrService } from "./qr.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { SessionUser } from "@seat-snaps/shared";

function toFilenameSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "attendee";
}

@Controller("events/:eventId")
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get("attendees/:attendeeId/qr")
  async getAttendeeQr(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @CurrentUser() user: SessionUser,
    @Res() reply: FastifyReply,
  ) {
    const result = await this.qrService.generateForAttendee(attendeeId, eventId, user.id);
    const slug = toFilenameSlug(result.attendeeName);
    reply.header("Content-Type", "image/png");
    reply.header("Content-Disposition", `attachment; filename="qr-${slug}.png"`);
    return reply.send(result.buffer);
  }

  @Post("attendees/:attendeeId/qr")
  async generateAttendeeQr(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @CurrentUser() user: SessionUser,
    @Res() reply: FastifyReply,
  ) {
    const result = await this.qrService.generateForAttendee(attendeeId, eventId, user.id);
    const slug = toFilenameSlug(result.attendeeName);
    reply.header("Content-Type", "image/png");
    reply.header("Content-Disposition", `attachment; filename="qr-${slug}.png"`);
    return reply.send(result.buffer);
  }

  @Get("qr/bulk")
  async generateBulk(
    @Param("eventId") eventId: string,
    @CurrentUser() user: SessionUser,
    @Res() reply: FastifyReply,
  ) {
    const buffer = await this.qrService.generateBulkZip(eventId, user.id);
    reply.header("Content-Type", "text/html; charset=utf-8");
    reply.header("Content-Disposition", `attachment; filename="qr-bulk-${eventId}.html"`);
    return reply.send(buffer);
  }

  @Get("qr/event")
  async generateEventQr(
    @Param("eventId") eventId: string,
    @CurrentUser() user: SessionUser,
    @Res() reply: FastifyReply,
  ) {
    const buffer = await this.qrService.generateEventQr(eventId, user.id);
    reply.header("Content-Type", "image/png");
    reply.header("Content-Disposition", `attachment; filename="qr-event-${eventId}.png"`);
    return reply.send(buffer);
  }
}
