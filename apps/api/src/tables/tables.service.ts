import { Injectable, Inject, NotFoundException, BadRequestException } from "@nestjs/common";
import { type Database, type Table, seats, attendees, tables, eq, inArray } from "@seat-snaps/db";
import type { ITableRepository } from "../domain/repositories/ITableRepository";
import { TABLE_REPOSITORY } from "../domain/repositories/ITableRepository";
import type { ISeatRepository } from "../domain/repositories/ISeatRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import { DATABASE } from "../database/database.module";
import type { ITableService, TableWithSeats } from "./domain/ITableService";
import type { CreateTableInput, UpdateTableInput, BulkUpdateTablePositionsInput } from "@seat-snaps/shared";
import type { PaginatedResult } from "../common/dto/pagination-query.dto";

@Injectable()
export class TablesService implements ITableService {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
    @Inject(TABLE_REPOSITORY)
    private readonly tableRepository: ITableRepository,
    @Inject(SEAT_REPOSITORY)
    private readonly seatRepository: ISeatRepository,
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
  ) {}

  async listForEvent(eventId: string): Promise<TableWithSeats[]> {
    const tables = await this.tableRepository.findByEventId(eventId);
    return Promise.all(tables.map((t) => this.withSeats(t)));
  }

  async listForEventPaginated(eventId: string, page: number, limit: number): Promise<PaginatedResult<TableWithSeats>> {
    const offset = (page - 1) * limit;
    const [rawTables, total] = await Promise.all([
      this.tableRepository.findByEventIdPaginated(eventId, limit, offset),
      this.tableRepository.countByEventId(eventId),
    ]);
    const data = await Promise.all(rawTables.map((t) => this.withSeats(t)));
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async listPublic(eventId: string): Promise<TableWithSeats[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    const tables = await this.tableRepository.findByEventId(eventId);
    return Promise.all(tables.map((t) => this.withSeats(t)));
  }

  async getById(tableId: string, eventId: string): Promise<TableWithSeats> {
    const table = await this.tableRepository.findById(tableId);
    if (!table || table.eventId !== eventId) throw new NotFoundException("Table not found");
    return this.withSeats(table);
  }

  async create(eventId: string, data: CreateTableInput): Promise<TableWithSeats> {
    const table = await this.tableRepository.create({
      eventId,
      name: data.name,
      label: data.label ?? null,
      capacity: data.capacity ?? null,
      positionX: data.positionX ?? null,
      positionY: data.positionY ?? null,
      shape: data.shape ?? "rectangular",
      rotation: data.rotation ?? 0,
      width: data.width ?? null,
      height: data.height ?? null,
    });

    if (data.capacity && data.capacity > 0) {
      const seatValues = Array.from({ length: data.capacity }, (_, i) => ({
        tableId: table.id,
        eventId,
        label: `Seat ${i + 1}`,
        position: i + 1,
        attendeeId: null,
      }));
      await this.db.insert(seats).values(seatValues);
    }

    return this.withSeats(table);
  }

  async update(
    tableId: string,
    eventId: string,
    data: UpdateTableInput,
  ): Promise<Table> {
    const existing = await this.tableRepository.findById(tableId);
    if (!existing || existing.eventId !== eventId) throw new NotFoundException("Table not found");

    return this.tableRepository.update(tableId, {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.label !== undefined && { label: data.label }),
      ...(data.capacity !== undefined && { capacity: data.capacity }),
      ...(data.positionX !== undefined && { positionX: data.positionX }),
      ...(data.positionY !== undefined && { positionY: data.positionY }),
      ...(data.shape !== undefined && { shape: data.shape }),
      ...(data.rotation !== undefined && { rotation: data.rotation }),
      ...(data.width !== undefined && { width: data.width }),
      ...(data.height !== undefined && { height: data.height }),
    });
  }

  async bulkUpdatePositions(
    eventId: string,
    positions: BulkUpdateTablePositionsInput,
  ): Promise<void> {
    const eventTables = await this.tableRepository.findByEventId(eventId);
    const eventTableIds = new Set(eventTables.map((t) => t.id));
    const invalidIds = positions.filter((item) => !eventTableIds.has(item.tableId));
    if (invalidIds.length > 0) {
      throw new BadRequestException("One or more table IDs do not belong to this event");
    }

    await Promise.all(
      positions.map((item) =>
        this.tableRepository.update(item.tableId, {
          positionX: item.positionX,
          positionY: item.positionY,
          ...(item.rotation !== undefined && { rotation: item.rotation }),
        }),
      ),
    );
  }

  async delete(tableId: string, eventId: string): Promise<void> {
    const existing = await this.tableRepository.findById(tableId);
    if (!existing || existing.eventId !== eventId) throw new NotFoundException("Table not found");

    const tableSeats = await this.seatRepository.findByTableId(tableId);
    const assignedAttendeeIds = tableSeats
      .filter((s) => s.attendeeId)
      .map((s) => s.attendeeId!);

    await this.db.transaction(async (tx) => {
      if (assignedAttendeeIds.length > 0) {
        await tx
          .update(attendees)
          .set({ tableId: null, seatId: null })
          .where(inArray(attendees.id, assignedAttendeeIds));
      }
      await tx.delete(tables).where(eq(tables.id, tableId));
    });
  }

  private async withSeats(table: Table): Promise<TableWithSeats> {
    const seats = await this.seatRepository.findByTableId(table.id);
    return { ...table, seats };
  }
}
