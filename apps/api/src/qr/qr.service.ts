import { Injectable, Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import * as QRCode from "qrcode";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { ITableRepository } from "../domain/repositories/ITableRepository";
import { TABLE_REPOSITORY } from "../domain/repositories/ITableRepository";
import type { ISeatRepository } from "../domain/repositories/ISeatRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import type { IQrService } from "./domain/IQrService";
import type { AttendeeQrResult } from "./domain/IQrService";

@Injectable()
export class QrService implements IQrService {
  constructor(
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
    @Inject(TABLE_REPOSITORY)
    private readonly tableRepository: ITableRepository,
    @Inject(SEAT_REPOSITORY)
    private readonly seatRepository: ISeatRepository,
  ) {}

  async generateForAttendee(
    attendeeId: string,
    eventId: string,
    userId: string,
  ): Promise<AttendeeQrResult> {
    await this.requireMember(eventId, userId);

    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");

    const appUrl = process.env.APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3005";
    const url = `${appUrl}/join/${attendee.qrToken}`;
    const buffer = await QRCode.toBuffer(url, { type: "png", width: 300, margin: 2 });
    return { buffer, attendeeName: attendee.name };
  }

  async generateBulkZip(eventId: string, userId: string): Promise<Buffer> {
    await this.requireMember(eventId, userId);

    const [attendees, tables, seats] = await Promise.all([
      this.attendeeRepository.findByEventId(eventId),
      this.tableRepository.findByEventId(eventId),
      this.seatRepository.findByEventId(eventId),
    ]);

    const tableMap = new Map(tables.map((t) => [t.id, t.label ?? t.name]));
    const seatMap = new Map(seats.map((s) => [s.id, s.label ?? (s.position != null ? `#${s.position}` : null)]));

    const appUrl = process.env.APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3005";

    const items = await Promise.all(
      attendees.map(async (a) => {
        const url = `${appUrl}/join/${a.qrToken}`;
        const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
        return {
          id: a.id,
          name: a.name,
          qrDataUrl: dataUrl,
          tableName: a.tableId ? (tableMap.get(a.tableId) ?? null) : null,
          seatLabel: a.seatId ? (seatMap.get(a.seatId) ?? null) : null,
        };
      }),
    );

    const html = this.buildPrintHtml(items);
    return Buffer.from(html, "utf-8");
  }

  async generateEventQr(eventId: string, userId: string): Promise<Buffer> {
    await this.requireMember(eventId, userId);

    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");

    const appUrl = process.env.APP_URL ?? process.env.AUTH_URL ?? "http://localhost:3005";
    const url = `${appUrl}/join/event/${eventId}`;
    return QRCode.toBuffer(url, { type: "png", width: 300, margin: 2 });
  }

  private escapeHtml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  private buildPrintHtml(
    items: { id: string; name: string; qrDataUrl: string; tableName: string | null; seatLabel: string | null }[],
  ): string {
    const cards = items
      .map((item) => {
        const safeName = this.escapeHtml(item.name);
        const safeTable = item.tableName ? this.escapeHtml(item.tableName) : null;
        const safeSeat = item.seatLabel ? this.escapeHtml(item.seatLabel) : null;
        const seatingLine = [safeTable, safeSeat].filter(Boolean).join(" · ");
        return `
      <div class="card">
        <img src="${item.qrDataUrl}" alt="QR for ${safeName}" />
        <p class="name">${safeName}</p>
        ${seatingLine ? `<p class="seat">${seatingLine}</p>` : ""}
      </div>`;
      })
      .join("");

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>QR Codes</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: sans-serif; margin: 0; padding: 20px; background: #fff; }
  .print-btn { display: inline-block; margin-bottom: 20px; padding: 10px 24px; background: #111; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; }
  .print-btn:hover { background: #333; }
  .grid { display: flex; flex-wrap: wrap; gap: 20px; }
  .card { text-align: center; border: 1px solid #ddd; border-radius: 8px; padding: 16px; width: 200px; }
  .card img { width: 160px; height: 160px; display: block; margin: 0 auto; }
  .card .name { margin: 10px 0 0; font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .card .seat { margin: 4px 0 0; font-size: 11px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  @media print {
    @page { size: A4; margin: 15mm; }
    body { padding: 0; }
    .print-btn { display: none; }
    .grid { gap: 12px; }
    .card { break-inside: avoid; border: 1px solid #ccc; }
  }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">Print QR Codes</button>
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
