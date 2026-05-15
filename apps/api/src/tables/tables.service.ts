import { Injectable, Inject, NotFoundException, ForbiddenException, BadRequestException } from "@nestjs/common";
import type { Table } from "@seat-snaps/db";
import type { ITableRepository } from "../domain/repositories/ITableRepository";
import { TABLE_REPOSITORY } from "../domain/repositories/ITableRepository";
import type { ISeatRepository } from "../domain/repositories/ISeatRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { ITableService, TableWithSeats } from "./domain/ITableService";
import type { CreateTableInput, UpdateTableInput, BulkUpdateTablePositionsInput } from "@seat-snaps/shared";

@Injectable()
export class TablesService implements ITableService {
  constructor(
    @Inject(TABLE_REPOSITORY)
    private readonly tableRepository: ITableRepository,
    @Inject(SEAT_REPOSITORY)
    private readonly seatRepository: ISeatRepository,
    @Inject(ATTENDEE_REPOSITORY)
    private readonly attendeeRepository: IAttendeeRepository,
    @Inject(EVENT_REPOSITORY)
    private readonly eventRepository: IEventRepository,
    @Inject(EVENT_MEMBERSHIP_REPOSITORY)
    private readonly membershipRepository: IEventMembershipRepository,
  ) {}

  async listForEvent(eventId: string, userId: string): Promise<TableWithSeats[]> {
    await this.requireMember(eventId, userId);
    const tables = await this.tableRepository.findByEventId(eventId);
    return Promise.all(tables.map((t) => this.withSeats(t)));
  }

  async listPublic(eventId: string): Promise<TableWithSeats[]> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    const tables = await this.tableRepository.findByEventId(eventId);
    return Promise.all(tables.map((t) => this.withSeats(t)));
  }

  async getById(tableId: string, eventId: string, userId: string): Promise<TableWithSeats> {
    await this.requireMember(eventId, userId);
    const table = await this.tableRepository.findById(tableId);
    if (!table || table.eventId !== eventId) throw new NotFoundException("Table not found");
    return this.withSeats(table);
  }

  async create(eventId: string, data: CreateTableInput, userId: string): Promise<TableWithSeats> {
    await this.requireMember(eventId, userId);
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
      for (let i = 1; i <= data.capacity; i++) {
        await this.seatRepository.create({
          tableId: table.id,
          eventId,
          label: `Seat ${i}`,
          position: i,
          attendeeId: null,
        });
      }
    }

    return this.withSeats(table);
  }

  async update(
    tableId: string,
    eventId: string,
    data: UpdateTableInput,
    userId: string,
  ): Promise<Table> {
    await this.requireMember(eventId, userId);
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
    userId: string,
  ): Promise<void> {
    await this.requireMember(eventId, userId);

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

  async delete(tableId: string, eventId: string, userId: string): Promise<void> {
    await this.requireMember(eventId, userId);
    const existing = await this.tableRepository.findById(tableId);
    if (!existing || existing.eventId !== eventId) throw new NotFoundException("Table not found");

    // Clear denormalized tableId/seatId on any attendees assigned to this table's seats
    const seats = await this.seatRepository.findByTableId(tableId);
    await Promise.all(
      seats
        .filter((s) => s.attendeeId)
        .map((s) => this.attendeeRepository.update(s.attendeeId!, { tableId: null, seatId: null })),
    );

    await this.tableRepository.delete(tableId);
  }

  private async withSeats(table: Table): Promise<TableWithSeats> {
    const seats = await this.seatRepository.findByTableId(table.id);
    return { ...table, seats };
  }

  private async requireMember(eventId: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new NotFoundException("Event not found");
    const membership = await this.membershipRepository.findByUserAndEvent(userId, eventId);
    if (!membership) throw new ForbiddenException("Access denied");
  }
}
