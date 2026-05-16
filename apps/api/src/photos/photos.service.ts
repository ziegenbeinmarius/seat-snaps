import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { randomUUID } from "crypto";
import sharp from "sharp";
import type { Photo } from "@seat-snaps/db";
import type { IPhotoRepository, PhotoStatus } from "../domain/repositories/IPhotoRepository";
import { PHOTO_REPOSITORY } from "../domain/repositories/IPhotoRepository";
import type { IAttendeeRepository } from "../domain/repositories/IAttendeeRepository";
import { ATTENDEE_REPOSITORY } from "../domain/repositories/IAttendeeRepository";
import type { IEventRepository } from "../domain/repositories/IEventRepository";
import { EVENT_REPOSITORY } from "../domain/repositories/IEventRepository";
import type { IS3Service } from "../infrastructure/s3/IS3Service";
import { S3_SERVICE } from "../infrastructure/s3/IS3Service";
import type { IPhotoService, UploadUrlResult, PhotoWithUrl } from "./domain/IPhotoService";
import { MAX_UPLOAD_SIZE } from "./dto/request-upload-url.dto";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

@Injectable()
export class PhotosService implements IPhotoService {
  constructor(
    @Inject(PHOTO_REPOSITORY) private readonly photoRepository: IPhotoRepository,
    @Inject(ATTENDEE_REPOSITORY) private readonly attendeeRepository: IAttendeeRepository,
    @Inject(EVENT_REPOSITORY) private readonly eventRepository: IEventRepository,
    @Inject(S3_SERVICE) private readonly s3: IS3Service,
  ) {}

  async requestUploadUrl(
    eventId: string,
    contentType: string,
    attendeeId: string,
    contentLength?: number,
  ): Promise<UploadUrlResult> {
    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new BadRequestException("Unsupported content type");
    }

    if (contentLength != null && contentLength > MAX_UPLOAD_SIZE) {
      throw new BadRequestException(`File size exceeds maximum of ${MAX_UPLOAD_SIZE / (1024 * 1024)}MB`);
    }

    const attendee = await this.attendeeRepository.findById(attendeeId);
    if (!attendee || attendee.eventId !== eventId) {
      throw new NotFoundException("Attendee not found");
    }

    const existing = await this.photoRepository.findByAttendeeId(attendeeId);
    const activePhotos = existing.filter((p) => p.status !== "deleted" && p.status !== "rejected");
    if (activePhotos.length >= attendee.photoLimit) {
      throw new BadRequestException(
        `Photo limit reached (${attendee.photoLimit} photos per attendee)`,
      );
    }

    const ext = contentType.split("/")[1] ?? "jpg";
    const key = `events/${eventId}/photos/${randomUUID()}.${ext}`;

    const photo = await this.photoRepository.create({
      eventId,
      attendeeId,
      s3Key: key,
      status: "pending",
    });

