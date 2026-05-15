import { eq, lt } from "@seat-snaps/db";
import type { Database, AttendeeSession, NewAttendeeSession } from "@seat-snaps/db";
import { attendeeSessions } from "@seat-snaps/db";
import type { IAttendeeSessionRepository } from "../../domain/repositories/IAttendeeSessionRepository";

export class DrizzleAttendeeSessionRepository implements IAttendeeSessionRepository {
  constructor(private readonly db: Database) {}

  async findByToken(token: string): Promise<AttendeeSession | null> {
    const result = await this.db
      .select()
      .from(attendeeSessions)
      .where(eq(attendeeSessions.token, token))
      .limit(1);
    return result[0] ?? null;
  }

  async findByAttendeeId(attendeeId: string): Promise<AttendeeSession[]> {
    return this.db
      .select()
      .from(attendeeSessions)
      .where(eq(attendeeSessions.attendeeId, attendeeId));
  }

  async create(data: NewAttendeeSession): Promise<AttendeeSession> {
    const result = await this.db.insert(attendeeSessions).values(data).returning();
    return result[0];
  }

  async deleteByToken(token: string): Promise<void> {
    await this.db.delete(attendeeSessions).where(eq(attendeeSessions.token, token));
  }

  async deleteExpired(): Promise<void> {
    await this.db.delete(attendeeSessions).where(lt(attendeeSessions.expiresAt, new Date()));
  }
}
