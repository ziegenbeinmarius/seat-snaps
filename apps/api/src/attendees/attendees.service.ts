import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { parse } from "csv-parse/sync";
import type { Attendee } from "@seat-snaps/db";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { ISeatRepository } from "../domain/repositories/ISeatRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IAttendeeService } from "./domain/IAttendeeService";
import type { CreateAttendeeInput, UpdateAttendeeInput } from "@seat-snaps/shared";
import type { PaginatedResult } from "../common/dto/pagination-query.dto";

const MAX_IMPORT_ROWS = 5000;

@Injectable()
export class AttendeesService implements IAttendeeService {
  constructor(
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
    @Inject(SEAT_REPOSITORY)
    private readonly seatRepository: ISeatRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async listForEvent(eventId: string): Promise<Attendee[]> {
    return this.attendeeRepository.findByEventId(eventId);
  }

  async listForEventPaginated(eventId: string, page: number, limit: number): Promise<PaginatedResult<Attendee>> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.attendeeRepository.findByEventIdPaginated(eventId, limit, offset),
      this.attendeeRepository.countByEventId(eventId),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async listPublic(eventId: string): Promise<Pick<Attendee, "id" | "name" | "groupLabel" | "tableId">[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    const attendees = await this.attendeeRepository.findByEventId(eventId);
    return attendees.map(({ id, name, groupLabel, tableId }) => ({ id, name, groupLabel, tableId }));
  }

  async getById(attendeeId: string, eventId: string): Promise<Attendee> {
    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");
    return attendee;
  }

  async create(eventId: string, data: CreateAttendeeInput): Promise<Attendee> {
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

  async bulkImport(eventId: string, csv: string): Promise<Attendee[]> {
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
  ): Promise<Attendee> {
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

  async clearSeatAssignment(attendeeId: string, eventId: string): Promise<Attendee> {
    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");
    if (attendee.seatId) {
      await this.seatRepository.unassignAttendee(attendee.seatId);
    }
    return this.attendeeRepository.update(attendeeId, { tableId: null, seatId: null });
  }

  async delete(attendeeId: string, eventId: string): Promise<void> {
    const existing = await this.attendeeRepository.findById(attendeeId);
    if (!existing || existing.eventId !== eventId) throw new NotFoundException("Attendee not found");
    await this.attendeeRepository.delete(attendeeId);
  }

  async checkIn(eventId: string, qrToken: string): Promise<Attendee> {
    const attendee = await this.attendeeRepository.findByQrToken(qrToken);
    if (!attendee || attendee.eventId !== eventId) throw new NotFoundException("Attendee not found");
    return this.attendeeRepository.update(attendee.id, { checkedInAt: new Date() });
  }
}