    const uploadUrl = await this.s3.getSignedUploadUrl(key, contentType, undefined, contentLength);
    return { uploadUrl, key, photoId: photo.id };
  }

  async confirmUpload(
    eventId: string,
    photoId: string,
    attendeeId: string,
  ): Promise<PhotoWithUrl> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId || photo.attendeeId !== attendeeId) {
      throw new NotFoundException("Photo not found");
    }
    if (photo.status !== "pending") {
      throw new BadRequestException("Photo already confirmed");
    }

    // Generate thumbnail
    let thumbnailKey: string | undefined;
    try {
      const ext = photo.s3Key.split(".").pop() ?? "jpg";
      thumbnailKey = photo.s3Key.replace(`.${ext}`, `_thumb.${ext}`);

      // Download original from S3
      const downloadUrl = await this.s3.getSignedDownloadUrl(photo.s3Key, 60);
      const response = await fetch(downloadUrl);
      if (response.ok) {
        const buffer = Buffer.from(await response.arrayBuffer());
        const thumbBuffer = await sharp(buffer)
          .resize(400, 400, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
        await this.s3.putObject(thumbnailKey, thumbBuffer, "image/jpeg");
      } else {
        thumbnailKey = undefined;
      }
    } catch {
      thumbnailKey = undefined;
    }

    // Update photo to approved (auto-approve on confirm)
    const updated = await this.photoRepository.updateStatus(photoId, "approved");
    const withThumb = thumbnailKey
      ? await this.updateThumbnailKey(photoId, thumbnailKey, updated)
      : updated;

    const attendee = await this.attendeeRepository.findById(attendeeId);
    return this.attachUrls(withThumb, attendee?.name ?? "Unknown");
  }

  async listPhotos(
    eventId: string,
    requesterId: string,
    requesterType: "attendee" | "organizer",
  ): Promise<PhotoWithUrl[]> {
    let photos: Photo[];
    if (requesterType === "organizer") {
      photos = await this.photoRepository.findByEventId(eventId);
    } else {
      photos = await this.photoRepository.findByEventId(eventId, { status: "approved" });
    }

    const attendees = await this.attendeeRepository.findByEventId(eventId);
    const nameMap = new Map(attendees.map((a) => [a.id, a.name]));

    return Promise.all(
      photos.map((p) => this.attachUrls(p, nameMap.get(p.attendeeId) ?? "Unknown")),
    );
  }

  async listPhotosPaginated(
    eventId: string,
    requesterType: "attendee" | "organizer",
    page: number,
    limit: number,
  ) {
    const filters = requesterType === "attendee" ? { status: "approved" as const } : undefined;
    const offset = (page - 1) * limit;
    const [photos, total] = await Promise.all([
      this.photoRepository.findByEventIdPaginated(eventId, filters, limit, offset),
      this.photoRepository.countByEventId(eventId, filters),
    ]);

    const attendees = await this.attendeeRepository.findByEventId(eventId);
    const nameMap = new Map(attendees.map((a) => [a.id, a.name]));

    const data = await Promise.all(
      photos.map((p) => this.attachUrls(p, nameMap.get(p.attendeeId) ?? "Unknown")),
    );

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(
    eventId: string,
    photoId: string,
    status: PhotoStatus,
  ): Promise<PhotoWithUrl> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId) throw new NotFoundException("Photo not found");
    const attendee = await this.attendeeRepository.findById(photo.attendeeId);
    const updated = await this.photoRepository.updateStatus(photoId, status);
    return this.attachUrls(updated, attendee?.name ?? "Unknown");
  }

  async toggleHighlight(
    eventId: string,
    photoId: string,
    isHighlight: boolean,
  ): Promise<PhotoWithUrl> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId) throw new NotFoundException("Photo not found");
    if (photo.status !== "approved") {
      throw new BadRequestException("Only approved photos can be highlighted");
    }

    let highlightOrder: number | null = null;
    if (isHighlight) {
      const existing = await this.photoRepository.findByEventId(eventId, { isHighlight: true });
      highlightOrder = existing.length;
    }

    const updated = await this.photoRepository.updateHighlight(photoId, isHighlight, highlightOrder);
    const attendee = await this.attendeeRepository.findById(photo.attendeeId);
    return this.attachUrls(updated, attendee?.name ?? "Unknown");
  }

  async listHighlights(eventId: string): Promise<PhotoWithUrl[]> {
    const photos = await this.photoRepository.findByEventId(eventId, {
      status: "approved",
      isHighlight: true,
    });

    const attendees = await this.attendeeRepository.findByEventId(eventId);
    const nameMap = new Map(attendees.map((a) => [a.id, a.name]));

    return Promise.all(
      photos.map((p) => this.attachUrls(p, nameMap.get(p.attendeeId) ?? "Unknown")),
    );
  }

  async deletePhoto(eventId: string, photoId: string): Promise<void> {
    const photo = await this.photoRepository.findById(photoId);
    if (!photo || photo.eventId !== eventId) throw new NotFoundException("Photo not found");

    await this.s3.deleteObject(photo.s3Key).catch(() => undefined);
    if (photo.thumbnailKey) {
      await this.s3.deleteObject(photo.thumbnailKey).catch(() => undefined);
    }
    await this.photoRepository.delete(photoId);
  }

  private async attachUrls(photo: Photo, attendeeName: string): Promise<PhotoWithUrl> {
    const url = await this.s3.getSignedDownloadUrl(photo.s3Key);
    const thumbnailUrl = photo.thumbnailKey
      ? await this.s3.getSignedDownloadUrl(photo.thumbnailKey)
      : undefined;
    return { ...photo, url, thumbnailUrl, attendeeName };
  }

  private async updateThumbnailKey(
    photoId: string,
    thumbnailKey: string,
    photo: Photo,
  ): Promise<Photo> {
    // Direct DB update for thumbnail key — use repository
    const updated = await this.photoRepository.updateThumbnailKey(photoId, thumbnailKey);
    return updated ?? photo;
  }
}
