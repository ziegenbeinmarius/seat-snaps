import { eq, sql } from "@seat-snaps/db";
import type { Database, Table, NewTable } from "@seat-snaps/db";
import { tables } from "@seat-snaps/db";
import type { ITableRepository, UpdateTableData } from "../../domain/repositories/ITableRepository";

export class DrizzleTableRepository implements ITableRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Table | null> {
    const result = await this.db.select().from(tables).where(eq(tables.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByEventId(eventId: string): Promise<Table[]> {
    return this.db.select().from(tables).where(eq(tables.eventId, eventId));
  }

  async findByEventIdPaginated(eventId: string, limit: number, offset: number): Promise<Table[]> {
    return this.db
      .select()
      .from(tables)
      .where(eq(tables.eventId, eventId))
      .limit(limit)
      .offset(offset);
  }

  async countByEventId(eventId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(tables)
      .where(eq(tables.eventId, eventId));
    return Number(result[0]?.count ?? 0);
  }

  async create(data: NewTable): Promise<Table> {
    const result = await this.db.insert(tables).values(data).returning();
    return result[0];
  }

  async update(id: string, data: UpdateTableData): Promise<Table> {
    const result = await this.db
      .update(tables)
      .set(data)
      .where(eq(tables.id, id))
      .returning();
    if (!result[0]) throw new Error(`Table ${id} not found`);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(tables).where(eq(tables.id, id));
  }
}
