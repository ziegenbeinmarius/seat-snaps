import type { Table, NewTable } from "@seat-snaps/db";

export type UpdateTableData = Partial<
  Pick<NewTable, "name" | "label" | "capacity" | "positionX" | "positionY">
>;

export interface ITableRepository {
  findById(id: string): Promise<Table | null>;
  findByEventId(eventId: string): Promise<Table[]>;
  create(data: NewTable): Promise<Table>;
  update(id: string, data: UpdateTableData): Promise<Table>;
  delete(id: string): Promise<void>;
}

export const TABLE_REPOSITORY = Symbol("ITableRepository");
