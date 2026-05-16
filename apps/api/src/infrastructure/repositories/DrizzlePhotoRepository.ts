import { eq, and, asc, sql } from "@seat-snaps/db";
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
    const conditions = [eq(photos.eventId, eventId)];
    if (filters?.status) conditions.push(eq(photos.status, filters.status));
    if (filters?.isHighlight !== undefined) conditions.push(eq(photos.isHighlight, filters.isHighlight));

    const query = this.db.select().from(photos).where(and(...conditions));
    if (filters?.isHighlight) {
      return query.orderBy(asc(photos.highlightOrder), asc(photos.createdAt));
    }
    return query;
  }

  async findByEventIdPaginated(eventId: string, filters: PhotoFilters | undefined, limit: number, offset: number): Promise<Photo[]> {
    const conditions = [eq(photos.eventId, eventId)];
    if (filters?.status) conditions.push(eq(photos.status, filters.status));
    if (filters?.isHighlight !== undefined) conditions.push(eq(photos.isHighlight, filters.isHighlight));
    return this.db.select().from(photos).where(and(...conditions)).limit(limit).offset(offset);
  }

  async countByEventId(eventId: string, filters?: PhotoFilters): Promise<number> {
    const conditions = [eq(photos.eventId, eventId)];
    if (filters?.status) conditions.push(eq(photos.status, filters.status));
    if (filters?.isHighlight !== undefined) conditions.push(eq(photos.isHighlight, filters.isHighlight));
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(photos)
      .where(and(...conditions));
    return Number(result[0]?.count ?? 0);
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

  async updateThumbnailKey(id: string, thumbnailKey: string): Promise<Photo | null> {
    const result = await this.db
      .update(photos)
      .set({ thumbnailKey })
      .where(eq(photos.id, id))
      .returning();
    return result[0] ?? null;
  }

  async updateHighlight(id: string, isHighlight: boolean, highlightOrder?: number | null): Promise<Photo> {
    const result = await this.db
      .update(photos)
      .set({ isHighlight, highlightOrder: highlightOrder ?? null })
      .where(eq(photos.id, id))
      .returning();
    if (!result[0]) throw new Error(`Photo ${id} not found`);
    return result[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.delete(photos).where(eq(photos.id, id));
  }
}
