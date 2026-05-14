import { eq, and } from "@seat-snaps/db";
import type { Database, Photo, NewPhoto } from "@seat-snaps/db";
import { photos } from "@seat-snaps/db";
import type { IPhotoRepository, PhotoFilters, PhotoStatus } from "../../domain/repositories/IPhotoRepository";

export class DrizzlePhotoRepository implements IPhotoRepository {
  constructor(private readonly db: Database) {}

  async findById(id: string): Promise<Photo | null> {
    const result = await this.db.select().from(photos).where(eq(photos.id, id)).limit(1);
    return result[0] ?? null;
  }

  async findByEventId(eventId: string, filters?: PhotoFilters): Promise<Photo[]> {
    if (filters?.status) {
      return this.db
        .select()
        .from(photos)
        .where(and(eq(photos.eventId, eventId), eq(photos.status, filters.status)));
    }
    return this.db.select().from(photos).where(eq(photos.eventId, eventId));
  }

  async findByAttendeeId(attendeeId: string): Promise<Photo[]> {
    return this.db.select().from(photos).where(eq(photos.attendeeId, attendeeId));
  }

  async create(data: NewPhoto): Promise<Photo> {
    const result = await this.db.insert(photos).values(data).returning();
    return result[0];
  }

  async updateStatus(id: string, status: PhotoStatus): Promise<Photo> {
    const result = await this.db
      .update(photos)
      .set({ status })
      .where(eq(photos.id, id))
      .returning();
    if (!result[0]) throw new Error(`Photo ${id} not found`);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(photos).where(eq(photos.id, id));
  }
}
