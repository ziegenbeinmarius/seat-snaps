import { Controller, Get, Post, Param, Res, UseGuards } from "@nestjs/common";
import type { FastifyReply } from "fastify";
import { QrService } from "./qr.service";
import { EventMemberGuard } from "../auth/guards/event-member.guard";

function toFilenameSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "attendee";
}

@UseGuards(EventMemberGuard)
@Controller("events/:eventId")
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Get("attendees/:attendeeId/qr")
  async getAttendeeQr(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @Res() reply: FastifyReply,
  ) {
    const result = await this.qrService.generateForAttendee(attendeeId, eventId);
    const slug = toFilenameSlug(result.attendeeName);
    reply.header("Content-Type", "image/png");
    reply.header("Content-Disposition", `attachment; filename="qr-${slug}.png"`);
    return reply.send(result.buffer);
  }

  @Post("attendees/:attendeeId/qr")
  async generateAttendeeQr(
    @Param("eventId") eventId: string,
    @Param("attendeeId") attendeeId: string,
    @Res() reply: FastifyReply,
  ) {
    const result = await this.qrService.generateForAttendee(attendeeId, eventId);
    const slug = toFilenameSlug(result.attendeeName);
    reply.header("Content-Type", "image/png");
    reply.header("Content-Disposition", `attachment; filename="qr-${slug}.png"`);
    return reply.send(result.buffer);
  }

  @Get("qr/bulk")
  async generateBulk(
    @Param("eventId") eventId: string,
    @Res() reply: FastifyReply,
  ) {
    const buffer = await this.qrService.generateBulkZip(eventId);
    reply.header("Content-Type", "text/html; charset=utf-8");
    reply.header("Content-Disposition", "inline");
    return reply.send(buffer);
  }

  @Get("qr/event")
  async generateEventQr(
    @Param("eventId") eventId: string,
    @Res() reply: FastifyReply,
  ) {
    const buffer = await this.qrService.generateEventQr(eventId);
    reply.header("Content-Type", "image/png");
    reply.header("Content-Disposition", `attachment; filename="qr-event-${eventId}.png"`);
    return reply.send(buffer);
  }
}
