import type { Table } from "@seat-snaps/db";
import type { CreateTableInput, UpdateTableInput, BulkUpdateTablePositionsInput } from "@seat-snaps/shared";

export interface TableWithSeats extends Table {
  seats: import("@seat-snaps/db").Seat[];
}

export interface ITableService {
  listForEvent(eventId: string): Promise<TableWithSeats[]>;
  listPublic(eventId: string): Promise<TableWithSeats[]>;
  getById(tableId: string, eventId: string): Promise<TableWithSeats>;
  create(eventId: string, data: CreateTableInput): Promise<TableWithSeats>;
  update(tableId: string, eventId: string, data: UpdateTableInput): Promise<Table>;
  bulkUpdatePositions(eventId: string, positions: BulkUpdateTablePositionsInput): Promise<void>;
  delete(tableId: string, eventId: string): Promise<void>;
}

export const TABLE_SERVICE = Symbol("ITableService");
