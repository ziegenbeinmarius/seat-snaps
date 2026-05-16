import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException, ConflictException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { parse } from "csv-parse/sync";
import type { Attendee } from "@seat-snaps/db";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { ISeatRepository } from "../domain/repositories/ISeatRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { IAttendeeService } from "./domain/IAttendeeService";
import type { CreateAttendeeInput, UpdateAttendeeInput } from "@seat-snaps/shared";

@Injectable()
export class AttendeesService implements IAttendeeService {
  constructor(
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
    @Inject(SEAT_REPOSITORY)
    private readonly seatRepository: ISeatRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
  ) {}

  async listForEvent(eventId: string, userId: string): Promise<Attendee[]> {
    await this.requireMember(eventId, userId);
    return this.attendeeRepository.findByEventId(eventId);
  }

  async listPublic(eventId: string): Promise<Pick<Attendee, "id" | "name" | "groupLabel" | "tableId" | "relationInfo" | "conversationStarters">[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    const attendees = await this.attendeeRepository.findByEventId(eventId);
    return attendees.map(({ id, name, groupLabel, tableId, relationInfo, conversationStarters }) => ({ id, name, groupLabel, tableId, relationInfo, conversationStarters }));
  }

  async getById(attendeeId: string, eventId: string, userId: string): Promise<Attendee> {
    await this.requireMember(eventId, userId);
    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");
    return attendee;
  }

  async create(eventId: string, data: CreateAttendeeInput, userId: string): Promise<Attendee> {
    await this.requireMember(eventId, userId);
    if (data.email) {
      const existing = await this.attendeeRepository.findByEventAndEmail(eventId, data.email);
      if (existing) throw new ConflictException("An attendee with this email already exists for this event");
    }
    return this.attendeeRepository.create({
      eventId,
      name: data.name,
      email: data.email ?? null,
      groupLabel: data.groupLabel ?? null,
      relationInfo: data.relationInfo ?? null,
      conversationStarters: data.conversationStarters ?? null,
      photoLimit: data.photoLimit ?? 10,
      qrToken: randomUUID(),
    });
  }

  async bulkImport(eventId: string, csv: string, userId: string): Promise<Attendee[]> {
    await this.requireMember(eventId, userId);

    const MAX_IMPORT_ROWS = 5000;

    const rows = parse(csv, { columns: true, skip_empty_lines: true, trim: true }) as {
      name?: string;
      email?: string;
      group?: string;
    }[];

    if (rows.length > MAX_IMPORT_ROWS) {
      throw new BadRequestException(`CSV import limited to ${MAX_IMPORT_ROWS} rows, got ${rows.length}`);
    }

    const created: Attendee[] = [];
    for (const row of rows) {
      if (!row.name) continue;
      if (row.email) {
        const existing = await this.attendeeRepository.findByEventAndEmail(eventId, row.email);
        if (existing) continue;
      }
      const attendee = await this.attendeeRepository.create({
        eventId,
        name: row.name,
        email: row.email ?? null,
        groupLabel: row.group ?? null,
        relationInfo: null,
        conversationStarters: null,
        photoLimit: 10,
        qrToken: randomUUID(),
      });
      created.push(attendee);
    }
    return created;
  }

  async update(
    attendeeId: string,
    eventId: string,
    data: UpdateAttendeeInput,
    userId: string,
  ): Promise<Attendee> {
    await this.requireMember(eventId, userId);
    const existing = await this.attendeeRepository.findById(attendeeId);
    if (!existing || existing.eventId !== eventId) throw new NotFoundException("Attendee not found");

    return this.attendeeRepository.update(attendeeId, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.groupLabel !== undefined && { groupLabel: data.groupLabel }),
      ...(data.relationInfo !== undefined && { relationInfo: data.relationInfo }),
      ...(data.conversationStarters !== undefined && {
        conversationStarters: data.conversationStarters,
      }),
      ...(data.photoLimit !== undefined && { photoLimit: data.photoLimit }),
    });
  }

  async clearSeatAssignment(attendeeId: string, eventId: string, userId: string): Promise<Attendee> {
    await this.requireMember(eventId, userId);
    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");
    if (attendee.seatId) {
      await this.seatRepository.unassignAttendee(attendee.seatId);
    }
    return this.attendeeRepository.update(attendeeId, { tableId: null, seatId: null });
  }

  async delete(attendeeId: string, eventId: string, userId: string): Promise<void> {
    await this.requireMember(eventId, userId);
    const existing = await this.attendeeRepository.findById(attendeeId);
    if (!existing || existing.eventId !== eventId) throw new NotFoundException("Attendee not found");
    await this.attendeeRepository.delete(attendeeId);
  }

  async checkIn(eventId: string, qrToken: string, userId: string): Promise<Attendee> {
    await this.requireMember(eventId, userId);
    const attendee = await this.attendeeRepository.findByQrToken(qrToken);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");
    return this.attendeeRepository.update(attendee.id, { checkedInAt: new Date() });
  }

  private async requireMember(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    const membership = await this.membershipRepository.findByUserAndEvent(userId, eventId);
    if (!membership) throw new ForbiddenException("Access denied");
  }
}
