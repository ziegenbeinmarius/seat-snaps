import type { Photo, NewPhoto } from "@seat-snaps/db";

export type PhotoStatus = "pending" | "approved" | "rejected" | "deleted";

export interface PhotoFilters {
  status?: PhotoStatus;
}

export interface IPhotoRepository {
  findById(id: string): Promise<Photo | null>;
  findByEventId(eventId: string, filters?: PhotoFilters): Promise<Photo[]>;
  findByAttendeeId(attendeeId: string): Promise<Photo[]>;
  create(data: NewPhoto): Promise<Photo>;
  updateStatus(id: string, status: PhotoStatus): Promise<Photo>;
  updateThumbnailKey(id: string, thumbnailKey: string): Promise<Photo | null>;
  delete(id: string): Promise<void>;
}

export const PHOTO_REPOSITORY = Symbol("IPhotoRepository");
