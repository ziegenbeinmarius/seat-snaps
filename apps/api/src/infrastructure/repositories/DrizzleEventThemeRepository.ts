import { eq } from "@seat-snaps/db";
import type { Database, EventTheme } from "@seat-snaps/db";
import { eventThemes } from "@seat-snaps/db";
import type { IEventThemeRepository, UpdateEventThemeData } from "../../domain/repositories/IEventThemeRepository";

export class DrizzleEventThemeRepository implements IEventThemeRepository {
  constructor(private readonly db: Database) {}

  async findByEventId(eventId: string): Promise<EventTheme | null> {
    const result = await this.db
      .select()
      .from(eventThemes)
      .where(eq(eventThemes.eventId, eventId))
      .limit(1);
    return result[0] ?? null;
  }

  async upsert(eventId: string, data: UpdateEventThemeData): Promise<EventTheme> {
    const result = await this.db
      .insert(eventThemes)
      .values({ eventId, ...data })
      .onConflictDoUpdate({
        target: eventThemes.eventId,
        set: { ...data },
      })
      .returning();
    return result[0];
  }
}
