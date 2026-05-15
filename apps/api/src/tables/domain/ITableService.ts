import type { Table } from "@seat-snaps/db";
import type { CreateTableInput, UpdateTableInput, BulkUpdateTablePositionsInput } from "@seat-snaps/shared";

export interface TableWithSeats extends Table {
  seats: import("@seat-snaps/db").Seat[];
}

export interface ITableService {
  listForEvent(eventId: string, userId: string): Promise<TableWithSeats[]>;
  listPublic(eventId: string): Promise<TableWithSeats[]>;
  getById(tableId: string, eventId: string, userId: string): Promise<TableWithSeats>;
  create(eventId: string, data: CreateTableInput, userId: string): Promise<TableWithSeats>;
  update(tableId: string, eventId: string, data: UpdateTableInput, userId: string): Promise<Table>;
  bulkUpdatePositions(eventId: string, positions: BulkUpdateTablePositionsInput, userId: string): Promise<void>;
  delete(tableId: string, eventId: string, userId: string): Promise<void>;
}

export const TABLE_SERVICE = Symbol("ITableService");
