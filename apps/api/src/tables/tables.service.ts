import { Injectable, Inject, NotFoundException, ForbiddenException } from "@nestjs/common";
import type { Table } from "@seat-snaps/db";
import type { ITableRepository } from "../domain/repositories/ITableRepository";
import { TABLE_REPOSITORY } from "../domain/repositories/ITableRepository";
import type { ISeatRepository } from "../domain/repositories/ISeatRepository";
import { SEAT_REPOSITORY } from "../domain/repositories/ISeatRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IEventMembershipRepository } from "../domain/repositories/IEventMembershipRepository";
import { EVENT_MEMBERSHIP_REPOSITORY } from "../domain/repositories/IEventMembershipRepository";
import type { ITableService, TableWithSeats } from "./domain/ITableService";
import type { CreateTableInput, UpdateTableInput } from "@seat-snaps/shared";

@Injectable()
export class TablesService implements ITableService {
  constructor(
    @Inject(TABLE_REPOSITORY)
    private readonly tableRepository: ITableRepository,
    @Inject(SEAT_REPOSITORY)
    private readonly seatRepository: ISeatRepository,
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
    });
  }

  async delete(tableId: string, eventId: string, userId: string): Promise<void> {
    await this.requireMember(eventId, userId);
    const existing = await this.tableRepository.findById(tableId);
    if (!existing || existing.eventId !== eventId) throw new NotFoundException("Table not found");
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
