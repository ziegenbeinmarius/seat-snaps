import { Injectable, Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import * as QRCode from "qrcode";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IQrService } from "./domain/IQrService";

@Injectable()
export class QrService implements IQrService {
  constructor(
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
  ) {}

  async generateForAttendee(
    attendeeId: string,
    eventId: string,
    userId: string,
  ): Promise<Buffer> {
    await this.requireMember(eventId, userId);

    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");

    const appUrl = process.env.APP_URL ?? "http://localhost:3005";
    const url = `${appUrl}/join/${attendee.qrToken}`;
    return QRCode.toBuffer(url, { type: "png", width: 300, margin: 2 });
  }

  async generateBulkZip(eventId: string, userId: string): Promise<Buffer> {
    await this.requireMember(eventId, userId);

    const attendees = await this.attendeeRepository.findByEventId(eventId);
    const appUrl = process.env.APP_URL ?? "http://localhost:3005";

    const items = await Promise.all(
      attendees.map(async (a) => {
        const url = `${appUrl}/join/${a.qrToken}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
        return { id: a.id, name: a.name, qrDataUrl: dataUrl };
      }),
    );

    const html = this.buildPrintHtml(items);
    return Buffer.from(html, "utf-8");
  }

  async generateEventQr(eventId: string, userId: string): Promise<Buffer> {
    await this.requireMember(eventId, userId);

    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const appUrl = process.env.APP_URL ?? "http://localhost:3005";
    const url = `${appUrl}/join/event/${eventId}`;
    return QRCode.toBuffer(url, { type: "png", width: 300, margin: 2 });
  }

  private buildPrintHtml(items: { id: string; name: string; qrDataUrl: string }[]): string {
    const cards = items
      .map(
        (item) => `
      <div class="card">
        <img src="${item.qrDataUrl}" alt="QR for ${item.name}" />
        <p>${item.name}</p>
      </div>`,
      )
      .join("");

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>QR Codes</title>
<style>
  body { font-family: sans-serif; margin: 0; padding: 16px; }
  .grid { display: flex; flex-wrap: wrap; gap: 16px; }
  .card { text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 12px; width: 200px; }
  .card img { width: 150px; height: 150px; }
  .card p { margin: 8px 0 0; font-size: 12px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  @media print { .card { break-inside: avoid; } }
</style>
</head>
<body>
<div class="grid">${cards}</div>
</body>
</html>`;
  }

  private async requireMember(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    const membership = await this.membershipRepository.findByUserAndEvent(userId, eventId);
    if (!membership) throw new ForbiddenException("Access denied");
  }
}
