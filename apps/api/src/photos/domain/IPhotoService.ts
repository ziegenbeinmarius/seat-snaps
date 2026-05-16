import type { Photo } from "@seat-snaps/db";
import type { PhotoStatus } from "../../domain/repositories/IPhotoRepository";

export interface UploadUrlResult {
  uploadUrl: string;
  key: string;
  photoId: string;
}

export interface PhotoWithUrl extends Photo {
  url: string;
  thumbnailUrl?: string;
  attendeeName: string;
}

export interface IPhotoService {
  requestUploadUrl(
    eventId: string,
    contentType: string,
    attendeeId: string,
  ): Promise<UploadUrlResult>;
  confirmUpload(eventId: string, photoId: string, attendeeId: string): Promise<PhotoWithUrl>;
  listPhotos(eventId: string, requesterId: string, requesterType: "attendee" | "organizer"): Promise<PhotoWithUrl[]>;
  updateStatus(eventId: string, photoId: string, status: PhotoStatus): Promise<PhotoWithUrl>;
  toggleHighlight(eventId: string, photoId: string, isHighlight: boolean): Promise<PhotoWithUrl>;
  listHighlights(eventId: string): Promise<PhotoWithUrl[]>;
  deletePhoto(eventId: string, photoId: string): Promise<void>;
}

export const PHOTO_SERVICE = Symbol("IPhotoService");
